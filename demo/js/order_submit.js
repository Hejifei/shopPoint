'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var balancelist = '';
var addinfo = '';
var proinfo = '';
var orderSumType = ''; //1 购物车下单  2、立即购买
var addressid = ''; //若指定地址 就用指定的地址 否则用默认地址
var postType = []; //快递方式list
var proPostType = ''; //快递方式
var freight_type0 = ''; //快递费
var thisorderAllpm = 0; //该订单总的快递费
var submiting = false;

$(function () {
  if (!isWechat) {
    // 顶部高度计算
    $('.navigation').css({
      height: ((90 + statusBarHeight) / 75).toFixed(4) + 'rem',
      'padding-top': (statusBarHeight / 75).toFixed(4) + 'rem'
    });
    $('.order_content').css({
      'padding-top': ((90 + statusBarHeight) / 75).toFixed(4) + 'rem'
    });
  }
  $('.navigation').css('visibility', 'visible');
  $('.order_content').css('visibility', 'visible');

  orderSumType = getUrl(location.href).orderSumType;
  addressid = getUrl(location.href).addressid;

  if (orderSumType === '2') {
    // 商品详情立即购买过来
    proinfo = JSON.parse(sessionStorage.proInfo);
    Promise.all([buynowInfo(proinfo), listAddressInfo()]).then(function () {
      $('.address').css('visibility', 'visible');
      $('.shopprolist .shop_pro').each(function () {
        if ($(this).find('.pass_way').attr('deliverymethod') === '0') {
          postMoneyCount($(this).find('.pass_way').attr('shopproc'), $(this).find('.pass_way'));
        } else {
          $(this).find('.pass_way').attr('postagecount', 0);
        }
      });
      setTimeout(function () {
        shopcarMoneysum();
      }, 300);
    }).catch(function () {
      $('.address').css('visibility', 'visible');
      shopcarMoneysum();
    });
  } else {
    // 购物车过来
    balancelist = getUrl(location.href).balancelist.split(',');
    // 获取地址列表，购物车列表，判定配送方式是否显示，快递费计算,计算总金额
    Promise.all([listAddressInfo(), shopcarlistGet()]).then(function () {
      $('.address').css('visibility', 'visible');
      $('.shopprolist .shop_pro').each(function () {
        if ($(this).find('.goodsMan').length === 0) {
          $(this).remove();
        } else {
          if ($(this).find('.pass_way').attr('deliverymethod') === '0') {
            postMoneyCount($(this).find('.pass_way').attr('shopproc'), $(this).find('.pass_way'));
          } else {
            $(this).find('.pass_way').attr('postagecount', 0);
          }
        }
      });
      setTimeout(function () {
        $('.shopprolist .shop_pro').each(function () {
          if ($(this).find('.goodsMan').length === 0) {
            $(this).remove();
          }
        });
        shopcarMoneysum();
      }, 300);
    }).catch(function () {
      $('.address').css('visibility', 'visible');
      setTimeout(function () {
        $('.shopprolist .shop_pro').each(function () {
          if ($(this).find('.goodsMan').length === 0) {
            $(this).remove();
          }
        });
        shopcarMoneysum();
      }, 300);
    });
  }

  // 配送方式
  $('.shopprolist').delegate('.pass_way', 'click', function (el) {
    if ($(this).attr('deliverymethod') === '3') {
      shipMethod($(this), $(this).attr('delmetsel'), $(this).attr('postagecount'));
    }
  });
  $('body').delegate('.shipselC .row', 'click', function () {
    $('.checkseled').removeClass('checkseled');
    $(this).find('.ifcheck').addClass('checkseled');
  });

  // 收货地址修改
  $('.address a').click(function () {
    location.href = './address_list.html?balancelist=' + getUrl(location.href).balancelist + '&orderSumType=' + orderSumType;
  });
});

// 配送方式
var shipMethod = function shipMethod(el, valsel, postPrice) {
  console.log('弹框出现');
  if (addinfo === '') {
    layer.open({
      content: '请先选择收货地址！',
      skin: 'msg',
      time: 2 //2秒后自动关闭
    });
  } else {
    layer.open({
      type: 1,
      content: '\n            <div class=\'shipmetC\'>\n                <div class=\'title\'>\u914D\u9001\u65B9\u5F0F</div>\n                <div class=\'shipselC\'>\n                    <label class=\'row\'><div>\u5FEB\u9012</div><div class=\'ifcheck checksel ' + (valsel === '0' ? 'checkseled' : '') + '\'  value=\'0\'><input type=\'radio\' name=\'shiptype\' value=\'0\' ' + (valsel === '0' ? 'checked' : '') + '/></div></label>\n                    <label class=\'row\'><div>\u81EA\u63D0</div><div class=\'ifcheck checksel ' + (valsel === '1' ? 'checkseled' : '') + '\'  value=\'1\'><input type=\'radio\' name=\'shiptype\' value=\'1\' ' + (valsel === '1' ? 'checked' : '') + '/></div></label>\n                </div>\n                <div class=\'shipSubC\'>\n                    <a>\u786E\u8BA4</a>\n                </div>\n            </div>\n            ',
      anim: 'up',
      style: 'position:fixed; bottom:0; left:0; width: 100%; padding:0.266667rem 0; border:none;'
    });
    $('.layui-m-layercont').addClass('layernormal');
    $('.shipSubC').click(function () {
      if ($('.shipselC .checkseled').length > 0) {
        proPostType = $('.shipselC .checkseled').attr('value');
        el.attr('delmetsel', proPostType);
        el.find('.way').html((proPostType === '0' ? '快递' : '自提') + '<img src="../images/general_next.png" alt="">');
        layer.closeAll();
        if (proPostType === '0') {
          postMoneyCount(el.attr('shopproc'), el, 1);
          $('.address').show();
          el.siblings('.getshop').hide();
          el.siblings('.timepicker').hide();
        } else {
          el.attr('cansel', '');
          var ifCanBuy = true;
          $('.shopprolist .shop_pro').each(function () {
            if ($(this).find('.pass_way').attr('cansel') === 'no') {
              ifCanBuy = false;
            }
          });
          if (ifCanBuy) {
            $('.submit .submit_btn').css({
              background: '#009943'
            });
            $('.submit .submit_btn').attr('onclick', 'OrderSub()');
          }

          shopcarMoneysum();
          // 如果只有一件商品 且是自提或到店消费的  收货地址隐藏
          if ($('.shopprolist .shop_pro').length === 1) {
            $('.address').hide();
          }
          el.siblings('.getshop').show();
          el.siblings('.timepicker').show();
        }
      }
    });
  }
};

