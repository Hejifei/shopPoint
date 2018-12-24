'use strict';

var qrcode = '';
var queryData = {
  memId: memidGet(),
  page: 1,
  pageSize: 10,
  orderType: ''
};
var typeval = '';

$(function () {
  // 若小通分期 则隐藏app顶部标题栏
  if (sessionStorage.paytype === '9') {
    if (!isWechat && isAndroid) {
      window.android.isShowSubTitle(false);
    } else if (!isWechat && isiOS) {
      window.webkit.messageHandlers.isShowSubTitle.postMessage(false);
    }

    var param = {
      url: 'get/shop/order/frontdesk/pay/result/add',
      type: '',
      data: {
        payOrdrNo: sessionStorage.orderPayNo,
        payResult: getUrl(location.href).orderStatus === "1006" ? 1 : 2
      }
    };
    ajaxJS(param, function (res) {
      if (res.code === '0') {}
    }, function (error) {});
  }
  // 下拉刷新成功事件
  function reloadinit() {
    queryData.page = 1;
    orderListGet(queryData);
  }
  // 上拉加载成功事件
  var pullloadfun = function pullloadfun() {
    if (queryData.page <= totalpages - 1) {
      queryData.page++;
      orderListGet(queryData);
    }
  };
  // 下拉刷新、上拉加载初始化方法
  tianscrollinit(reloadinit, pullloadfun);

  if (!isWechat) {
    $('.navigation').css({
      height: ((90 + statusBarHeight) / 75).toFixed(4) + 'rem',
      'padding-top': (statusBarHeight / 75).toFixed(4) + 'rem'
    });
    $('.contentnorm').css({
      'padding-top': ((90 + statusBarHeight) / 75).toFixed(4) + 'rem'
    });
  }
  $('.navigation').css('visibility', 'visible');
  $('.order_box').css('visibility', 'visible');

  typeval = getUrl(location.href).type;
  if (typeval !== undefined) {
    queryData.orderType = typeval;
    if (typeval === '5') {
      // 售后订单
      $('.navigation span').text('售后订单');
      $('.content_head').hide();
      $('.content').css('height', '100%');
      $('.pull-to-refresh-arrow').css('top', 0);
    } else {
      $('.content_head .classify').each(function () {
        if ($(this).attr('typeval') === typeval) {
          $(this).siblings('.active').removeClass('active');
          $(this).addClass('active');
        }
      });
    }
  }

  orderListGet(queryData);

  $('.content_head .classify').click(function () {
    $(this).parent('.content_head').find('.active').removeClass('active');
    $(this).addClass('active');
    $('.nomore').hide();
    queryData.orderType = $(this).attr('typeval');
    queryData.page = 1;
    orderListGet(queryData);
  });

  // 核销码弹框关闭
  $('.pp_close').click(function () {
    // $('.order_box').css({ height: 'auto' })
    document.body.removeEventListener('touchmove', bodyScroll, false);
    $('.pay_pswC').hide();
  });
  $('.pay_pswBG').click(function () {
    // $('.order_box').css({ height: 'auto' })
    document.body.removeEventListener('touchmove', bodyScroll, false);
    $('.pay_pswC').hide();
  });

  setTimeout(function () {
    $('.top-tip').show();
  }, 1000);
});

