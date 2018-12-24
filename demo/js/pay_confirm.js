'use strict';

var payinfo = JSON.parse(sessionStorage.payinfo);
var payForGoods = '';
var cardBankName = ''; //选择银行卡返回
var fromorder = '';
var accountInfo = '';
var DefaultCardInfo = '';
var moneyintChangebl = '';
var availableIntegral = '';
var orderPayNo = '';
var pwdSetStatus = ''; //是否设置了支付密码  '1'未设置 '0'已设置
// let exchangeType = ''
// 支付方式 0支付宝 1微信 2快捷支付 3天狮钱包支付 6微信h5支付 7支付宝h5支付 8h5快捷支付 9小通分期  10赢粉宝
var paytype = [];
var ifIntegral = true; // 是否启用积分支付，true 启用 false 不启用
var ifpayType = 1; // 1单渠道支付(默认) 2混合渠道支付
var ifexchangeType = 0; //是否抵扣积分  0不使用 1使用 2部分抵扣
// 输入密码
var pwd = '';
var len = 0;
var $inputs = $('.surface-ipt input');
$('.wrapper').hide();
var $wrappers = $('.wrapper');
var newtotalAmount = 0; // 最终支付总金额 
var newtotalIntegral = 0; // 最终支付总积分
var avalbMoney = 0; // 赢粉宝账户可用金额
$(function () {
  // 付款方式选择
  // 微信置灰
  $('.wx label').addClass('pay_cantsel');
  $('.wx').find('input').attr('disabled', true);
  // 点击按钮
  $('.pay_metlist .row').click(function () {
    if (!$(this).find('.pay_mleft').hasClass('pay_cantsel')) {
      $('.checkseled').siblings('.pay_mleft').find('span').text('');
      $('.checkseled').removeClass('checkseled');
      if ($(this).find('label').text() !== '微信') {
        $(this).find('.pay_mright').addClass('checkseled');
      }

      // 是否启用积分支付
      if (ifIntegral) {
        // 启用积分支付
        // 积分够
        newtotalAmount = 0;
        newtotalIntegral = 0;
        if (Number(accountInfo.integral) - Number(payinfo.totalIntegral) > 0) {
          $('.scorerow .scorepayspan').text('(-' + payinfo.totalIntegral + '积分)');
          $(this).find('.pay_mleft span').text('(-' + payinfo.totalAmount.toFixed(2) + '元)');
          newtotalIntegral = payinfo.totalIntegral;
          newtotalAmount = payinfo.totalAmount.toFixed(2);
          ifexchangeType = 0;
        } else if (Number(accountInfo.integral) < Number(payinfo.totalIntegral)) {
          var addmoney = (moneyintChangebl * (Number(payinfo.totalIntegral) - Number(accountInfo.integral))).toFixed(2);
          $('.scorerow .scorepayspan').text('积分不足，还需' + addmoney + '元');
          $(this).find('.pay_mleft span').text('(-' + (Number(payinfo.totalAmount) + Number(addmoney)).toFixed(2) + '元)');

          newtotalIntegral = accountInfo.integral;
          newtotalAmount = (Number(payinfo.totalAmount) + Number(addmoney)).toFixed(2);
          ifexchangeType = 2;
        }
        $('.pro_price').text('\uFFE5' + newtotalAmount + '+' + newtotalIntegral + '\u79EF\u5206');
        $('.pp_pmoney').text('\uFFE5' + newtotalAmount);

        sessionStorage.payMoney = JSON.stringify({
          totalAmount: newtotalAmount,
          totalIntegral: newtotalIntegral
        });
        if ($(this).hasClass('moneyrow')) {
          ifpayType = 1;
        } else {
          ifpayType = 2;
        }
      } else {
        console.log($(this).find('label').text() !== '微信');
        if ($(this).find('label').text() !== '微信') {
          ifpayType = 1;
          newtotalAmount = (Number(payinfo.totalAmount) + Number(payinfo.totalIntegral) * moneyintChangebl).toFixed(2);
          newtotalIntegral = 0;
          $(this).find('.pay_mleft span').text('(-' + newtotalAmount + '元)');
          $('.pro_price').text('\uFFE5' + newtotalAmount);
          $('.pp_pmoney').text('\uFFE5' + newtotalAmount);
          if (Number(payinfo.totalIntegral) > 0) {
            ifexchangeType = 1;
          } else {
            ifexchangeType = 0;
          }
          sessionStorage.payMoney = JSON.stringify({
            totalAmount: newtotalAmount,
            totalIntegral: 0
          });
        } else {
          $('.wx').find('input').attr('disabled', true);
        }
      }
    }
  });

  // 若商品消耗积分为0，则置灰，不能选择 点击提示 该商品不支持积分支付
  if (payinfo.totalIntegral === 0) {
    $('.scorerow .pay_mright').addClass('pay_cantsel').addClass('integOff');
    ifIntegral = false;
    ifpayType = 1;
    // 若订单需要支付积分 则使用余额抵扣积分 否则不使用
    if (Number(payinfo.totalIntegral) > 0) {
      ifexchangeType = 1;
    } else {
      ifexchangeType = 0;
    }
  }

  // 积分支付开关
  $('.scorerow .pay_mright').click(function () {
    // 若商品不能选择积分支付，则无法更改开关状态
    if (!$(this).hasClass('pay_cantsel')) {
      if ($(this).hasClass('integOn')) {
        $(this).removeClass('integOn').addClass('integOff');
        ifIntegral = false;
        ifpayType = 1;
        // 清空消费积分数
        $('.scorepayspan').text('');
        // 若订单需要支付积分 则使用余额抵扣积分 否则不使用
        if (Number(payinfo.totalIntegral) > 0) {
          ifexchangeType = 1;
        } else {
          ifexchangeType = 0;
        }
      } else {
        $(this).removeClass('integOff').addClass('integOn');
        ifIntegral = true;
        if ($('.moneyrow').find('.checkseled').length > 0 || $('.kjzfline').find('.checkseled').length > 0) {
          ifpayType = 1;
        } else {
          ifpayType = 2;
        }
      }
      // 若有选中项 则再次点击
      if ($('.checkseled').length > 0) {
        $('.checkseled').click();
      }
    } else {
      layer.open({
        content: '该商品不支持积分支付!',
        skin: 'msg',
        time: 2 //2秒后自动关闭
      });
    }
  });

  if (!isWechat) {
    $('.payC_top').css({
      'padding-top': (statusBarHeight / 75).toFixed(4) + 'rem'
    });
  }
  $('.payC_body').css('visibility', 'visible');

  // 点击跳转设置密码的方法
  $('.pp_set').click(function () {
    if (isWechat) {
      var urlData = window.location.href;
      window.location.href = h5pswurl + ('/tiens-h5/html/reset_pwd.html?paymode=payPoint&url=' + urlData + '&statusBarHeight=0&token=' + localStorage.token + '&memid=' + memidGet());
    } else if (isIosAndH5 === 1) {
      window.webkit.messageHandlers.onSetPayPwdSuccess.postMessage();
    } else if (isIosAndH5 === 2) {
      window.android.onSetPayPwdSuccess();
    } else {
      var _urlData = window.location.href;
      window.location.href = h5pswurl + ('/tiens-h5/html/reset_pwd.html?paymode=payPoint&url=' + _urlData + '&statusBarHeight=' + statusBarHeight + '&token=' + localStorage.token + '&memid=' + memidGet());
    }
  });

  // 设置from 控制银行卡选择好了可以返回当前界面
  localStorage.setItem('from', 'shopMall');
  cardBankName = getUrl(location.href).cardBankName;
  fromorder = payinfo.fromorder;
  $('.pp_pname').text(payinfo.goodsname);
  $('.pp_pmoney').text('\uFFE5' + newtotalAmount.toFixed(2));
  $('.pro_name').text(payinfo.goodsname);
  $('.pro_price').text('\uFFE5' + payinfo.totalAmount.toFixed(2) + (payinfo.totalIntegral === 0 ? '' : '+' + payinfo.totalIntegral + '积分'));

  var limitTime = payinfo.limitTime;
  limitTime = limitTime.substring(0, 19);
  limitTime = limitTime.replace(/-/g, '/');
  var nowdata = new Date(); //当前时间
  var enddate = new Date(limitTime); //订单结束时间
  var timeleft = enddate.getTime() - nowdata.getTime();
  var days = Math.floor(timeleft / (24 * 3600 * 1000));
  var leave1 = timeleft % (24 * 3600 * 1000);
  var hours = Math.floor(leave1 / (3600 * 1000));
  var leave2 = leave1 % (3600 * 1000);
  var minutes = Math.floor(leave2 / (60 * 1000));
  var leave3 = leave2 % (60 * 1000); //计算分钟数后剩余的毫秒数
  var seconds = Math.round(leave3 / 1000);

  accountInfoGet();

  // 倒计时
  var m = minutes;
  var s = seconds;
  var countDown = '';
  if (timeleft > 0) {
    // 可以支付
    countDown = setInterval(function () {
      $('.pro_countDown').html('剩余支付时间:' + min2size(m) + ':' + min2size(s));

      s--;
      if (s < 0) {
        if (m === 0 && s === -1) {
          clearInterval(countDown);
        } else {
          s = 59;
          m--;
        }
      }
    }, 1000);
  } else {
    // 超时未支付
    $('.pro_countDown').html('超时未支付');
    $('.pay_btnC').hide();
    $('.row .pay_mleft').addClass('pay_cantsel');
  }

  // 点击立即支付
  $('.pay_btnC a').click(function () {
    $('.pay_metlist .row').each(function () {
      if ($(this).find('.checkseled').length > 0) {
        paytype = '';
        paytype = $(this).find('.checkseled input').val();
      }
    });
    // 支付方式 0支付宝 1微信 2快捷支付 3天狮钱包支付 6微信h5支付 7支付宝h5支付 8h5快捷支付
    if (paytype === '') {
      layer.open({
        content: '请选择支付方式！',
        skin: 'msg',
        time: 2 //2秒后自动关闭
      });
      throw '';
    }
    //  else {
    //   if(paytype === '3' && ifIntegral){
    //     exchangeType = (Number(accountInfo.integral) - Number(payinfo.totalIntegral) >= 0) ? '0' : '2'
    //   }else if(paytype === '3' && !ifIntegral){
    //     exchangeType = '1'
    //   }else {
    //     exchangeType = '0'
    //   }
    // }
    // if (accountInfo.memIsRealName === 0 && paytype !== '0' && paytype !== '1') {
    // 	// 是否实名 0未实名 1已实名
    // 	var titletext, content, btntext, canceltext
    // 	if (localStorage.language === 'en') {
    // 		titletext = 'Tips'
    // 		content = 'No real name authentication yet'
    // 		btntext = 'Authentication'
    // 		canceltext = 'Cancel'
    // 	} else {
    // 		titletext = '提示'
    // 		content = '您尚未实名认证，请立即实名'
    // 		btntext = '去实名'
    // 		canceltext = '取消'
    // 	}
    //   tiansLayer({
    //     title:titletext,
    //     content: content,
    //     btn: [ btntext, canceltext ],
    //     yes: function() {
    //       // 提示框关闭公共方法
    //       tiansLayerClose();
    //       gotoRealname();
    //     }
    //   });
    // 	return;
    // }else 
    if (accountInfo.memStatus === 1 && paytype !== '0' && paytype !== '1') {
      // 会员状态  0未冻结 1已冻结
      getHelp();
      return;
    }

    // 埋点立即付款
    orderpayTracker();

    if (isWechat && paytype === '0') {
      // 支付宝h5支付
      paytype = 7;
    } else if (isWechat && paytype === '1') {
      // 微信h5支付
      paytype = 6;
    } else if (isWechat && paytype === '2') {
      // 微信快捷支付
      paytype = 8;
    }

    if (paytype === 8) {
      if (DefaultCardInfo.cardBankCardId === null) {
        $('.pay_pswBody .pp_ptype').html('<img src="../images/wallet_bank.png"/><span>\u8BF7\u9009\u62E9\u94F6\u884C\u5361</span>');
      } else {
        $('.pay_pswBody .pp_ptype').html('<img src="' + DefaultCardInfo.cardBankLogo + '"/><span>' + DefaultCardInfo.cardBankName + '(' + DefaultCardInfo.cardBankNo.substr(DefaultCardInfo.cardBankNo.length - 4) + ')</span>');
      }
      $('.pay_pswBody .pp_ptype').addClass('banksel');
      $('.banksel').click(function () {
        gotoaddBankcard();
      });
      $('.real-ipt').val('');
      // 清空密码输入框的值
      $inputs.each(function () {
        //将有值的当前input 后面的所有input清空
        $(this).val('');
      });
      $wrappers.each(function () {
        $(this).hide();
      });
      $('.pay_pswC').show();
      $('.payC_body').css({ height: '100%', overflow: 'hidden' });
      document.body.addEventListener('touchmove', bodyScroll, false);
    } else if (paytype === '10') {
      // 赢粉宝
      yfbFun();
    } else {
      // 预下单接口
      payForGoodsFun();
    }
  });

  // ios
  $('.real-ipt').focus(function () {
    if (isiOS) {
      $('.pay_pswC .pay_pswBody').css({ top: '50px', bottom: 'auto' });
    }
    document.getElementsByTagName('body')[0].scrollTop = 0;
  });
  $('.real-ipt').blur(function () {
    if (isiOS) {
      $('.pay_pswC .pay_pswBody').css({ top: '0', bottom: '0' });
    }
  });

  // 密码支付
  $('.real-ipt').on('input', function () {
    if (!$(this).val()) {
      //无值
    }
    if (/^[0-9]*$/g.test($(this).val())) {
      //有值且只能是数字（正则）
      pwd = $(this).val().trim();
      len = pwd.length;
      for (var i in pwd) {
        $inputs.eq(i).val(pwd[i]);
        $wrappers.eq(i).show();
      }
      $inputs.each(function () {
        //将有值的当前input 后面的所有input清空
        var index = $(this).index();
        if (index >= len) {
          $(this).val('');
        }
      });
      $wrappers.each(function () {
        var index2 = $(this).index();
        if (index2 >= len) {
          $(this).hide();
        }
      });
      if (len === 6) {
        //执行付款操作
        $('.payC_body').attr('style', 'visibility:visible');
        $('.pay_pswC').hide();
        document.body.removeEventListener('touchmove', bodyScroll, false);
        $('#real-ipt').blur();
      }
    } else {
      //清除val中的非数字，返回纯number的value
      var arr = $(this).val().match(/\d/g);
      try {
        $(this).val($(this).val().slice(0, $(this).val().lastIndexOf(arr[arr.length - 1]) + 1));
      } catch (e) {
        // console.log(e.message)
        //清空
        $(this).val('');
      }
    }
    if (pwd.length === 6) {
      if (paytype === 8) {
        // 快捷支付h5
        payForGoodsFun(pwd);
      } else {
        //积分、余额支付
        h5PswPay(pwd);
      }
    }
  });

  // 支付密码弹框关闭
  $('.pp_close').click(function () {
    $('.payC_body').attr('style', 'visibility:visible');
    $('.pay_pswC').hide();
    document.body.removeEventListener('touchmove', bodyScroll, false);
    keyboard1.hideKeyboard(); // 键盘隐藏
  });
  $('.pay_pswBG').click(function () {
    $('.payC_body').attr('style', 'visibility:visible');
    $('.pay_pswC').hide();
    document.body.removeEventListener('touchmove', bodyScroll, false);
    keyboard1.hideKeyboard(); // 键盘隐藏
  });

  // 如果链接带cardBankName 则设置为快捷支付
  if (cardBankName !== undefined) {
    DefaultCardInfo = {
      cardBankLogo: decodeURI(getUrl(location.href).cardBankLogo),
      cardBankName: decodeURI(getUrl(location.href).cardBankName),
      cardBankNo: decodeURI(getUrl(location.href).cardBankNo),
      cardBankCardId: getUrl(location.href).cardBankCardId
    };
    $('.pay_metlist .kjzfline').click();
    $('.pay_btnC a').click();
  } else {
    DefaultCardGet();
  }
});