// 获取地址
function listAddressInfo() {
  return new Promise(function (resolve, reject) {
    var param = {
      url: 'get/shop/user/listAddressInfo',
      type: '',
      data: {
        memId: memidGet()
      }
    };
    ajaxJS(param, function (res) {
      if (res.code === '0') {
        var addlist = '';
        if (res.data.length > 0) {
          for (var i in res.data) {
            if (Number(addressid) !== undefined && Number(addressid) === res.data[i].addressId) {
              // 若指定地址 用指定地址
              addinfo = res.data[i];
              addlist += '\n                                <div class="detail">\n                                    <div class="person">\n                                        <div class="name">\u6536\u8D27\u4EBA:' + res.data[i].consignee + '</div>\n                                        <div class="phone">' + res.data[i].phone + '</div>\n                                    </div>\n                                    <div class="address_detail">\n                                        <div>\u6536\u8D27\u5730\u5740:' + res.data[i].area + ' ' + res.data[i].detailAddress + '</div>\n                                        <div class="img"><img src="../images/general_next.png" alt=""></div>\n                                    </div>\n                                </div>\n                            ';
            } else if (addressid === undefined && res.data[i].defaultStatus === 1) {
              // 否则默认地址
              addinfo = res.data[i];
              addlist += '\n                            <div class="detail">\n                                <div class="person">\n                                    <div class="name">\u6536\u8D27\u4EBA:' + res.data[i].consignee + '</div>\n                                    <div class="phone">' + res.data[i].phone + '</div>\n                                </div>\n                                <div class="address_detail">\n                                    <div>\u6536\u8D27\u5730\u5740:' + res.data[i].area + ' ' + res.data[i].detailAddress + '</div>\n                                    <div class="img"><img src="../images/general_next.png" alt=""></div>\n                                </div>\n                            </div>\n                            ';
            }
          }
        }
        if (addlist === '') {
          addlist = '\n                    <div class="detail">\n                        <div class="address_detail noaddress">\n                            <div>\u8BF7\u6DFB\u52A0\u6536\u8D27\u5730\u5740</div>\n                            <div class="img"><img src="../images/general_next.png" alt=""></div>\n                        </div>\n                    </div>\n                    ';
        }
        $('.address a').append(addlist);
        // console.log(addinfo)
        // console.log(res.data.length > 0 , addinfo !== '')
        if (res.data.length > 0 && addinfo !== '') {
          resolve();
        } else {
          reject();
        }
      }
      $('.address').css('visibility', 'visible');
    }, function (error) {
      layer.open({
        content: error.msg,
        skin: 'msg',
        time: 2 //2秒后自动关闭
      });
    });
  });
}

// 获取地址栏参数
var getUrl = function getUrl(url) {
  url = !url ? location.search : url;
  var temp = {};
  if (url.indexOf('?') != -1) {
    var params = url.substr(url.indexOf('?') + 1).split('&');
    for (var i = 0; i < params.length; i++) {
      var param = params[i].split('=');
      temp[param[0]] = param[1];
    }
    return temp;
  } else {
    return false;
  }
};