// 获取订单列表
var orderListGet = function orderListGet(dataquery) {
  setTimeout(function () {
    layer.closeAll();
  }, 500);
  var param = {
    url: 'get/shop/order/listAllOrders',
    type: '',
    data: dataquery
  };
  if (typeval === '5') {
    param.url = 'get/shop/order/getAfterServiceOrders';
  }
  ajaxJS(param, function (res) {
    layer.closeAll();
    totalpages = res.data.pages;
    var orderinfoarr = '';
    if (res.data.list !== null) {
      // 已支付订单
      for (var i in res.data.list) {
        var ordersonmenu = '';
        var text_ordSta = '';
        switch (res.data.list[i].orderStatus) {
          case 0:
            // 待支付
            text_ordSta = '待支付';
            ordersonmenu += '\n                            <a onclick="ordercancel(\'' + res.data.list[i].orderNo + '\')"><span>\u53D6\u6D88\u8BA2\u5355</span></a>\n                            <a onclick="gotoPay($(this))"><span>\u53BB\u4ED8\u6B3E</span></a>\n                        ';
            break;
          case 1:
            // 待发货
            text_ordSta = '待发货';
            ordersonmenu += '\n                            <a href=\'./order_detail.html?orderNo=' + res.data.list[i].orderNo + '\')"><span>\u7533\u8BF7\u9000\u6B3E</span></a>\n                        ';
            break;
          case 2:
            // 待收货
            text_ordSta = '待收货';
            if (res.data.list[i].distributeWay === '0') {
              ordersonmenu += '\n                                <a href="./logistics.html?orderNo=' + res.data.list[i].orderNo + '&logisticsNo=' + res.data.list[i].logisticsNo + '"><span>\u67E5\u770B\u7269\u6D41</span></a>\n                                <a onclick="orderCofm(\'' + res.data.list[i].orderNo + '\')"><span>\u786E\u8BA4\u6536\u8D27</span></a>\n                            ';
            } else {
              ordersonmenu += '\n                                <a onclick="orderCofm(\'' + res.data.list[i].orderNo + '\')"><span>\u786E\u8BA4\u6536\u8D27</span></a>\n                            ';
            }

            break;
          case 3:
            // 待核销
            text_ordSta = '待核销';
            // 商品类型:0实物1虚拟
            // 虚拟的商品显示的是消费码
            // 自提的商品显示的是提货码
            ordersonmenu += '\n                            <a onclick="hxcodeGet(\'' + res.data.list[i].orderNo + '\')"><span>' + (res.data.list[i].goodsType === 1 ? '消费码' : '提货码') + '</span></a>\n                        ';
            break;
          case 4:
            // 待评价
            text_ordSta = '待评价';
            if (res.data.list[i].distributeWay === '0') {
              ordersonmenu += '\n                                <a href=\'./order_detail.html?orderNo=' + res.data.list[i].orderNo + '\')"><span>\u7533\u8BF7\u552E\u540E</span></a>\n                                <a href="./logistics.html?orderNo=' + res.data.list[i].orderNo + '&logisticsNo=' + res.data.list[i].logisticsNo + '"><span>\u67E5\u770B\u7269\u6D41</span></a>\n                                <a href="./assess.html?orderNo=' + res.data.list[i].orderNo + '"><span>\u8BC4\u4EF7</span></a>\n                            ';
            } else {
              ordersonmenu += '\n                                <a href="./assess.html?orderNo=' + res.data.list[i].orderNo + '"><span>\u8BC4\u4EF7</span></a>\n                            ';
            }

            break;
          case 5:
            // 售后中
            text_ordSta = '售后中';
            ordersonmenu += '\n                            <a href="./order_detail.html?orderNo=' + res.data.list[i].orderNo + '&orderType=5' + (res.data.list[i].product.length > 1 ? '' : '&subOrderNo=' + res.data.list[i].product[0].subOrderNo) + '"><span>\u552E\u540E\u8BE6\u60C5</span></a>\n                        ';
            break;
          case 6:
            // 已取消
            text_ordSta = '已取消';
            break;
          case 7:
            // 已完成
            text_ordSta = '交易成功';
            if (res.data.list[i].commentId === null) {
              // 售后同意
              if (res.data.list[i].distributeWay === '0') {
                ordersonmenu += '\n                                    <a onclick="orderDel(\'' + res.data.list[i].orderNo + '\')"><span>\u5220\u9664\u8BA2\u5355</span></a>\n                                    <a href="./logistics.html?orderNo=' + res.data.list[i].orderNo + '&logisticsNo=' + res.data.list[i].logisticsNo + '"><span>\u67E5\u770B\u7269\u6D41</span></a>\n                                ';
              } else {
                ordersonmenu += '\n                                    <a onclick="orderDel(\'' + res.data.list[i].orderNo + '\')"><span>\u5220\u9664\u8BA2\u5355</span></a>\n                                ';
              }
            } else {
              // 评价完
              if (res.data.list[i].distributeWay === '0') {
                ordersonmenu += '\n                                    <a onclick="orderDel(\'' + res.data.list[i].orderNo + '\')"><span>\u5220\u9664\u8BA2\u5355</span></a>\n                                    <a href="./logistics.html?orderNo=' + res.data.list[i].orderNo + '&logisticsNo=' + res.data.list[i].logisticsNo + '"><span>\u67E5\u770B\u7269\u6D41</span></a>\n                                    ' + (res.data.list[i].product[0].commentType === 1 ? '' : '<a href="./assess_add.html?orderNo=' + res.data.list[i].orderNo + '"><span>追加评价</span></a>') + '\n                                ';
              } else {
                ordersonmenu += '\n                                    <a onclick="orderDel(\'' + res.data.list[i].orderNo + '\')"><span>\u5220\u9664\u8BA2\u5355</span></a>\n                                    ' + (res.data.list[i].product[0].commentType === 1 ? '' : '<a href="./assess_add.html?orderNo=' + res.data.list[i].orderNo + '"><span>追加评价</span></a>') + '\n                                ';
              }
            }

            break;
          case 8:
            // 已关闭
            text_ordSta = '交易关闭';
            ordersonmenu += '\n                            <a onclick="orderDel(\'' + res.data.list[i].orderNo + '\')"><span>\u5220\u9664\u8BA2\u5355</span></a>\n                        ';
            break;
          case 10:
            // 待支付
            text_ordSta = '支付中';
            ordersonmenu += '\n                            <a><span>\u652F\u4ED8\u4E2D</span></a>\n                        ';
            break;
          case 11:
            // 售后完成
            text_ordSta = '售后完成';
            ordersonmenu += '\n                            <a href="./order_detail.html?orderNo=' + res.data.list[i].orderNo + '&orderType=5' + (res.data.list[i].product.length > 1 ? '' : '&subOrderNo=' + res.data.list[i].product[0].subOrderNo) + '"><span>\u552E\u540E\u8BE6\u60C5</span></a>\n                        ';
            break;
          default:
            break;
        }
        orderinfoarr += '\n                <div class="item opacity" orderNo=\'' + res.data.list[i].orderNo + '\'>\n                    <div class="shop" orderinfo=\'' + JSON.stringify(res.data.list[i]) + '\'>\n                        <a href="./shop.html?shopId=' + res.data.list[i].shopId + '">\n                            <img src="../images/shop_store.png" alt="">\n                            <span>' + res.data.list[i].shopName + '</span><img src="../images/general_next.png" alt="">\n                        </a>\n                        <div class="reminder"><span>' + text_ordSta + '</span></div>\n                    </div>\n                ';
        if (res.data.list[i].product.length > 0) {
          for (var j in res.data.list[i].product) {

            orderinfoarr += '\n                        <a class="commodity" href="./order_detail.html?orderNo=' + res.data.list[i].orderNo + (typeval === '5' ? '&orderType=5' + (res.data.list[i].product.length > 1 ? '' : '&subOrderNo=' + res.data.list[i].product[0].subOrderNo) : '') + '">\n                            <div class="img"><img class="lazy" data-original="' + res.data.list[i].product[j].goodsImageUrl + '" alt=""></div>\n                            <div class="detail">\n                                <div class="title">' + res.data.list[i].product[j].goodsName + '</div>\n                                <div class="describe">' + res.data.list[i].product[j].productName + '</div>\n                                <div class="prices">\n                                    <div>\n                                        <span class="price">\xA5 ' + res.data.list[i].product[j].currentPrice.toFixed(2) + '</span>\n                                        <span class=\'score\'>' + (res.data.list[i].product[j].integral === 0 || res.data.list[i].product[j].integral === null ? '' : '+积分:' + res.data.list[i].product[j].integral) + '</span>\n                                        <strike class="oldPrice">' + (Number(res.data.list[i].product[j].originalPrice) === Number(res.data.list[i].product[j].currentPrice) ? '' : '¥ ' + res.data.list[i].product[j].originalPrice.toFixed(2)) + '</strike>\n                                    </div>\n                                    <span class="num"><span>x</span><span>' + res.data.list[i].product[j].number + '</span></span>\n                                </div>\n                            </div>\n                        </a>\n                        ';
          }
        }
        // 售后中的商品不包含运费，售后完成后再包含运费
        // displayFreightFlag 是否显示运费  0 不显示  1显示
        if (res.data.list[i].orderStatus === 5 || res.data.list[i].orderStatus === 11 && res.data.list[i].displayFreightFlag === 0) {
          orderinfoarr += '\n              <div class="price_deetail">\n                <div class="reminder">\u5171' + res.data.list[i].totalNumber + '\u4EF6\u5546\u54C1  \u5408\u8BA1:</div>\n                  <div class="price">\n                    \xA5 ' + (res.data.list[i].totalAmount - res.data.list[i].freight).toFixed(2) + '\n                    ' + (res.data.list[i].integralAmount === 0 ? '' : '+' + res.data.list[i].integralAmount + '分') + '\n                  </div>\n                  <div class="transfer">&nbsp;</div>\n              </div>\n              <div class="order_option">' + ordersonmenu + '</div>\n            </div>\n            ';
        } else {
          orderinfoarr += '\n              <div class="price_deetail">\n                <div class="reminder">\u5171' + res.data.list[i].totalNumber + '\u4EF6\u5546\u54C1  \u5408\u8BA1:</div>\n                  <div class="price">\n                    \xA5 ' + res.data.list[i].totalAmount.toFixed(2) + '\n                    ' + (res.data.list[i].integralAmount === 0 ? '' : '+' + res.data.list[i].integralAmount + '分') + '\n                  </div>\n                  <div class="transfer">\uFF08\u542B\u8FD0\u8D39 \xA5 ' + res.data.list[i].freight + '\uFF09</div>\n              </div>\n              <div class="order_option">' + ordersonmenu + '</div>\n            </div>\n            ';
        }
      }
    } else {
      var ordertype = '';
      switch (dataquery.orderType) {
        case '0':
          ordertype = '待支付';
          break;
        case '1':
          ordertype = '待发货';
          break;
        case '2':
          ordertype = '待收货';
          break;
        case '4':
          ordertype = '待评价';
          break;
        case '5':
          ordertype = '售后中';
          break;
        default:
          ordertype = '';
          break;
      }
      orderinfoarr += '<div class="noaddress">\u4F60\u8FD8\u6CA1\u6709' + ordertype + '\u8BA2\u5355\uFF0C\u5FEB\u53BB\u4E0B\u5355\u5427\uFF01</div>';
    }

    // 若第一页，覆盖内容，否则加在后面
    if (dataquery.page === 1) {
      $('.indexContent').html(orderinfoarr);
    } else {
      $('.indexContent').append(orderinfoarr);
    }
    // 下拉刷新成功回调
    tianscrolsuccFun();
    Imglazy();
  }, function (error) {
    layer.open({
      content: error.msg,
      skin: 'msg',
      time: 2 //2秒后自动关闭
    });
  });
};

