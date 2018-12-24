'use strict';

var orderNo = '';
var orderType = getUrl(location.href).orderType;
var payNo = '';
var qrcode = '';
var iforderlastpro = '';
var payinfo = {
  limitTime: '',
  orderNo: '',
  totalAmount: '',
  totalIntegral: '',
  goodsname: '',
  fromorder: 1
};
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

  if (orderType !== undefined) {
    $('.navigation a').attr('href', './order_all.html?type=5');
  }

  orderNo = getUrl(location.href).orderNo;

  payNo = getUrl(location.href).payNo;
  orderListGet();

  // 核销码弹框关闭
  $('.pp_close').click(function () {
    $('.order_box').css({ height: 'auto' });
    $('.pay_pswC').hide();
  });
  $('.pay_pswBG').click(function () {
    $('.order_box').css({ height: 'auto' });
    $('.pay_pswC').hide();
  });

  // 退款原因显示及关闭
  $('body').delegate('.shipselC .row', 'click', function () {
    $('.checkseled').removeClass('checkseled');
    $(this).find('.ifcheck').addClass('checkseled');
    $(this).find('input').prop('checked', true);
  });
  $('body').delegate('.shipSubC', 'click', function () {
    layer.closeAll();
  });
});

// 获取订单详情
var orderListGet = function orderListGet() {
  var param = {
    url: 'get/shop/order/getOrderDetail',
    type: '',
    data: {
      payNo: payNo,
      orderNo: orderNo
    }
  };
  if (orderType !== undefined) {
    param.data.ordertype = 5;
    param.data.subOrderNo = getUrl(location.href).subOrderNo;
    param.url = 'get/shop/order/getAfterServiceOrderDetail';
  }
  ajaxJS(param, function (res) {
    iforderlastpro = res.data.product.length;
    var ordercenterline = '';
    var orderBotBtn = '';
    var text_ordSta = '';
    var imgsrc = '';
    var text_img = '';
    var ordprocess = '';

    var ifassessshow = false; //评价是否展示  所有售后状态为已关闭 2 的 评价跟追评都隐藏
    // refundStatus 0未退款 1售后中 2已关闭 3已拒绝 4商家同意售后 5等待退款换货 6退款中
    for (var j in res.data.product) {
      if (res.data.product[j].refundStatus === 0 || res.data.product[j].refundStatus === 3) {
        ifassessshow = true;
      }
    }

    ordprocess = '\n            <p class="id"><span>\u8BA2\u5355\u7F16\u53F7:</span><span>' + res.data.orderNo + '</span></p>\n            <p class="create_time"><span>\u521B\u5EFA\u65F6\u95F4:</span><span>' + timeFormat(res.data.createTime) + '</span></p>\n        ';
    var goodsnamelist = [];
    switch (res.data.orderStatus) {
      case 0:
        // 待支付
        text_ordSta = '等待支付';
        imgsrc = '../images/shop_dfk.png';
        text_img = '待付款';
        orderBotBtn += '\n                    <a onclick="ordercancel(\'' + res.data.orderNo + '\')"><span>\u53D6\u6D88\u8BA2\u5355</span></a>\n                    <a onclick="gotoPay($(this))" orderNo=\'' + res.data.orderNo + '\' totalAmount=\'' + res.data.totalAmount + '\' integralAmount=\'' + res.data.integralAmount + '\'><span>\u7ACB\u5373\u4ED8\u6B3E</span></a>\n                ';
        break;
      case 1:
        // 待发货
        text_ordSta = '等待发货';
        imgsrc = '../images/shop_dfh.png';
        text_img = '待发货';
        ordprocess += '<p class="pay_time"><span>\u4ED8\u6B3E\u65F6\u95F4:</span><span>' + timeFormat(res.data.payTime) + '</span></p>';
        ordercenterline = '<div class="servApl"><a onclick=\'afersale_app_moneyback($(this))\'>\u7533\u8BF7\u9000\u6B3E</a></div>';
        break;
      case 2:
        // 待收货
        text_ordSta = '等待收货';
        imgsrc = '../images/shop_dsh.png';
        text_img = '待收货';
        ordercenterline = '<div class="servApl"><a onclick=\'afersale_app($(this))\'>\u7533\u8BF7\u552E\u540E</a></div>';
        ordprocess += '\n                    <p class="pay_time"><span>\u4ED8\u6B3E\u65F6\u95F4:</span><span>' + timeFormat(res.data.payTime) + '</span></p>\n                    <p class="pay_time"><span>\u53D1\u8D27\u65F6\u95F4:</span><span>' + timeFormat(res.data.deliverTime) + '</span></p>\n                ';
        if (res.data.distributeWay === 0) {
          orderBotBtn += '\n                        <a href="./logistics.html?orderNo=' + res.data.orderNo + '&logisticsNo=' + res.data.logisticsNo + '">\n                        <span>\u67E5\u770B\u7269\u6D41</span></a>\n                        <a onclick="orderCofm(\'' + res.data.orderNo + '\')"><span>\u786E\u8BA4\u6536\u8D27</span></a>\n                    ';
        } else {
          orderBotBtn += '\n                        <a onclick="orderCofm(\'' + res.data.orderNo + '\')"><span>\u786E\u8BA4\u6536\u8D27</span></a>\n                    ';
        }

        break;
      case 3:
        // 待核销
        text_ordSta = '等待收货';
        imgsrc = '../images/shop_dsh.png';
        text_img = '待收货';
        ordercenterline = '<div class="servApl"><a onclick=\'afersale_app($(this),1)\'>\u7533\u8BF7\u552E\u540E</a></div>';
        ordprocess += '\n                    <p class="pay_time"><span>\u4ED8\u6B3E\u65F6\u95F4:</span><span>' + timeFormat(res.data.payTime) + '</span></p>\n                ';
        orderBotBtn += '\n                    <a onclick="hxcodeGet(\'' + res.data.orderNo + '\')"><span>\u6838\u9500\u7801</span></a>\n                ';
        break;
      case 4:
        // 待评价
        text_ordSta = '交易成功';
        imgsrc = '../images/shop_dpj.png';
        text_img = '待评价';
        if (res.data.goodsType !== 0 || res.data.distributeWay !== 0) {
          ordprocess += '\n                        <p class="pay_time"><span>\u4ED8\u6B3E\u65F6\u95F4:</span><span>' + timeFormat(res.data.payTime) + '</span></p>\n                        <p class="pay_time"><span>\u6210\u4EA4\u65F6\u95F4:</span><span>' + timeFormat(res.data.completeTime) + '</span></p>\n                    ';
        } else {
          ordprocess += '\n                        <p class="pay_time"><span>\u4ED8\u6B3E\u65F6\u95F4:</span><span>' + timeFormat(res.data.payTime) + '</span></p>\n                        <p class="pay_time"><span>\u53D1\u8D27\u65F6\u95F4:</span><span>' + timeFormat(res.data.deliverTime) + '</span></p>\n                        <p class="pay_time"><span>\u6210\u4EA4\u65F6\u95F4:</span><span>' + timeFormat(res.data.completeTime) + '</span></p>\n                    ';
        }
        if (res.data.distributeWay === 0) {
          if (ifassessshow) {
            ordercenterline = '<div class="servApl"><a onclick=\'afersale_app($(this))\'>\u7533\u8BF7\u552E\u540E</a></div>';
            orderBotBtn += '\n                          <a href="./logistics.html?orderNo=' + res.data.orderNo + '&logisticsNo=' + res.data.logisticsNo + '"><span>\u67E5\u770B\u7269\u6D41</span></a>\n                          <a href="./assess.html?orderNo=' + res.data.orderNo + (orderType === '5' ? '&orderType=5' : '') + '"><span>\u8BC4\u4EF7</span></a>\n                      ';
          } else {
            ordercenterline = '<div class="servApl"><a onclick=\'afersale_app($(this))\'>\u7533\u8BF7\u552E\u540E</a></div>';
            orderBotBtn += '\n                          <a href="./logistics.html?orderNo=' + res.data.orderNo + '&logisticsNo=' + res.data.logisticsNo + '"><span>\u67E5\u770B\u7269\u6D41</span></a>';
          }
        } else if (ifassessshow) {
          // 自提跟到店消费的商品消费后，就没有查看物流跟申请售后的操作了
          orderBotBtn += '\n                        <a href="./assess.html?orderNo=' + res.data.orderNo + (orderType === '5' ? '&orderType=5' : '') + '"><span>\u8BC4\u4EF7</span></a>\n                    ';
        }
        break;
      case 5:
        // 售后中
        text_ordSta = '售后处理中';
        imgsrc = '../images/shop_shz.png';
        text_img = '售后中';
        ordercenterline = '<div class="servApl"><a onclick=\'afersale_app($(this))\'>\u7533\u8BF7\u552E\u540E</a></div>';
        // payStatus  0未支付 1已支付  
        // deliverStatus 0未发货 1已发货  
        // receiptStatus 0未收货 1已收货  
        if (res.data.goodsType !== 0 || res.data.distributeWay !== 0 || res.data.distributeWay === 0 && res.data.deliverStatus === 0) {
          ordprocess += '\n                        <p class="pay_time"><span>\u4ED8\u6B3E\u65F6\u95F4:</span><span>' + timeFormat(res.data.payTime) + '</span></p>\n                    ';
        } else if (res.data.receiptStatus === 0) {
          // goodsType 0实物 1虚拟
          // 自提跟虚拟商品没有发货时间
          if (res.data.goodsType !== 0 || res.data.distributeWay !== 0) {
            ordprocess += '\n                <p class="pay_time"><span>\u4ED8\u6B3E\u65F6\u95F4:</span><span>' + timeFormat(res.data.payTime) + '</span></p>';
          } else {
            ordprocess += '\n                <p class="pay_time"><span>\u4ED8\u6B3E\u65F6\u95F4:</span><span>' + timeFormat(res.data.payTime) + '</span></p>\n                <p class="pay_time"><span>\u53D1\u8D27\u65F6\u95F4:</span><span>' + timeFormat(res.data.deliverTime) + '</span></p>\n              ';
          }
        } else {
          // 自提跟虚拟商品没有发货时间
          if (res.data.goodsType !== 0 || res.data.distributeWay !== 0) {
            ordprocess += '\n                <p class="pay_time"><span>\u4ED8\u6B3E\u65F6\u95F4:</span><span>' + timeFormat(res.data.payTime) + '</span></p>\n                <p class="pay_time"><span>\u6210\u4EA4\u65F6\u95F4:</span><span>' + timeFormat(res.data.completeTime) + '</span></p>\n              ';
          } else {
            ordprocess += '\n                <p class="pay_time"><span>\u4ED8\u6B3E\u65F6\u95F4:</span><span>' + timeFormat(res.data.payTime) + '</span></p>\n                <p class="pay_time"><span>\u53D1\u8D27\u65F6\u95F4:</span><span>' + timeFormat(res.data.deliverTime) + '</span></p>\n                <p class="pay_time"><span>\u6210\u4EA4\u65F6\u95F4:</span><span>' + timeFormat(res.data.completeTime) + '</span></p>\n              ';
          }
        }

        // 若实物可以查看物流 自提跟到店消费的不能查看物流
        // deliverStatus 0未发货 1已发货  
        if (res.data.distributeWay === 0 && res.data.deliverStatus === 1) {
          orderBotBtn += '\n                        <a href="./logistics.html?orderNo=' + res.data.orderNo + '&logisticsNo=' + res.data.logisticsNo + '"><span>\u67E5\u770B\u7269\u6D41</span></a>\n                    ';
        }

        break;
      case 6:
        // 已取消
        text_ordSta = '交易关闭';
        imgsrc = '../images/shop_ygb.png';
        text_img = '已关闭';
        break;
      case 7:
        // 已完成
        text_ordSta = '交易成功';
        imgsrc = '../images/shop_ypj.png';
        text_img = '已评价';
        if (res.data.goodsType === 0 && res.data.distributeWay === 0) {
          ordercenterline = '<div class="servApl"><a onclick=\'afersale_app($(this))\'>\u7533\u8BF7\u552E\u540E</a></div>';
        }
        // 自提跟虚拟商品没有发货时间
        if (res.data.goodsType !== 0 || res.data.distributeWay !== 0) {
          ordprocess += '\n                        <p class="pay_time"><span>\u4ED8\u6B3E\u65F6\u95F4:</span><span>' + timeFormat(res.data.payTime) + '</span></p>\n                        <p class="pay_time"><span>\u6210\u4EA4\u65F6\u95F4:</span><span>' + timeFormat(res.data.completeTime) + '</span></p>\n                    ';
        } else {
          ordprocess += '\n                        <p class="pay_time"><span>\u4ED8\u6B3E\u65F6\u95F4:</span><span>' + timeFormat(res.data.payTime) + '</span></p>\n                        <p class="pay_time"><span>\u53D1\u8D27\u65F6\u95F4:</span><span>' + timeFormat(res.data.deliverTime) + '</span></p>\n                        <p class="pay_time"><span>\u6210\u4EA4\u65F6\u95F4:</span><span>' + timeFormat(res.data.completeTime) + '</span></p>\n                    ';
        }

        // commentType=1 已追评的 就不能再追评了
        if (res.data.distributeWay === 0) {
          if (ifassessshow) {
            orderBotBtn += '\n                          <a href="./logistics.html?orderNo=' + res.data.orderNo + '&logisticsNo=' + res.data.logisticsNo + '"><span>\u67E5\u770B\u7269\u6D41</span></a>\n                          ' + (res.data.product[0].commentType === 1 ? '' : '<a href="./assess_add.html?orderNo=' + res.data.orderNo + (orderType === '5' ? '&orderType=5' : '') + '"><span>追加评价</span></a>') + '\n                      ';
          } else {
            orderBotBtn += '\n                <a href="./logistics.html?orderNo=' + res.data.orderNo + '&logisticsNo=' + res.data.logisticsNo + '"><span>\u67E5\u770B\u7269\u6D41</span></a>';
          }
        } else if (ifassessshow) {
          orderBotBtn += '\n                        ' + (res.data.product[0].commentType === 1 ? '' : '<a href="./assess_add.html?orderNo=' + res.data.orderNo + (orderType === '5' ? '&orderType=5' : '') + '"><span>追加评价</span></a>') + '\n                    ';
        }

        break;
      case 8:
        // 已关闭
        text_ordSta = '交易关闭';
        imgsrc = '../images/shop_ygb.png';
        text_img = '已关闭';
        // 售后同意
        if (res.data.cancelStatus === 0) {
          if (res.data.deliverStatus === 1 && res.data.distributeWay === 0) {
            // 已发货 并且是快递的
            ordprocess += '\n                            <p class="pay_time"><span>\u4ED8\u6B3E\u65F6\u95F4:</span><span>' + timeFormat(res.data.payTime) + '</span></p>\n                            <p class="pay_time"><span>\u53D1\u8D27\u65F6\u95F4:</span><span>' + timeFormat(res.data.deliverTime) + '</span></p>\n                        ';
          } else {
            ordprocess += '\n                            <p class="pay_time"><span>\u4ED8\u6B3E\u65F6\u95F4:</span><span>' + timeFormat(res.data.payTime) + '</span></p>\n                            \n                        ';
          }
          // 若实物已发货 则可查看物流，其他无
          if (res.data.distributeWay === 0 && res.data.deliverStatus === 1) {
            orderBotBtn += '\n                            <a href="./logistics.html?orderNo=' + res.data.orderNo + '&logisticsNo=' + res.data.logisticsNo + '"><span>\u67E5\u770B\u7269\u6D41</span></a>\n                        ';
          }
        }
        // 取消订单的已关闭 都不显示
        break;
      case 10:
        // 待支付
        text_ordSta = '支付中';
        imgsrc = '../images/shop_fkz.png';
        text_img = '待付款';
        orderBotBtn += '\n                    <a onclick="ordercancel(\'' + res.data.orderNo + '\')"><span>\u53D6\u6D88\u8BA2\u5355</span></a>\n                ';
        break;
      default:
        break;
    }

    var add_nametext = '收货人';
    var add_addtext = '收货地址';
    if (res.data.distributeWay !== 0) {
      add_nametext = '提货商';
      add_addtext = '提货地址';
    }
    $('.address .detail').html('\n        <div class="person opacity">\n            <div class="name">' + add_nametext + ':' + res.data.consignee + '</div>\n            <div class="phone">' + res.data.phone + '</div>\n        </div>\n        <div class="address_detail opacity">' + add_addtext + ':' + res.data.address + '</div>\n        ');
    // 商铺
    $('.shopproC .shop').html('\n        <a class=\'opacity\' href="./shop.html?shopId=' + res.data.shopId + '"><img src="../images/shop_store.png" alt=""><span>' + res.data.shopName + '</span><img src="../images/general_next.png" alt=""></a>\n        ');
    // 商品
    var ordershoparr = '';
    var ifonlygoodscha = 0;
    var orderAllmoney = 0;
    var orderAllscore = 0;
    for (var i in res.data.product) {
      orderAllmoney += res.data.product[i].currentPrice * res.data.product[i].number;
      orderAllscore += res.data.product[i].integral === null ? 0 : res.data.product[i].integral * res.data.product[i].number;
      if (res.data.orderStatus === 8 && res.data.cancelStatus === 0 && res.data.product[i].refundType !== 3) {
        ifonlygoodscha++;
      }
      var newordercenterline = '';
      goodsnamelist.push(res.data.product[i].goodsName);
      if (res.data.product[i].refundStatus !== 0 && res.data.product[i].afterServiceType !== 0) {
        // refundStatus 0未退款 1售后中 2已关闭 3已拒绝 4商家同意售后 5等待退款换货 6退款中
        newordercenterline = '\n                <div class="servApl">\n                    <a href=\'drawback_detail.html?orderNo=' + res.data.orderNo + '&&suborderno=' + res.data.product[i].subOrderNo + '&&ifedit=1\' class="grenbtn">\n                    ' + (res.data.product[i].refundStatus === 2 || res.data.product[i].refundStatus === 3 ? '售后完成' : '售后中') + '\n                    </a>\n                </div>';
      }
      var appointmentTimeText = '';
      if (res.data.distributeWay === 1 || res.data.distributeWay === 2) {
        // 自提或到店消费的时候 显示预约时间
        appointmentTimeText = '<div class="timepicker">\n                              <div class="timeSelL">\u9884\u7EA6\u65F6\u95F4</div>\n                              <div class="timeSelR">' + res.data.product[i].appointmentTime + '</div>\n                          </div>';
      }
      ordershoparr += '\n            <div class="prolist_son opacity" subOrderNo=\'' + res.data.product[i].subOrderNo + '\'>\n                <a class="commodity" href="./shop_detail.html?id=' + res.data.product[i].goodsId + '">\n                    <div class="img"><img src="' + (res.data.product[i].goodsImageUrl === '' ? '../images/shop_nopic.png' : res.data.product[i].goodsImageUrl) + '" alt=""></div>\n                    <div class="detail">\n                        <div class="title">' + res.data.product[i].goodsName + '</div>\n                        <div class="describe">' + res.data.product[i].productName + '</div>\n                        <div class="prices">\n                            <div>\n                                <span class="price">\xA5 ' + res.data.product[i].currentPrice.toFixed(2) + '</span>\n                                ' + (res.data.product[i].integral === 0 ? '' : '<span class="score">+积分:' + res.data.product[i].integral + '</span>') + '\n                                <strike class="oldPrice">' + (Number(res.data.product[i].originalPrice) === Number(res.data.product[i].currentPrice) ? '' : '￥' + res.data.product[i].originalPrice.toFixed(2)) + '</strike>\n                            </div>\n                            <span class="num"><span>x</span><span>' + res.data.product[i].number + '</span></span>\n                        </div>\n                    </div>\n                </a>\n                ' + appointmentTimeText + '\n                ' + (newordercenterline === '' ? ordercenterline : newordercenterline) + '\n            \n            ';
      // 已关闭  售后同意状态下 若所有的都是仅换货 则不显示退款金额
      // refundStatus 1、仅退款 2退货退款 3仅换货  换货不显示 退款、退货退款的显示退款金额
      if (res.data.orderStatus === 8 && res.data.cancelStatus === 0 && (res.data.product[i].refundStatus === 1 || res.data.product[i].refundStatus === 2) && res.data.product[i].afterServiceType !== 3) {
        ordershoparr += '\n                <div class="servApl row">\n                    <div class="grenbtn">\u9000\u6B3E\u91D1\u989D' + (res.data.product[i].refundedIntegral !== 0 && res.data.product[i].refundedIntegral !== null && res.data.product[i].refundedIntegral !== undefined ? '+积分' : '') + ':\uFFE5' + (res.data.product[i].refundedAmount !== undefined && res.data.product[i].refundedAmount !== null ? res.data.product[i].refundedAmount.toFixed(2) : '') + '\n                    ' + (res.data.product[i].refundedIntegral !== 0 && res.data.product[i].refundedIntegral !== null && res.data.product[i].refundedIntegral !== undefined ? '+' + parseInt(res.data.product[i].refundedIntegral) + '积分' : '') + '\n                    </div>\n                    <div>\u9000\u6B3E\u6210\u529F</div>\n                </div>\n            ';
      }
      ordershoparr += '</div>';
    }

    $('.shopproC .prolist').html(ordershoparr);
    // 商品总价
    $('.shop_det').html('\n        <div class="total opacity"><span>\u5546\u54C1\u603B\u4EF7</span><span class="price">\xA5' + orderAllmoney.toFixed(2) + (orderAllscore === 0 ? '' : '+' + orderAllscore + '分') + '</span></div>\n        <!--\u8FD0\u8D39-->\n        <div class="pass opacity"><span>\u8FD0\u8D39</span>\n            <span>' + (res.data.distributeWay === 0 ? '￥' + res.data.freight.toFixed(2) : res.data.distributeWay === 1 ? '用户自提' : '到店消费') + '</span>\n        </div>\n        <!--\u73B0\u91D1\u652F\u4ED8-->\n        <div class="cash opacity"><span>\u73B0\u91D1\u652F\u4ED8</span><span>\xA5' + Number(res.data.totalAmount).toFixed(2) + '</span></div>\n        <!--\u79EF\u5206\u652F\u4ED8-->\n        <div class="integral opacity"><span>\u79EF\u5206\u652F\u4ED8</span><span>' + res.data.integralAmount + '\u5206</span></div>\n        ');
    var deliveryList = [];
    deliveryList.push(String(res.data.distributeWay));
    payinfo.deliveryList = deliveryList;
    payinfo.limitTime = timeFormat(res.data.expireTime);
    payinfo.orderNo = res.data.orderNo;
    payinfo.totalAmount = res.data.totalAmount;
    payinfo.totalIntegral = res.data.integralAmount;
    payinfo.goodsname = String(goodsnamelist);
    // 顶部订单状态及图片
    $('.order_head').html('\n        <div class="title opacity"><span>' + text_ordSta + '</span></div>\n        <div class="img opacity"><img src="' + imgsrc + '" alt="' + text_img + '"></div>\n        ');
    // 订单进度
    $('.prd_process').html(ordprocess);
    $('.prd_process').addClass('opacity');
    $('.refund').html(orderBotBtn);
    $('.refund').addClass('opacity');
    // Imglazy();
    if (!ifassessshow) {
      $('.refund').hide();
    }
  }, function (error) {
    layer.open({
      content: error.msg,
      skin: 'msg',
      time: 2 //2秒后自动关闭
    });
  });
};