// 来自购物车列表
var shopcarlistGet = function shopcarlistGet() {
  return new Promise(function (resolve, reject) {
    var param = {
      url: 'get/shop/order/listShopCart',
      type: '',
      data: {
        memId: memidGet()
      }
    };
    ajaxJS(param, function (res) {
      var resEdit = res.data;
      var newResdata = [];
      if (resEdit.length > 0) {
        // deliveryMethod 0 快递 1 自提 2 到店消费 3 快递+自提
        for (var i in resEdit) {
          var shopdelivery = [[], [], [], []];
          // console.log(resEdit[i].product)
          for (var j in resEdit[i].product) {
            if (resEdit[i].product[j].goodsType === 1) {
              resEdit[i].product[j].deliveryMethod = '2';
            } else {
              resEdit[i].product[j].deliveryMethod = resEdit[i].product[j].deliveryMethod === '0,1' ? '3' : resEdit[i].product[j].deliveryMethod;
            }
            var newlist = shopdelivery[resEdit[i].product[j].deliveryMethod];
            newlist.push(resEdit[i].product[j]);
          }
          for (var k in shopdelivery) {
            if (shopdelivery[k].length !== 0) {
              var newshop = cloneObj(resEdit[i]);
              newshop.product = shopdelivery[k];
              newResdata.push(newshop);
            }
          }
        }
      }
      res.data = newResdata;
      var arrlist = '';
      var shoplist = [];
      if (res.data.length > 0) {
        var _loop = function _loop(_i) {
          // console.log(res.data[i])
          var shopproC = [];
          arrlist += '<div class="shop_pro">';

          if (res.data[_i].product[0].deliveryMethod === '1' || res.data[_i].product[0].deliveryMethod === '3') {
            // 除快递外 其他配送方式都要添加自提地址
            arrlist += '\n                <div class="getshop getshop_' + _i + '">\n                  <h3>\u60A8\u7684\u8BA2\u5355\u9700\u8981\u5230\u6307\u5B9A\u95E8\u5E97\u81EA\u63D0</h3>\n                  <div class="shopName">\u81EA\u63D0\u95E8\u5E97:' + res.data[_i].shopName + '</div>\n                  <div class="shopAdd">\u95E8\u5E97\u5730\u5740:' + res.data[_i].shopAddress + '</div>\n                </div>';
          } else if (res.data[_i].product[0].deliveryMethod === '2') {
            // 除快递外 其他配送方式都要添加自提地址
            arrlist += '\n                <div class="getshop">\n                  <h3>\u60A8\u7684\u8BA2\u5355\u9700\u8981\u5230\u6307\u5B9A\u95E8\u5E97\u6D88\u8D39</h3>\n                  <div class="shopName">\u95E8\u5E97\u540D\u79F0:' + res.data[_i].shopName + '</div>\n                  <div class="shopAdd">\u95E8\u5E97\u5730\u5740:' + res.data[_i].shopAddress + '</div>\n                </div>';
          }
          arrlist += '\n                        <div class="shop" shopId=\'' + res.data[_i].shopId + '\' shopName=\'' + res.data[_i].shopName + '\'><a href="./shop.html?shopId=' + res.data[_i].shopId + '"><img src="../images/shop_store.png" alt="">\n            <span>' + res.data[_i].shopName + '</span></a></div>\n                    ';
          for (var _j in res.data[_i].product) {
            if (balancelist.indexOf(String(res.data[_i].product[_j].cartId)) !== -1) {
              shopproC.push({
                productId: res.data[_i].product[_j].productId,
                number: res.data[_i].product[_j].number,
                goodsId: res.data[_i].product[_j].goodsId,
                shopId: res.data[_i].shopId
              });
              // 收集商品类型进行分析
              postType.push(res.data[_i].product[_j].goodsType);
              shoplist.push(res.data[_i].shopId);
              arrlist += '\n                            <div class="goodsMan">\n                                <div class="commodity">\n                                    <div class="img"><img class="lazy" data-original="' + res.data[_i].product[_j].goodsImageUrl + '"></div>\n                                    <div class="detail">\n                                        <div class="title">' + res.data[_i].product[_j].goodsName + '</div>\n                                        <div class="describe">' + res.data[_i].product[_j].productName + '</div>\n                                        <div class="prices">\n                                            <div>\n                                                <span class="price">\xA5 ' + res.data[_i].product[_j].amount + '</span>\n                                                ' + (res.data[_i].product[_j].integralAmount !== null && res.data[_i].product[_j].integralAmount !== '0.00' && res.data[_i].product[_j].integralAmount !== 0 ? '<span class="score">+积分:' + parseInt(res.data[_i].product[_j].integralAmount) + '</span>' : '') + '\n                                            </div>\n                                            <span class="num">x' + res.data[_i].product[_j].number + '</span>\n                                        </div>\n                                    </div>\n                                </div>\n                                <!--\u8D2D\u4E70\u6570\u91CF-->\n                                <div class="number_item">\n                                    <div class="buy_num_item">\u8D2D\u4E70\u6570\u91CF</div>\n                                    <div class="add">\n                                        <div class="numchange min"><img src="../images/shop_min_g.png" alt=""></div>\n                                        <div class="select_num" \n                                            cartId=\'' + res.data[_i].product[_j].cartId + '\'\n                                            shopId=\'' + res.data[_i].shopId + '\'\n                                            productId=\'' + res.data[_i].product[_j].productId + '\'\n                                            goodsId=\'' + res.data[_i].product[_j].goodsId + '\'\n                                            goodsName=\'' + res.data[_i].product[_j].goodsName + '\'\n                                            goodsImageUrl=\'' + res.data[_i].product[_j].goodsImageUrl + '\'\n                                            productName=\'' + res.data[_i].product[_j].productName + '\'\n                                            goodsType=\'' + res.data[_i].product[_j].goodsType + '\'\n                                            originalPrice=\'' + res.data[_i].product[_j].originalAmount + '\'\n                                            cartId=\'' + res.data[_i].product[_j].cartId + '\' \n                                            price=\'' + res.data[_i].product[_j].amount + '\' \n                                            ' + (res.data[_i].product[_j].sharerId ? "sharerId='" + res.data[_i].product[_j].sharerId + "'" : '') + '\n                                            integralAmount=\'' + (res.data[_i].product[_j].integralAmount === null || res.data[_i].product[_j].integralAmount === '0.00' ? '0' : parseInt(res.data[_i].product[_j].integralAmount)) + '\' >' + res.data[_i].product[_j].number + '</div>\n                                        <div class="numchange"><img src="../images/shop_plus_g.png" alt=""></div>\n                                    </div>\n                                </div> \n                            </div>\n                            ';
            }
          }
          var deliveryTxt = '';
          // deliveryMethod 0 快递 1 自提 2 到店消费 3 快递+自提
          switch (res.data[_i].product[0].deliveryMethod) {
            case '0':
              deliveryTxt = '快递';
              break;
            case '1':
              deliveryTxt = '自提';
              break;
            case '2':
              deliveryTxt = '到店消费';
              break;
            case '3':
              deliveryTxt = '请选择';
              break;
            default:
              break;
          }
          arrlist += '\n                    <a class="pass_way" deliveryMethod=\'' + res.data[_i].product[0].deliveryMethod + '\' delmetSel=\'\' shopproC=\'' + JSON.stringify(shopproC) + '\' >\n                        <div class="title">\u914D\u9001\u65B9\u5F0F</div>\n                        <div class="way">' + deliveryTxt + (res.data[_i].product[0].deliveryMethod === '3' ? '<img src="../images/general_next.png">' : '') + '</div>\n                    </a>';
          if (res.data[_i].product[0].deliveryMethod !== '0') {
            arrlist += '<div class="timepicker timepicker_' + _i + '">\n                            <div class="timeSelL">\u9884\u7EA6\u65F6\u95F4</div>\n                            <div class="timeSelR">\n                              <div  readonly="readonly" class="timeStart timeStart_' + _i + '" placeholder="\u9884\u7EA6\u5F00\u59CB\u65F6\u95F4">\n                                <span>\u9884\u7EA6\u5F00\u59CB\u65F6\u95F4</span>\n                              </div>\n                              \u81F3\n                              <div  readonly="readonly" class="timeEnd timeEnd_' + _i + '" placeholder="\u9884\u7EA6\u7ED3\u675F\u65F6\u95F4">\n                                <span>\u9884\u7EA6\u7ED3\u675F\u65F6\u95F4</span>\n                              </div>\n                            </div>\n                        </div>';
          }
          arrlist += '<div class="amount_total">\n                        <div>\u5171<span class="pronumAll"></span>\u4EF6\u5546\u54C1&nbsp;&nbsp;<span class="spanxj">\u5C0F\u8BA1</span>:<span class="price"></span></div>\n                    </div>\n                    ';
          arrlist += '</div>';
          setTimeout(function () {
            // 日期选择绑定
            var calendarStart = new datePicker();
            calendarStart.init({
              trigger: '.timeStart_' + _i /*按钮选择器，用于触发弹出插件*/
              , type: 'datetime' /*模式：date日期；datetime日期时间；time时间；ym年月；*/
              , minDate: today() /*最小日期*/
              , maxDate: '' /*最大日期*/
              , onSubmit: function onSubmit() {
                var theSelectData = calendarStart.value;
                if (time2unix(nowtime()) - time2unix($('.timeStart_' + _i).val()) > 0) {
                  layer.open({
                    content: '请选择有效的预约时间！',
                    skin: 'msg',
                    time: 2 //2秒后自动关闭
                  });
                  $('.timeStart_' + _i).val('');
                } else if ($('.timeEnd_' + _i).val() !== '' && time2unix($('.timeEnd_' + _i).val()) - time2unix($('.timeStart_' + _i).val()) < 0) {
                  layer.open({
                    content: '预约的开始时间必须早于结束时间！',
                    skin: 'msg',
                    time: 2 //2秒后自动关闭
                  });
                  $('.timeStart_' + _i).val('');
                } else {
                  $('.timeStart_' + _i).text($('.timeStart_' + _i).val());
                }
              },
              onClose: function onClose() {
                /*取消时触发事件*/
              }
            });
            var calendarEnd = new datePicker();
            calendarEnd.init({
              trigger: '.timeEnd_' + _i /*按钮选择器，用于触发弹出插件*/
              , type: 'datetime' /*模式：date日期；datetime日期时间；time时间；ym年月；*/
              , minDate: today() /*最小日期*/
              , maxDate: '' /*最大日期*/
              , onSubmit: function onSubmit() {
                if (time2unix(nowtime()) - time2unix($('.timeEnd_' + _i).val()) > 0) {
                  layer.open({
                    content: '请选择有效的预约时间！',
                    skin: 'msg',
                    time: 2 //2秒后自动关闭
                  });
                  $('.timeEnd_' + _i).val('');
                } else if ($('.timeStart_' + _i).val() !== '' && time2unix($('.timeEnd_' + _i).val()) - time2unix($('.timeStart_' + _i).val()) < 0) {
                  layer.open({
                    content: '预约的结束时间必须晚于开始时间！',
                    skin: 'msg',
                    time: 2 //2秒后自动关闭
                  });
                  $('.timeEnd_' + _i).val('');
                } else {
                  $('.timeEnd_' + _i).text($('.timeEnd_' + _i).val());
                }
              },
              onClose: function onClose() {
                /*取消时触发事件*/
              }
            });
            if (res.data[_i].product[0].deliveryMethod === '3') {
              $('.timepicker_' + _i).hide();
              $('.getshop_' + _i).hide();
            }
          }, 200);
        };

        // console.log(res.data)
        for (var _i in res.data) {
          _loop(_i);
        }
      } else {
        arrlist += '<div class="shopcarnone">\u8D2D\u7269\u8F66\u6682\u65E0\u5546\u54C1\uFF0C\u5FEB\u53BB\u6DFB\u52A0\u5427\uFF01</div>';
      }
      $('.shopprolist').html(arrlist);
      $('.shop_pro').each(function () {
        if (shoplist.indexOf(Number($(this).find('.shop').attr('shopId'))) === -1) {
          $(this).remove();
        }
      });
      Imglazy();
      // postTypeshow();
      resolve();
    }, function (error) {
      layer.open({
        content: error.msg,
        skin: 'msg',
        time: 2 //2秒后自动关闭
      });
    });
  });
};