// 懒加载设置
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
    container: $(".content >div"), // 对某容器中的图片实现效果
    // container,值为某容器.lazyload默认在拉动浏览器滚动条时生效,这个参数可以让你在拉动某DIV的滚动条时依次加载其中的图片
    failurelimit: 20, // 图片排序混乱时
    // failurelimit,值为数字.lazyload默认在找到第一张不在可见区域里的图片时则不再继续加载,但当HTML容器混乱的时候可能出现可见区域内图片并没加载出来的情况,failurelimit意在加载N张可见区域外的图片,以避免出现这个问题.
    skip_invisible: false
  });
};

//获取地址栏参数
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

// 是否确认取消订单
var ordercancel = function ordercancel(orderNo) {
  tiansLayer({
    title: '提示',
    content: '你确定要取消该订单吗？',
    btn: ['确认', '取消'],
    yes: function yes() {
      // 提示框关闭公共方法
      tiansLayerClose();
      var param = {
        url: 'get/shop/order/cancelOrder',
        type: '',
        data: {
          orderNo: orderNo
        }
      };
      ajaxJS(param, function (res) {
        layer.closeAll();
        if (res.code === '0') {
          // 若成功刷新列表
          queryData.page = 1;
          orderListGet(queryData);
        }
        layer.open({
          content: res.msg,
          skin: 'msg',
          time: 2 //2秒后自动关闭
        });
      }, function (error) {
        layer.open({
          content: error.msg,
          skin: 'msg',
          time: 2 //2秒后自动关闭
        });
      });
    }
  });
};