// 客服
var getHelp = function getHelp() {
  var param = {
    url: 'get/center/getConfig',
    type: '',
    data: {}
  };
  ajaxJS(param, function (res) {
    if (res.code === '0') {
      tiansLayer({
        title: '提示',
        content: '<p>&nbsp;&nbsp;请拨打客服电话:</p><p><a style="color: #009943" href="tel:' + res.data.walletServicePhone + '">' + res.data.walletServicePhone + '</a></p>',
        btn: ['我知道了'],
        yes: function yes() {
          // 提示框关闭公共方法
          tiansLayerClose();
        }
      });
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
// 时间戳转时间
var timeFormat = function timeFormat(timestamp) {
  var date = new Date(timestamp); //时间戳为10位需*1000，时间戳为13位的话不需乘1000
  var Y = date.getFullYear();
  var M = date.getMonth() + 1;
  var D = date.getDate();
  var h = date.getHours();
  var m = date.getMinutes();
  var s = date.getSeconds();
  return Y + '-' + size2(M) + '-' + size2(D) + ' ' + size2(h) + ':' + size2(m) + ':' + size2(s);
};

var size2 = function size2(val) {
  if (val < 10) {
    return '0' + val;
  } else {
    return val;
  }
};

// 是否确认取消订单
var ordercancel = function ordercancel(payNo) {
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
          orderNo: payNo
        }
      };
      ajaxJS(param, function (res) {
        if (res.code === '0') {
          orderListGet();
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
  // console.log(payinfo)
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
          orderListGet();
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

// 确认收货
var onfirmGet = function onfirmGet() {
  tiansLayer({
    title: '提示',
    content: '你确定要确认收货吗？',
    btn: ['确认', '取消'],
    yes: function yes() {
      // 提示框关闭公共方法
      tiansLayerClose();
    }
  });
};

// 懒加载设置
var Imglazy = function Imglazy() {
  $('img.lazy').lazyload({
    placeholder: '../images/shop_nopic.png', //用图片提前占位
    // placeholder,值为某一图片路径.此图片用来占据将要加载的图片的位置,待图片加载时,占位图则会隐藏
    effect: 'fadeIn', // 载入使用何种效果
    // effect(特效),值有show(直接显示),fadeIn(淡入),slideDown(下拉)等,常用fadeIn
    threshold: 200, // 提前开始加载
    // threshold,值为数字,代表页面高度.如设置为200,表示滚动条在离目标位置还有200的高度时就开始加载图片,可以做到不让用户察觉
    event: 'sporty', // 事件触发时才加载
    // event,值有click(点击),mouseover(鼠标划过),sporty(运动的),foobar(…).可以实现鼠标莫过或点击图片才开始加载,后两个值未测试…
    container: $('body'), // 对某容器中的图片实现效果
    // container,值为某容器.lazyload默认在拉动浏览器滚动条时生效,这个参数可以让你在拉动某DIV的滚动条时依次加载其中的图片
    failurelimit: 10 // 图片排序混乱时
    // failurelimit,值为数字.lazyload默认在找到第一张不在可见区域里的图片时则不再继续加载,但当HTML容器混乱的时候可能出现可见区域内图片并没加载出来的情况,failurelimit意在加载N张可见区域外的图片,以避免出现这个问题.
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
      console.log(qrcode);
      $('.codeimgC p').text('\u6211\u7684\u6838\u9500\u7801:' + res.data.goodsCode);
      $('.order_box').css({ height: '100vh', overflow: 'hidden' });
      setTimeout(function () {
        $('.pay_pswC').show();
      }, 100);
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

// 申请售后
var afersale_app = function afersale_app(e, val) {
  if (val !== 1) {
    if (iforderlastpro === 1) {
      location.href = './drawback_type.html?orderNo=' + orderNo + '&&suborderno=' + e.parents('.prolist_son').attr('suborderno') + '&&iforderlastpro=' + iforderlastpro;
    } else {
      location.href = './drawback_type.html?orderNo=' + orderNo + '&&suborderno=' + e.parents('.prolist_son').attr('suborderno');
    }
  } else {
    if (iforderlastpro === 1) {
      location.href = './drawback_detail.html?orderNo=' + orderNo + '&&suborderno=' + e.parents('.prolist_son').attr('suborderno') + '&&refundType=1&&iforderlastpro=' + iforderlastpro;
    } else {
      location.href = './drawback_detail.html?orderNo=' + orderNo + '&&suborderno=' + e.parents('.prolist_son').attr('suborderno') + '&&refundType=1';
    }
  }
};

// 申请退款
var afersale_app_moneyback = function afersale_app_moneyback(e) {
  if (iforderlastpro === 1) {
    location.href = './drawback_detail.html?orderNo=' + orderNo + '&&suborderno=' + e.parents('.prolist_son').attr('suborderno') + '&&refundType=1&&iforderlastpro=' + iforderlastpro;
  } else {
    location.href = './drawback_detail.html?orderNo=' + orderNo + '&&suborderno=' + e.parents('.prolist_son').attr('suborderno') + '&&refundType=1';
  }
};

// 禁止页面滚动
function bodyScroll(event) {
  event.preventDefault();
}