// 来自商品立即购买
var buynowInfo = function buynowInfo(proinfo) {
  return new Promise(function (resolve, reject) {
    var arrlist = '<div class="shop_pro">';
    var shopproC = [];
    var deliveryTxt = '';
    // console.log(proinfo)
    proinfo.deliveryMethod = proinfo.deliveryMethod === '0,1' ? '3' : proinfo.deliveryMethod;
    // deliveryMethod 0 快递 1 自提 2 到店消费 3 快递+自提
    switch (proinfo.deliveryMethod) {
      case '0':
        deliveryTxt = '快递';
        break;
      case '1':
        deliveryTxt = '自提';
        break;
      case '2':
        deliveryTxt = '到店消费';
        break;
      case '3':
        deliveryTxt = '请选择';
        break;
      default:
        break;
    }
    if (proinfo.deliveryMethod === '1' || proinfo.deliveryMethod === '3') {
      // 除快递外 其他配送方式都要添加自提地址
      arrlist += '\n        <div class="getshop">\n          <h3>\u60A8\u7684\u8BA2\u5355\u9700\u8981\u5230\u6307\u5B9A\u95E8\u5E97\u81EA\u63D0</h3>\n          <div class="shopName">\u81EA\u63D0\u95E8\u5E97:' + proinfo.shopName + '</div>\n          <div class="shopAdd">\u95E8\u5E97\u5730\u5740:' + proinfo.shopAddres + '</div>\n        </div>';
    } else if (proinfo.deliveryMethod === '2') {
      // 除快递外 其他配送方式都要添加自提地址
      arrlist += '\n        <div class="getshop">\n          <h3>\u60A8\u7684\u8BA2\u5355\u9700\u8981\u5230\u6307\u5B9A\u95E8\u5E97\u6D88\u8D39</h3>\n          <div class="shopName">\u95E8\u5E97\u540D\u79F0:' + proinfo.shopName + '</div>\n          <div class="shopAdd">\u95E8\u5E97\u5730\u5740:' + proinfo.shopAddres + '</div>\n        </div>';
    }
    shopproC.push({
      productId: proinfo.productId,
      number: proinfo.number,
      goodsId: proinfo.goodsId,
      shopId: proinfo.shopId
    });
    arrlist += '\n            \n                <div class="shop" shopId=\'' + proinfo.shopId + '\' shopName=\'' + proinfo.shopName + '\'><a href="./shop.html?shopId=' + proinfo.shopId + '"><img src="' + proinfo.shopLogo + '" alt=""><span>' + proinfo.shopName + '</span></a></div>\n                <div class="goodsMan">\n                    <div class="commodity">\n                        <div class="img"><img class="lazy" data-original="' + proinfo.goodsImageUrl + '"></div>\n                        <div class="detail">\n                            <div class="title">' + proinfo.goodsName + '</div>\n                            <div class="describe">' + proinfo.productName + '</div>\n                            <div class="prices">\n                                <div>\n                                    <span class="price">\xA5 ' + proinfo.showPrice + '</span>\n                                    ' + (proinfo.intetral !== null && proinfo.intetral !== '0.00' && proinfo.intetral !== 0 ? '<span class="score">+积分:' + proinfo.intetral + '</span>' : '') + '\n                                </div>\n                                <span class="num">x' + proinfo.number + '</span>\n                            </div>\n                        </div>\n                    </div>\n                    <!--\u8D2D\u4E70\u6570\u91CF-->\n                    <div class="number_item">\n                        <div class="buy_num_item">\u8D2D\u4E70\u6570\u91CF</div>\n                        <div class="add">\n                            <div class="numchange min"><img src="../images/shop_min.png" alt=""></div>\n                            <div class="select_num" \n                                shopId=\'' + proinfo.shopId + '\'\n                                productId=\'' + proinfo.productId + '\'\n                                goodsId=\'' + proinfo.goodsId + '\'\n                                goodsName=\'' + proinfo.goodsName + '\'\n                                goodsImageUrl=\'' + proinfo.goodsImageUrl + '\'\n                                productName=\'' + proinfo.productName + '\'\n                                goodsType=\'' + proinfo.goodsType + '\'\n                                originalPrice=\'' + proinfo.originalPrice + '\'\n                                price=\'' + proinfo.showPrice + '\' \n                                ' + (proinfo.sharerId ? "sharerId='" + proinfo.sharerId + "'" : '') + '\n                                integralAmount=\'' + (proinfo.intetral === null || proinfo.intetral === '0.00' ? '0' : proinfo.intetral) + '\' >' + proinfo.number + '</div>\n                            <div class="numchange"><img src="../images/shop_plus.png" alt=""></div>\n                        </div>\n                    </div> \n                </div>\n                <a class="pass_way" deliveryMethod=\'' + proinfo.deliveryMethod + '\' delmetSel=\'\' shopproC=\'' + JSON.stringify(shopproC) + '\'>\n                    <div class="title">\u914D\u9001\u65B9\u5F0F</div>\n                    <div class="way">\n                    ' + deliveryTxt + '\n                    ' + (proinfo.deliveryMethod === '3' ? '<img src="../images/general_next.png" alt="">' : '') + '\n                    </div>\n                </a>';
    if (proinfo.deliveryMethod !== '0') {
      arrlist += '<div class="timepicker">\n                    <div class="timeSelL">\u9884\u7EA6\u65F6\u95F4</div>\n                    <div class="timeSelR">\n                      <div  readonly="readonly" class="timeStart" placeholder="\u9884\u7EA6\u5F00\u59CB\u65F6\u95F4">\n                        <span>\u9884\u7EA6\u5F00\u59CB\u65F6\u95F4</span>\n                      </div>\n                      \u81F3\n                      <div  readonly="readonly" class="timeEnd" placeholder="\u9884\u7EA6\u7ED3\u675F\u65F6\u95F4">\n                        <span>\u9884\u7EA6\u7ED3\u675F\u65F6\u95F4</span>\n                      </div>\n                    </div>\n                </div>';
    }
    arrlist += '<div class="amount_total">\n                    <div>\u5171<span class="pronumAll"></span>\u4EF6\u5546\u54C1&nbsp;&nbsp;<span class="spanxj">\u5C0F\u8BA1</span>:<span class="price"></span></div>\n                </div>\n            </div>\n        ';
    $('.shopprolist').html(arrlist);
    if (proinfo.deliveryMethod === '3') {
      $('.getshop').hide();
      $('.timepicker').hide();
    }
    if (proinfo.deliveryMethod === '1' || proinfo.deliveryMethod === '2') {
      $('.address').hide();
    }

    postType.push(proinfo.goodsType);
    resolve();
    Imglazy();

    var calendarStart = new datePicker();
    calendarStart.init({
      trigger: '.timeStart' /*按钮选择器，用于触发弹出插件*/
      , type: 'datetime' /*模式：date日期；datetime日期时间；time时间；ym年月；*/
      , minDate: today() /*最小日期*/
      , maxDate: '' /*最大日期*/
      , onSubmit: function onSubmit() {
        var theSelectData = calendarStart.value;
        if (time2unix(nowtime()) - time2unix($('.timeStart').val()) > 0) {
          layer.open({
            content: '请选择有效的预约时间！',
            skin: 'msg',
            time: 2 //2秒后自动关闭
          });
          $('.timeStart').val('');
        } else if ($('.timeEnd').val() !== '' && time2unix($('.timeEnd').val()) - time2unix($('.timeStart').val()) < 0) {
          layer.open({
            content: '预约的开始时间必须早于结束时间！',
            skin: 'msg',
            time: 2 //2秒后自动关闭
          });
          $('.timeStart').val('');
        } else {
          $('.timeStart').text($('.timeStart').val());
        }
      },
      onClose: function onClose() {
        /*取消时触发事件*/
      }
    });
    var calendarEnd = new datePicker();
    calendarEnd.init({
      trigger: '.timeEnd' /*按钮选择器，用于触发弹出插件*/
      , type: 'datetime' /*模式：date日期；datetime日期时间；time时间；ym年月；*/
      , minDate: today() /*最小日期*/
      , maxDate: '' /*最大日期*/
      , onSubmit: function onSubmit() {
        if (time2unix(nowtime()) - time2unix($('.timeEnd').val()) > 0) {
          layer.open({
            content: '请选择有效的预约时间！',
            skin: 'msg',
            time: 2 //2秒后自动关闭
          });
          $('.timeEnd').val('');
        } else if ($('.timeStart').val() !== '' && time2unix($('.timeEnd').val()) - time2unix($('.timeStart').val()) < 0) {
          layer.open({
            content: '预约的结束时间必须晚于开始时间！',
            skin: 'msg',
            time: 2 //2秒后自动关闭
          });
          $('.timeEnd').val('');
        } else {
          $('.timeEnd').text($('.timeEnd').val());
        }
      },
      onClose: function onClose() {
        /*取消时触发事件*/
      }
    });
  });
};