// 时间格式转换 不满两位的 补足两位
var min2size = function min2size(val) {
  if (val < 10) {
    return '0' + val;
  } else {
    return val;
  }
};

// 预下单接口
var payForGoodsFun = function payForGoodsFun(pwd) {
  var postdata = '';
  /**
     * payType 1单渠道支付(默认) 2混合渠道支付
     * exchangeType 使用余额抵扣积分 0不使用 1使用 2部分抵扣
     * ifIntegral  是否启用积分支付，true 启用 false 不启用
     */
  if (fromorder === 1) {
    postdata = {
      orderNo: payinfo.orderNo,
      paymentType: paytype,
      exchangeType: ifexchangeType,
      payType: ifpayType,
      returnUrl: 'https://' + location.host + '/shop-h5/html/pay_success.html'
      // returnUrl:'http://172.16.0.68:3000/tiens-point/demo/html/pay_success.html'
    };
    if (paytype === '2' && isWechat || paytype === 8 && isWechat) {
      postdata.cardBankCardId = DefaultCardInfo.cardBankCardId !== null ? DefaultCardInfo.cardBankCardId : '';
    }
  } else {
    postdata = {
      payNo: payinfo.orderNo,
      paymentType: paytype,
      exchangeType: ifexchangeType,
      payType: ifpayType,
      returnUrl: 'https://' + location.host + '/shop-h5/html/pay_success.html'
      // returnUrl:'http://172.16.0.68:3000/tiens-point/demo/html/pay_success.html'
    };
    if (paytype === '2' && isWechat || paytype === 8 && isWechat) {
      postdata.cardBankCardId = DefaultCardInfo.cardBankCardId !== null ? DefaultCardInfo.cardBankCardId : '';
    }
  }
  if (postdata.cardBankCardId === '' && paytype === 8) {
    tiansLayer({
      title: '提示',
      content: '请选择银行卡！',
      btn: ['我知道了'],
      yes: function yes() {
        // 提示框关闭公共方法
        tiansLayerClose();
      }
    });
    // 取消支付回调
    refundIntegral();
    throw '';
  } else if (paytype === '9') {
    // 跳转小通分期选择期次界面
    location.href = './payXtfq.html?newtotalAmount=' + newtotalAmount + '&newtotalIntegral=' + newtotalIntegral + '&ifpayType=' + ifpayType + '&ifexchangeType=' + ifexchangeType;
    throw '';
  }

  // 加载动画
  layer.open({ type: 2 });
  var param = {
    url: 'get/shop/order/payForGoods',
    type: '',
    data: postdata
  };
  ajaxJS(param, function (res) {
    if (res.code === '0') {
      orderPayNo = res.data.orderPayNo;
      sessionStorage.orderPayNo = res.data.orderPayNo;
      layer.closeAll();
      payForGoods = res.data;
      switch (paytype) {
        case '0':
          //支付宝 
          if (isAndroid) {
            window.android.onAliPay(res.data.payInfo.payUrl);
          } else {
            // ios
            window.webkit.messageHandlers.onAliPay.postMessage(res.data.payInfo.payUrl);
          }
          break;
        case '1':
          // 微信支付传参
          var wechatjson = {
            appid: res.data.payInfo.appid,
            partnerid: res.data.payInfo.partnerid,
            prepayid: res.data.payInfo.prepayid,
            noncestr: res.data.payInfo.noncestr,
            timestamp: res.data.payInfo.timestamp,
            packageName: res.data.payInfo.packageName,
            sign: res.data.payInfo.sign
            //微信
          };if (isAndroid) {
            window.android.onWechatPay(JSON.stringify(wechatjson));
          } else {
            // ios
            window.webkit.messageHandlers.onWechatPay.postMessage(JSON.stringify(wechatjson));
          }
          break;
        case '2':
          //快捷支付
          var bankpayval = {
            orderNo: res.data.orderNo,
            orderPayNo: res.data.serialNumber,
            payFee: Number(newtotalAmount).toFixed(2),
            content: payinfo.goodsname,
            payToken: res.data.payToken,
            notifyUrl: res.data.notifyUrl
          };
          if (isAndroid) {
            window.android.onBankPay(JSON.stringify(bankpayval));
          } else {
            // ios
            window.webkit.messageHandlers.onBankPay.postMessage(JSON.stringify(bankpayval));
          }
          break;
        case '3':
          //余额
          $('.banksel').removeClass('banksel');
          $('.pay_pswBody .pp_ptype').html('<img src="../images/shop_yue.png"/><span>余额</span>');
          $('.real-ipt').val('');
          // 清空密码输入框的值
          $inputs.each(function () {
            //将有值的当前input 后面的所有input清空
            $(this).val('');
          });
          $wrappers.each(function () {
            $(this).hide();
          });
          $('.pay_pswC').show();
          $('.payC_body').css({ height: '100%', overflow: 'hidden' });
          document.body.addEventListener('touchmove', bodyScroll, false);
          break;
        // case 6:
        //   // 6 微信h5支付
        //   var form = res.data.payInfo.form;
        //   $(form).appendTo('body').submit();
        //   break;
        case 7:
          // 7 支付宝h5支付
          var form = res.data.payInfo.form;
          $(form).appendTo('body').submit();
          break;
        case 8:
          // 8 h5快捷支付
          h5PswPay(pwd);
          break;
        case '9':
          // 9 小通分期
          var xtfqUrl = res.data.payInfo.comfirmUrl;
          window.open(xtfqUrl);
          break;
        default:
          break;
      }
    } else {
      layer.closeAll();
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
    layer.closeAll();
    layer.open({
      content: error.msg,
      skin: 'msg',
      time: 2 //2秒后自动关闭
    });
  });
};

// 积分余额支付、h5快捷支付 输入好密码的回调
var h5PswPay = function h5PswPay(pwd) {
  var postdata = '';
  if (fromorder === 1) {
    postdata = {
      password: md5(pwd),
      orderNo: payinfo.orderNo,
      payToken: payForGoods.payToken
    };
  } else {
    postdata = {
      password: md5(pwd),
      payNo: payinfo.orderNo,
      payToken: payForGoods.payToken
    };
  }
  var param = {
    url: 'get/shop/order/payConfirm',
    type: '',
    data: postdata
  };
  ajaxJS(param, function (res) {
    $('.payC_body').attr('style', 'visibility:visible');
    $('.pay_pswC').hide();
    document.body.removeEventListener('touchmove', bodyScroll, false);
    if (res.code === '0') {
      onAliWechatPaySuccess();
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

    layer.open({
      content: error.msg,
      skin: 'msg',
      time: 2 //2秒后自动关闭
    });
  });
};

// 支付成功回调事件
// 支付方式 0支付宝 1微信 2快捷支付 3天狮钱包支付 6微信h5支付 7支付宝h5支付 8h5快捷支付 9小通分期  10赢粉宝
var onAliWechatPaySuccess = function onAliWechatPaySuccess() {
  if (paytype !== '2') {
    var param = {
      url: 'get/shop/order/frontdesk/pay/result/add',
      type: '',
      data: {
        payOrdrNo: orderPayNo,
        payResult: 1
      }
    };
    ajaxJS(param, function (res) {
      if (res.code === '0') {
        sessionStorage.paytype = paytype;
        location.href = './pay_success.html';
      }
    }, function (error) {
      layer.open({
        content: error.msg,
        skin: 'msg',
        time: 2 //2秒后自动关闭
      });
    });
  } else {
    sessionStorage.paytype = paytype;
    location.href = './pay_success.html';
  }
};

// 取消支付回调事件
var refundIntegral = function refundIntegral() {
  if (paytype !== '2') {
    var param = {
      url: 'get/shop/order/frontdesk/pay/result/add',
      type: '',
      data: {
        payOrdrNo: orderPayNo,
        payResult: 2
      }
    };
    ajaxJS(param, function (res) {
      if (res.code === '0') {}
    }, function (error) {});
  }
};

// 快捷支付回调方法
var onBankPaySuccess = function onBankPaySuccess() {
  sessionStorage.paytype = paytype;
  location.href = './pay_success.html';
};

// 获取账户余额，积分
var accountInfoGet = function accountInfoGet() {
  var param = {
    url: 'get/shop/order/accountInfo',
    type: '',
    data: {
      memId: memidGet()
    }
  };
  ajaxJS(param, function (res) {
    if (res.code === '0') {
      $('.wx').find('input').attr('disabled', true);
      $('.accountInt label').text(res.data.integral + '分');
      // 积分余额兑换比例
      availableIntegral = 0;
      var hsbl = res.data.extra;
      accountInfo = res.data;
      hsbl = hsbl.split(':');
      // 余额/积分
      hsbl = Number(hsbl[1]) / Number(hsbl[0]);
      moneyintChangebl = hsbl;
      // 余额 积分都够

      if (res.data.integral === 0) {
        $('.scorerow .pay_mright').addClass('pay_cantsel').addClass('integOff');
        ifIntegral = false;
        ifpayType = 1;
        // 若订单需要支付积分 则使用余额抵扣积分 否则不使用
        if (Number(payinfo.totalIntegral) > 0) {
          ifexchangeType = 1;
        } else {
          ifexchangeType = 0;
        }
      }
      // 账户余额可以抵扣积分和支付当钱金额
      if (Number(res.data.amount) - Number(payinfo.totalAmount) - Number(payinfo.totalIntegral) * hsbl >= 0) {
        $('.moneyrow').click();
        // 金额够，积分不一定够
      } else if (Number(res.data.amount) - Number(payinfo.totalAmount) >= 0) {
        // 积分也够
        if (Number(res.data.integral) - Number(payinfo.totalIntegral) >= 0) {
          $('.moneyrow').click();
          // 金额足够抵消积分的不足
        } else if (Number(payinfo.amount) - Number(payinfo.totalAmount) - moneyintChangebl * (Number(payinfo.totalIntegral) - Number(res.data.integral)) >= 0) {
          $('.moneyrow').click();
          // 金额不够抵消相差的积分
        } else {
          $('.moneyrow .pay_mleft').addClass('pay_cantsel');
          $('.moneyrow input').attr('disabled', true);
          // 余额不足默认选中支付宝
          $('.AliPayline').click();
        }
      } else {
        if (Number(res.data.integral) - Number(payinfo.totalIntegral) >= 0) {
          $('.moneyrow .moneypayspan').text('（余额不足）');
          $('.moneyrow .pay_mleft').addClass('pay_cantsel');
          $('.moneyrow input').attr('disabled', true);
          // 余额不足默认选中支付宝
          $('.AliPayline').click();
        } else {
          $('.moneyrow .moneypayspan').text('（余额不足）');
          $('.moneyrow .pay_mleft').addClass('pay_cantsel');
          $('.moneyrow input').attr('disabled', true);
          // 余额不足默认选中支付宝
          $('.AliPayline').click();
        }
      }

      // 验证是否设置了支付密码
      // 是否设置支付密码 0未设置名 1已设置
      if (accountInfo.hasPaymenPassword === 0) {
        $('.pp_set').show();
      }
      pwdSetStatus = accountInfo.pwdSetStatus;
      if (payinfo.totalIntegral === 0) {
        $('.scorerow .pay_mleft').addClass('pay_cantsel');
        $('.scorerow input').attr('disabled', true);
      }
      if (cardBankName !== undefined) {
        $('.pay_metlist .kjzfline').click();
      }
    }
  }, function (error) {
    layer.open({
      content: error.msg,
      skin: 'msg',
      time: 2 //2秒后自动关闭
    });
  });
};

// 获取快捷支付 默认银行卡
var DefaultCardGet = function DefaultCardGet() {
  var param = {
    url: 'get/center/getDefaultCard',
    type: '',
    data: {
      memId: memidGet()
    }
  };
  ajaxJS(param, function (res) {
    if (res.code === '0') {
      DefaultCardInfo = res.data;
    }
  }, function (error) {
    layer.open({
      content: error.msg,
      skin: 'msg',
      time: 2 //2秒后自动关闭
    });
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

// 禁止页面滚动
function bodyScroll(event) {
  event.preventDefault();
}

// 去实名
function gotoRealname() {
  sessionStorage.getItem('pointUrl', location.href);
  location.href = h5pswurl + '/tiens-h5/html/add_bank.html?from=point';
}

// 开户赢粉宝
function gotoYFBaccount() {
  // 前往app 进行赢粉宝开户
  if (isAndroid) {
    window.android.onYfbOpenAccount();
  } else {
    // ios
    window.webkit.messageHandlers.onYfbOpenAccount.postMessage(null);
  }
}

// 支付密码设置
function gotoPaypswd() {
  sessionStorage.getItem('pointUrl', location.href);
  location.href = h5pswurl + '/tiens-h5/html/reset_pwd.html?paymode=pay&from=point';
}

// 选择或添加银行卡
function gotoaddBankcard() {
  sessionStorage.pointUrl = location.href;
  localStorage.setItem('from', 'point');
  location.href = h5pswurl + '/tiens-h5/html/bank_manage.html?mark=1&from=point';
}

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
        content: '<p>您的钱包余额已被冻结，请联系天狮钱包客服:<a style="color: #009943" href="tel:' + res.data.walletServicePhone + '">' + res.data.walletServicePhone + '</a></p>',
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

var eprotocolacNo = ''; // 电子账户协议编号	
var sttlNo = ''; // 特色缴费
var Random = ''; // 密码随机数
var RandJnlNo = ''; // 密码随机数流水号
// 赢粉宝
var yfbFun = function yfbFun() {
  // 加载动画
  // layer.open({ type: 2 })
  $('.payloading').show();
  // setTimeout(() => {
  var param = {
    url: 'get/cmbc/getEProtocolAcNo',
    type: '',
    data: {
      memId: memidGet()
    }
  };
  ajaxJSNew(param, function (res) {
    if (res.code === '0') {
      eprotocolacNo = res.data.eprotocolacNo;
      sttlNo = res.data.sttlNo;
      // 若电子账户协议编号为空 则跳转app 赢粉宝开户界面
      if (eprotocolacNo === null) {
        layer.closeAll();
        $('.payloading').hide();
        tiansLayer({
          title: '提示',
          content: '您还没有开通赢粉宝，是否前往开户？',
          btn: ['去开通', '取消'],
          yes: function yes() {
            // 提示框关闭公共方法
            tiansLayerClose();
            gotoYFBaccount();
          }
        });
        refundIntegral();
        return false;
      }
      var param = {
        url: 'get/cmbc/MEAccountAssetsQuery',
        type: '',
        data: {
          eprotocolacNo: res.data.eprotocolacNo
        }
      };
      ajaxJSNew(param, function (res) {
        layer.closeAll();
        $('.payloading').hide();
      }, function (error) {
        // console.log(error)
        if (error.code === 'DS00000') {
          avalbMoney = 0;
          var AvailableBalance = error.data.AvailableBalance;
          var ProdAvailableShare = error.data.AssetsMap.RYB.ProdAvailableShare;
          avalbMoney = (Number(AvailableBalance) + Number(ProdAvailableShare)).toFixed(2);
          var needMoney = newtotalAmount;
          $('.yfbline .pay_mleft span').text('(\u53EF\u7528\u4F59\u989D \uFFE5' + avalbMoney + ' ' + (Number(needMoney) > Number(avalbMoney) ? '另需从绑定卡扣除 ￥' + (Number(needMoney) - Number(avalbMoney)).toFixed(2) + ')' : ')'));

          if (Number(needMoney) > Number(avalbMoney)) {
            $('.pp_pmoney').html('\n                  <p><i>\u8D62\u7C89\u5B9D\u6263\u9664</i><label>\uFFE5</label>' + avalbMoney + '</p><p><i>\u7ED1\u5B9A\u5361\u6263\u9664</i><label>\uFFE5</label>' + (Number(needMoney) - Number(avalbMoney)).toFixed(2) + '</p>');
          } else {
            $('.pp_pmoney').html('\n                  <p class="p1line"><i>\u8D62\u7C89\u5B9D\u6263\u9664</i> <label>\uFFE5</label>' + newtotalAmount + '</p>');
          }
          $('.pay_pswBody .pp_ptype').html('<img src="../images/personal_yfb1.png"/><span class="spanyfb">赢粉宝<i>(请用民生II类户交易密码)</i></span>');
          //赢粉宝
          var param = {
            url: 'get/cmbc/MELEGenerateRand',
            type: '',
            data: {
              EProtocolAcNo: eprotocolacNo, //电子账户协议编号
              "RandType": "1" // 类型 1-电子账户交易密码;2-查询密码;3-登录密码;4-混合密码
            }
          };
          ajaxJSNew(param, function (res) {
            layer.closeAll();
            $('.payloading').hide();
          }, function (error) {
            if (error.code === 'DS00000') {
              // console.log(error)
              Random = error.data.Random;
              RandJnlNo = error.data.RandJnlNo;
              // 银行键盘显示
              yfbPswkeybdShow();
            } else {
              layer.closeAll();
              $('.payloading').hide();
              layer.open({
                content: error.data.message,
                skin: 'msg',
                time: 2 //2秒后自动关闭
              });
            }
          });
        } else {
          layer.closeAll();
          $('.payloading').hide();
          layer.open({
            content: error.data.message,
            skin: 'msg',
            time: 2 //2秒后自动关闭
          });
        }
      });
    } else {
      refundIntegral();
      layer.closeAll();
      $('.payloading').hide();
    }
  }, function (error) {
    refundIntegral();
    layer.closeAll();
    $('.payloading').hide();
    layer.open({
      content: error.data.message,
      skin: 'msg',
      time: 2 //2秒后自动关闭
    });
  });
  // }, 10);
};

// 赢粉宝h5支付
var yfbH5psw = function yfbH5psw(psw) {
  // 加载动画
  $('.payloading').show();
  // 获取Token
  var param = {
    url: 'get/cmbc/METokenGenerate',
    type: '',
    data: {
      EProtocolAcNo: eprotocolacNo //电子账户协议编号
    }
  };
  ajaxJSNew(param, function (res) {
    layer.closeAll();
    $('.payloading').hide();
  }, function (error) {
    if (error.code === 'DS00000') {
      var ChannelJnlNo = error.data.ChannelJnlNo;
      var Token = error.data.Token;
      var Amount = 0;
      var TransInAmount = '';
      // newtotalAmount 总额
      // avalbMoney 赢粉宝余额
      if (Number(newtotalAmount) > Number(avalbMoney)) {
        Amount = avalbMoney;
        TransInAmount = (Number(newtotalAmount) - Number(avalbMoney)).toFixed(2);
      } else {
        Amount = newtotalAmount;
        TransInAmount = '';
      }
      // 特色缴费 单笔支付缴费
      var param = {
        url: 'get/shop/order/payForGoods',
        type: '',
        data: {
          eProtocolAcNo: eprotocolacNo, //电子账户协议编号
          sttlNo: sttlNo, //	结算编号
          Amount: Amount, // 金额
          TransInAmount: TransInAmount, // 转入金额 如果需要从绑定卡扣款再支付，则该字段必录；否则，该字段一定置空。
          pwdResult: psw, //电子账户交易密码密文
          randJnlNo: RandJnlNo, // 	密码随机数流水号
          Random: Random, // 密码随机数
          remark: '', // 支付摘要
          NoPwdPay: '', // 是否免密支付 Y:免密支付，N或空:需要根据商户配置决定是否校验交易密码 
          // 注：密码支付时，需要校验客户是否对该结算账户签约了自动扣款支付。
          token: Token,
          IsNormalSttl: 'Y', // 是否正常支付
          DiscountAmount: '', // 积分优惠金额
          IsExcdAmtAllowed: 'N', // 超限额是否继续支付 Y-允许；N-不允许。默认为N
          QkPaySttlNo: '', // 快捷支付签约结算编号 在该笔交易可能走超限额支付的情况下，需要上送该字段。该字段对应的是快捷支付签约时上送的结算编号
          paymentType: paytype,
          exchangeType: ifexchangeType,
          payType: ifpayType,
          returnUrl: 'https://' + location.host + '/shop-h5/html/pay_success.html'
        }
      };
      if (fromorder === 1) {
        param.data.orderNo = payinfo.orderNo;
      } else {
        param.data.payNo = payinfo.orderNo;
      }
      ajaxJS(param, function (res) {
        if (res.code === '0') {
          orderPayNo = res.data.orderPayNo;
          sessionStorage.orderPayNo = res.data.orderPayNo;
          // 支付成功
          onAliWechatPaySuccess();
        }
        $('.payloading').hide();
        layer.closeAll();
      }, function (error) {
        layer.closeAll();
        $('.payloading').hide();
        layer.open({
          content: error.msg,
          skin: 'msg',
          time: 2 //2秒后自动关闭
        });
      });
    } else {
      layer.closeAll();
      $('.payloading').hide();
      layer.open({
        content: error.data.message,
        skin: 'msg',
        time: 2 //2秒后自动关闭
      });
    }
  });
};

// 赢粉宝成功回调
var onYfbPaySuccess = function onYfbPaySuccess() {
  onAliWechatPaySuccess();
};

// 获取当前年月日
var getnowDate = function getnowDate() {
  var date = new Date();
  var year = date.getFullYear();
  var month = date.getMonth() + 1 < 10 ? '0' + (date.getMonth() + 1) : date.getMonth() + 1;
  var day = date.getDate() < 10 ? '0' + date.getDate() : date.getDate();
  return year + '-' + month + '-' + day;
};

var keyboard1 = new CFCAKeyboard("CompleteKeyboard", KEYBOARD_TYPE_DIGITAL);
keyboard1.bindInputBox("SIPBox3"); // 绑定输入框
// keyboard1.setServerRandom(Random,"SIPBox3");  //设置服务端随机数
keyboard1.setPublicKey(RSA_PUBLIC_KEY, RSA_PUBLIC_KEY_SIG, "SIPBox3"); //设置键盘类型
keyboard1.setMaxLength(6, "SIPBox3"); // 设置最大输入长度
keyboard1.setDoneCallback(doneCallback); // 设置完成键回调
keyboard1.hideKeyboard(); // 键盘隐藏
function showKeyboard1() {
  keyboard1.showKeyboard(); // 键盘显示
}

// 键盘完成键回调
function doneCallback(sipBoxId) {
  $('#real-ipt').attr('readonly', false);
  $('.pay_pswC').hide();
  clearInterval(keybdInterval);
  keyboard1.hideKeyboard();
  var yfbpswLen = $('#SIPBox3').val().length;
  if (yfbpswLen === 6) {
    // 加载动画
    $('.payloading').show();
    // 获取键盘输入的加密密码
    var yfbPsw = keyboard1.getEncryptedInputValue('SIPBox3');
    yfbH5psw(yfbPsw);
  } else {
    layer.open({
      content: '请输入六位数密码!',
      skin: 'msg',
      time: 2 //2秒后自动关闭
    });
  }
}

$('.keyboardShow').click(function () {
  yfbPswkeybdShow();
});

var keybdInterval = '';
// 银行键盘显示
var yfbPswkeybdShow = function yfbPswkeybdShow() {
  keybdInterval = setInterval(function () {
    if ($('#SIPBox3').val().length > 0) {
      var yfbPsLen = $('#SIPBox3').val().length;
      for (var i = 0; i < yfbPsLen; i++) {
        $wrappers.eq(i).show();
      }
    } else {
      $wrappers.hide();
    }
  }, 300);
  $('.pay_pswC .pay_pswBody').css({ bottom: '4.08rem' });
  // 清空密码输入框的值
  $inputs.each(function () {
    //将有值的当前input 后面的所有input清空
    $(this).val('');
  });
  $wrappers.each(function () {
    $(this).hide();
  });
  $('#real-ipt').val('');
  $('#real-ipt').attr('readonly', true);
  $('.pay_pswC').show();
  keyboard1.clearInputValue('SIPBox3'); // 输入框内容清空
  keyboard1.setServerRandom(Random, "SIPBox3"); //设置服务端随机数
  initSIPEncryptor('SIPBox3'); // 初始化加密参数
  keyboard1.showKeyboard(); // 键盘显示
  layer.closeAll();
  $('.payloading').hide();
};