// 是否删除订单
var orderDel = function orderDel(orderNo) {
  tiansLayer({
    title: '提示',
    content: '你确定要删除该订单吗？',
    btn: ['确认', '取消'],
    yes: function yes() {
      // 提示框关闭公共方法
      tiansLayerClose();
      var param = {
        url: 'get/shop/order/deleteOrder',
        type: '',
        data: {
          orderNo: orderNo
        }
      };
      ajaxJS(param, function (res) {
        if (res.code === '0') {
          // 若成功刷新列表
          queryData.page = 1;
          orderListGet(queryData);
        }
        layer.open({
          content: res.msg,
          skin: 'msg',
          time: 2 //2秒后自动关闭
        });
      }, function (error) {
        layer.open({
          content: error.msg,
          skin: 'msg',
          time: 2 //2秒后自动关闭
        });
      });
    }
  });
};

// 去付款
var gotoPay = function gotoPay(e) {
  var shopinfo = JSON.parse(e.parents('.item').find('.shop').attr('orderinfo'));
  var namelist = [];
  var totalAmount = 0;
  var totalIntegral = 0;
  e.parents('.item').find('.shop').each(function () {
    var shopsoninfo = JSON.parse($(this).attr('orderinfo'));
    for (var i in shopsoninfo.product) {
      namelist.push(shopsoninfo.product[i].goodsName);
    }
    totalAmount = totalAmount + Number(shopsoninfo.totalAmount);
    totalIntegral += Number(shopsoninfo.integralAmount);
  });

  var deliveryList = [];
  deliveryList.push(shopinfo.distributeWay);
  var payinfo = {
    limitTime: shopinfo.expireTime,
    orderNo: shopinfo.orderNo,
    totalAmount: totalAmount,
    totalIntegral: totalIntegral,
    goodsname: String(namelist),
    fromorder: 1,
    deliveryList: deliveryList
  };
  sessionStorage.payinfo = JSON.stringify(payinfo);
  location.href = './pay_confirm.html';
};