// 对象克隆
var cloneObj = function cloneObj(obj) {
  var str,
      newobj = obj.constructor === Array ? [] : {};
  if ((typeof obj === 'undefined' ? 'undefined' : _typeof(obj)) !== 'object') {
    return;
  } else if (window.JSON) {
    ;str = JSON.stringify(obj), //序列化对象
    newobj = JSON.parse(str); //还原
  } else {
    for (var i in obj) {
      newobj[i] = _typeof(obj[i]) === 'object' ? cloneObj(obj[i]) : obj[i];
    }
  }
  return newobj;
};

// 购物车金额计算公共方法
var shopcarMoneysum = function shopcarMoneysum() {
  var allmoney = 0;
  var allscore = 0;
  var pronumAll = 0;
  // deliveryMethod 0 快递 1 自提 2 到店消费 3 快递+自提
  var moneyifpost = 0;
  // deliveryMethod  为 3时，是否选择了快递
  var iftype3selp = false;
  var allpostMoney = 0;
  $('.shopprolist .shop_pro').each(function () {
    var onemoney = 0;
    var onescore = 0;
    var onepronum = 0;
    var moneyiftypeunsel = '';
    var ordPostMoney = 0;
    $(this).find('.goodsMan').each(function () {
      var select_num = $(this).find('.select_num');
      onepronum += Number(select_num.text());
      onemoney += Number(select_num.attr('price')) * Number(select_num.text());
      onescore += Number(select_num.attr('integralAmount')) * Number(select_num.text());
    });
    var deliveryMet = $(this).find('.pass_way').attr('deliverymethod');

    // 0 快递 1 自提
    if (deliveryMet === '3') {
      ordPostMoney += 0;
    } else {
      ordPostMoney += Number($(this).find('.pass_way').attr('postagecount') === undefined ? 0 : $(this).find('.pass_way').attr('postagecount'));
    }
    allpostMoney += ordPostMoney;
    // 选择快递方式下方显示是否包含邮费
    if (deliveryMet === '3' && $(this).find('.pass_way').attr('delmetSel') === '') {
      moneyiftypeunsel = '(不含运费)';
    } else if (deliveryMet === '3' && $(this).find('.pass_way').attr('delmetSel') === '0') {
      // 配送方式选择自提
      moneyiftypeunsel = '(不含运费)';
      iftype3selp = true;
      allpostMoney = thisorderAllpm;
    }
    if (deliveryMet === '0' || deliveryMet === '3' && $(this).find('.pass_way').attr('delmetSel') === '0') {
      moneyifpost++;
    }
    $(this).find('.amount_total .pronumAll').text(onepronum);
    if (moneyiftypeunsel !== '') {
      $(this).find('.amount_total .spanxj').text('小计' + moneyiftypeunsel);
    } else if (deliveryMet === '3' && $(this).find('.pass_way').attr('delmetSel') === '1') {
      $(this).find('.amount_total .spanxj').text('小计');
    }
    $(this).find('.amount_total .price').text('\uFFE5' + (onemoney + ordPostMoney).toFixed(2) + ' ' + (onescore > 0 ? '+' + onescore.toFixed(0) + '分' : ''));
    allmoney += onemoney;
    allscore += onescore;
    pronumAll += onepronum;
  });
  if (moneyifpost > 0) {
    $('.submit .title').text('合计金额(含运费):');
  } else {
    $('.submit .title').text('合计金额:');
  }
  if (iftype3selp) {
    allpostMoney = Number(thisorderAllpm);
  }
  $('.number_all').text('\uFFE5' + (allmoney + allpostMoney).toFixed(2) + ' ' + (allscore > 0 ? '+' + allscore.toFixed(0) + '分' : ''));
  $('.number_all').attr('allmoney', (allmoney + allpostMoney).toFixed(2));
  $('.number_all').attr('allscore', allscore.toFixed(0));
  exchangeIntegral(allmoney + allpostMoney);
};

var Imglazy = function Imglazy() {
  $("img.lazy").lazyload({
    placeholder: "../images/shop_nopic.png", //用图片提前占位
    // placeholder,值为某一图片路径.此图片用来占据将要加载的图片的位置,待图片加载时,占位图则会隐藏
    effect: "fadeIn", // 载入使用何种效果
    // effect(特效),值有show(直接显示),fadeIn(淡入),slideDown(下拉)等,常用fadeIn
    threshold: 20, // 提前开始加载
    // threshold,值为数字,代表页面高度.如设置为200,表示滚动条在离目标位置还有200的高度时就开始加载图片,可以做到不让用户察觉
    // event: 'sporty',  // 事件触发时才加载
    // event,值有click(点击),mouseover(鼠标划过),sporty(运动的),foobar(…).可以实现鼠标莫过或点击图片才开始加载,后两个值未测试…
    // container: $(".submit_box"),  // 对某容器中的图片实现效果
    // container,值为某容器.lazyload默认在拉动浏览器滚动条时生效,这个参数可以让你在拉动某DIV的滚动条时依次加载其中的图片
    failurelimit: 20, // 图片排序混乱时
    // failurelimit,值为数字.lazyload默认在找到第一张不在可见区域里的图片时则不再继续加载,但当HTML容器混乱的时候可能出现可见区域内图片并没加载出来的情况,failurelimit意在加载N张可见区域外的图片,以避免出现这个问题.
    skip_invisible: false
  });
};