// 确认收货
var orderCofm = function orderCofm(orderNo) {
  tiansLayer({
    title: '提示',
    content: '你确定要确认收货吗？',
    btn: ['确认', '取消'],
    yes: function yes() {
      // 提示框关闭公共方法
      tiansLayerClose();
      var param = {
        url: 'get/shop/order/confirmReceipt',
        type: '',
        data: {
          orderNo: orderNo
        }
      };
      ajaxJS(param, function (res) {
        if (res.code === '0') {
          // 若成功刷新列表
          queryData.page = 1;
          orderListGet(queryData);
        }
        layer.open({
          content: res.msg,
          skin: 'msg',
          time: 2 //2秒后自动关闭
        });
      }, function (error) {
        layer.open({
          content: error.msg,
          skin: 'msg',
          time: 2 //2秒后自动关闭
        });
      });
    }
  });
};

// 核销码
var hxcodeGet = function hxcodeGet(orderNo) {
  var param = {
    url: 'get/shop/order/getGoodsCode',
    type: '',
    data: {
      orderNo: orderNo
    }
  };
  ajaxJS(param, function (res) {
    if (res.code === '0') {
      if (qrcode !== '') {
        qrcode.makeCode(res.data.qrcode); // 生成另外一个二维码
      } else {
        qrcode = new QRCode(document.getElementById('codeimg'), {
          text: res.data.qrcode,
          width: 172,
          height: 172
        });
      }
      $('.codeimgC p').text('\u6211\u7684\u6838\u9500\u7801:' + res.data.goodsCode);
      $('.order_box').css({ height: '100vh', overflow: 'hidden' });
      setTimeout(function () {
        $('.pay_pswC').show();
      }, 100);
      // $('.codeimg img').css('margin', '0 auto')
      document.body.addEventListener('touchmove', bodyScroll, false);
    } else {
      layer.open({
        content: res.msg,
        skin: 'msg',
        time: 2 //2秒后自动关闭
      });
    }
  }, function (error) {
    layer.open({
      content: error.msg,
      skin: 'msg',
      time: 2 //2秒后自动关闭
    });
  });
};

// 禁止页面滚动
function bodyScroll(event) {
  event.preventDefault();
}