// 计算可获得积分数
var exchangeIntegral = function exchangeIntegral(amount) {
  var param = {
    url: 'get/shop/order/exchangeIntegral',
    type: '',
    data: {
      amount: amount
    }
  };
  ajaxJS(param, function (res) {
    // console.log(res)
    $('.IntegralGet span').text(res.data + '积分');
    $('.IntegralGet').show();
  }, function (error) {
    layer.open({
      content: error.msg,
      skin: 'msg',
      time: 2 //2秒后自动关闭
    });
  });
};

// 购物车添加数量
var GoodsInCartChange = function GoodsInCartChange(cartId, num) {
  var param = {
    url: 'get/shop/order/addGoodsInCart',
    type: '',
    data: {
      cartId: cartId,
      number: num
    }
  };
  ajaxJS(param, function (res) {}, function (error) {
    layer.open({
      content: error.msg,
      skin: 'msg',
      time: 2 //2秒后自动关闭
    });
  });
};

// 快递费计算
var postMoneyCount = function postMoneyCount(postval, el, type) {
  return new Promise(function (resolve, reject) {
    var product = [];
    // 若type=1 则为配送方式选择为快递
    if (type === 1) {
      $('.shopprolist .shop_pro').each(function () {
        var delvMtd = $(this).find('.pass_way').attr('deliverymethod');
        if (delvMtd === '0' || delvMtd === '3' && $(this).find('.pass_way').attr('delmetsel') === '0') {
          var postdata = JSON.parse($(this).find('.pass_way').attr('shopproc'));
          for (var i in postdata) {
            var proson = new Object();
            proson.productId = postdata[i].productId;
            proson.goodsId = postdata[i].goodsId;
            proson.number = postdata[i].number;
            proson.shopId = postdata[i].shopId;
            product.push(proson);
          }
        }
      });
    } else {
      var postdata = JSON.parse(postval);
      for (var i in postdata) {
        var proson = new Object();
        proson.productId = postdata[i].productId;
        proson.goodsId = postdata[i].goodsId;
        proson.number = postdata[i].number;
        proson.shopId = postdata[i].shopId;
        product.push(proson);
      }
    }

    var param = {
      url: 'get/shop/order/countPostage',
      type: '',
      data: {
        product: product,
        addressId: addressid || addinfo.addressId
      }
    };
    ajaxJS(param, function (res) {
      el.attr('cansel', '');
      if (res.code === '0') {
        if (type === 1) {
          thisorderAllpm = res.data;
        } else {
          el.attr('postagecount', res.data);
          if (el.attr('deliverymethod') === '0') {
            el.find('.way').text('快递:' + res.data);
          }
        }
      } else {
        layer.open({
          content: res.msg,
          skin: 'msg',
          time: 2 //2秒后自动关闭
        });
      }
      resolve();
      setTimeout(function () {
        shopcarMoneysum();
      }, 200);
    }, function (error) {
      layer.open({
        content: error.msg,
        skin: 'msg',
        time: 2 //2秒后自动关闭
      });
      if (error.code === '30012') {
        el.attr('cansel', 'no');
        // 若不支持配送，置灰提交按钮
        $('.submit .submit_btn').css({
          background: 'grey'
        });
        $('.submit .submit_btn').attr('onclick', 'javascript:return false');
      }
    });
  });
};

//订单提交
var OrderSub = function OrderSub() {
  if (submiting === true) {
    layer.open({
      content: '请勿重复提交！',
      skin: 'msg',
      time: 2 //2秒后自动关闭
    });
    throw '';
  }
  $('.shopprolist .shop_pro').each(function () {
    // 之前下单只有快递的才要选择收货地址，现在所有配送方式都要选择收货地址
    if (($(this).find('.pass_way').attr('deliverymethod') === '0' || $(this).find('.pass_way').attr('deliverymethod') === '3') && addinfo === '') {
      layer.open({
        content: '下单前请先选择收货地址！',
        skin: 'msg',
        time: 2 //2秒后自动关闭
      });
      throw '';
    } else if ($(this).find('.pass_way').attr('deliverymethod') === '3' && $(this).find('.pass_way').attr('delmetsel') === '') {
      layer.open({
        content: '请选择配送方式！',
        skin: 'msg',
        time: 2 //2秒后自动关闭
      });
      throw '';
    }
  });
  // 遍历店铺
  var shopOrder = [];
  $('.shopprolist .shop_pro').each(function () {
    // 遍历店铺信息
    var oneshopOrd = new Object();
    oneshopOrd.shopId = $(this).find('.shop').attr('shopid');
    oneshopOrd.shopName = $(this).find('.shop').attr('shopname');
    oneshopOrd.number = 0;
    oneshopOrd.product = [];
    //配送方式
    oneshopOrd.type = $(this).find('.pass_way').attr('deliverymethod') === '3' ? $(this).find('.pass_way').attr('delmetsel') : $(this).find('.pass_way').attr('deliverymethod');
    // 遍历商品信息
    $(this).find('.goodsMan').each(function () {
      var proson = new Object();
      proson.goodsId = $(this).find('.select_num').attr('goodsid');
      proson.goodsName = $(this).find('.select_num').attr('goodsname');
      proson.goodsImageUrl = $(this).find('.select_num').attr('goodsimageurl');
      proson.productId = $(this).find('.select_num').attr('productid');
      proson.productName = $(this).find('.select_num').attr('productname');
      proson.number = $(this).find('.select_num').text();
      oneshopOrd.number += Number($(this).find('.select_num').text());
      proson.originalPrice = $(this).find('.select_num').attr('originalprice');
      proson.showPrice = $(this).find('.select_num').attr('price');
      if ($(this).find('.select_num').attr('sharerid') !== undefined) {
        var pronum = parseInt($(this).find('.select_num').text());
        var sharerId = [];

        if (pronum === 1 || getUrl(location.href).orderSumType === '1') {
          proson.sharerId = $(this).find('.select_num').attr('sharerid');
        } else {
          for (var i = 0; i < pronum; i++) {
            sharerId.push($(this).find('.select_num').attr('sharerid'));
          }
          proson.sharerId = String(sharerId);
        }
      }
      proson.intetral = $(this).find('.select_num').attr('integralamount');

      if (oneshopOrd.type === '1' || oneshopOrd.type === '2') {
        var timeSelC = $(this).siblings('.timepicker');
        if (timeSelC.find('.timeStart').val() === '' || timeSelC.find('.timeEnd').val() === '') {
          layer.open({
            content: '请选择有效的预约时间！',
            skin: 'msg',
            time: 2 //2秒后自动关闭
          });
          throw '';
        } else {

          proson.appointmentTime = timeSelC.find('.timeStart').val() + ' ~ ' + timeSelC.find('.timeEnd').val();
        }
      }

      oneshopOrd.product.push(proson);
    });

    oneshopOrd.freight = $(this).find('.pass_way').attr('deliverymethod') === '3' ? $(this).find('.pass_way').attr('delmetsel') === '0' ? $(this).find('.pass_way').attr('postagecount') : 0 : $(this).find('.pass_way').attr('postagecount');
    shopOrder.push(oneshopOrd);
  });
  var allmoney = Number($('.number_all').attr('allmoney'));
  var allscore = Number($('.number_all').attr('allscore'));
  var namelist = [];
  $('.goodsMan').each(function () {
    namelist.push($(this).find('.detail .title').text());
  });
  var cartList = [];
  $('.shopprolist .shop_pro').each(function () {
    $(this).find('.select_num').each(function () {
      if ($(this).attr('cartid') !== undefined) {
        cartList.push($(this).attr('cartid'));
      }
    });
  });
  var newshoporders = [];

  var _loop2 = function _loop2(i) {
    var typehave = newshoporders.filter(function (obj) {
      return obj.shopId === shopOrder[i].shopId && obj.type === shopOrder[i].type;
    });
    if (typehave.length === 0) {
      newshoporders.push(shopOrder[i]);
    } else {
      var listoldval = cloneObj(typehave[0]);

      listoldval.freight = (Number(listoldval.freight) + Number(shopOrder[i].freight)).toFixed(2);
      for (var m in shopOrder[i].product) {
        listoldval.product.push(shopOrder[i].product[m]);
      }
      newshoporders.splice(newshoporders.indexOf(typehave[0]), 1, listoldval);
    }
  };

  for (var i in shopOrder) {
    _loop2(i);
  }
  var deliveryList = [];
  for (var i in newshoporders) {
    deliveryList.push(newshoporders[i].type);
  }
  var param = {
    url: 'get/shop/order/commitOrder',
    type: '',
    data: {
      addressInfo: {
        memId: memidGet(),
        addressId: addinfo.addressId,
        consignee: addinfo.consignee,
        phone: addinfo.phone,
        area: addinfo.area,
        detailAddress: addinfo.detailAddress,
        defaultStatus: addinfo.defaultStatus
      },
      totalAmount: allmoney.toFixed(2), //总金额
      totalIntegral: allscore.toFixed(0), //总积分
      memId: memidGet(),
      shopOrder: newshoporders,
      cartList: cartList
    }
  };
  submiting = true;
  setTimeout(function () {
    submiting = false;
  }, 3000);
  ajaxJS(param, function (res) {
    submiting = false;
    if (res.code === '0') {
      var payinfo = res.data;
      payinfo.limitTime = res.data.expireTime;
      payinfo.goodsname = String(namelist);
      payinfo.deliveryList = deliveryList;
      sessionStorage.payinfo = JSON.stringify(payinfo);
      // 埋点点击提交订单
      ordersubmitTracker();
      setTimeout(function () {
        location.href = './pay_confirm.html';
      }, 300);
    } else {
      tiansLayer({
        title: '提示',
        content: res.msg,
        btn: ['我知道了'],
        yes: function yes() {
          // 提示框关闭公共方法
          tiansLayerClose();
        }
      });
    }
  }, function (error) {
    submiting = false;
    layer.open({
      content: error.msg,
      skin: 'msg',
      time: 2 //2秒后自动关闭
    });
  });
};

function today() {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
  var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  return year + '-' + month + '-' + day;
}

function nowtime() {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
  var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  var hour = date.getHours() < 10 ? '0' + date.getHours() : date.getHours();
  var minutes = date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes();
  return year + '-' + month + '-' + day + ' ' + hour + ':' + minutes;
}

function time2unix(timeVal) {
  timeVal = timeVal.replace(/-/g, "/");
  return Number(Date.parse(new Date(timeVal)));
}