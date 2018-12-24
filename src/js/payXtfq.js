let payinfo = JSON.parse(sessionStorage.payinfo)
let newtotalAmount = getUrl(location.href).newtotalAmount
let newtotalIntegral = getUrl(location.href).newtotalIntegral
let ifpayType = getUrl(location.href).ifpayType
let ifexchangeType = getUrl(location.href).ifexchangeType
var submiting = false;
$(function() {
  if (!isWechat && isAndroid) {
    window.android.isShowSubTitle(false)
  } else if(!isWechat) {
    window.webkit.messageHandlers.isShowSubTitle.postMessage(false)
  }
  $('body').delegate('.layui-m-layershade', 'click', function(ev) {
    ev.preventDefault()
  })
  var param = {
    url: 'html/get/center/getMember',
    type: '',
    data: {
      memId: memidGet(),
    }
  }
  ajaxJS(
    param,
    res => {
      $('#name').val(res.data.realName)
    },
    error => {
    }
  )
  if(!isWechat){
    // 顶部高度计算
    $('.navigation').css({
      height: ((90 + statusBarHeight) / 75).toFixed(4) + 'rem',
      'padding-top': (statusBarHeight / 75).toFixed(4) + 'rem'
    })
    $('.add_content').css({
      'padding-top': ((90 + statusBarHeight) / 75).toFixed(4) + 'rem'
    })
  }
  $('.navigation').css('visibility','visible');
  $('.add_content').css('visibility','visible');

  // 期次选择
  $('.nperC div').click(function(){
    $('.nperCSel').removeClass('nperCSel')
    $(this).addClass('nperCSel')
  })
  
  $('.payMoney').text("￥"+newtotalAmount)

  // 保存
  $('.submit_btn').click(function() {
    if (submiting === true) {
      layer.open({
        content: '请勿重复提交！',
        skin: 'msg',
        time: 2 //2秒后自动关闭
      })
      throw ''
    }
    $('.required').each(function() {
      if ($(this).val() === '') {
        tiansLayer({
          title:'提示',
          content:
            '请输入' + $(this).parents('.consignee').find('.title').text() +'!',
          btn: ['我知道了'],
          yes: function() {
            // 提示框关闭公共方法
            tiansLayerClose()
          }
        });
        throw ''
      }
    })
    var reg = /^[1][0-9]{10}$/
    if (!reg.test($('#phone').val())) {
      tiansLayer({
        title:'提示',
        content: '手机号格式错误！',
        btn: ['我知道了'],
        yes: function() {
          // 提示框关闭公共方法
          tiansLayerClose()
        }
      });
      throw ''
    }
    submiting = true;
    setTimeout(() => {
      submiting = false;
    }, 3000);
    
    payForGoods()
  })

  const payForGoods = () => {
    let fromorder = payinfo.fromorder
    let postdata = ''
    /**
     * payType 1单渠道支付(默认) 2混合渠道支付
     * exchangeType 使用余额抵扣积分 0不使用 1使用 2部分抵扣
     * ifIntegral  是否启用积分支付，true 启用 false 不启用
     */
    if (fromorder === 1) {
      postdata = {
        orderNo: payinfo.orderNo,
        paymentType: 9,
        exchangeType: ifexchangeType,
        payType : ifpayType,
        returnUrl: 'https://' + location.host + '/shop-h5/html/order_all.html',
        // returnUrl:'http://172.16.0.68:3000/H5/tiens-point/demo/html/pay_success.html',
        nper:$(".nperCSel").attr("nperNum"),
        channel: 1,
        memPhone: $('#phone').val(),
        memName: $("#name").val()
      }
    } else {
      postdata = {
        payNo: payinfo.orderNo,
        paymentType: 9,
        exchangeType: ifexchangeType,
        payType : ifpayType,
        returnUrl: 'https://' + location.host + '/shop-h5/html/order_all.html',
        // returnUrl:'http://172.16.0.68:3000/H5/tiens-point/demo/html/pay_success.html',
        nper:$(".nperCSel").attr("nperNum"),
        channel: 1,
        memPhone: $('#phone').val(),
        memName: $("#name").val()
      }
    }
    
    var param = {
      url: 'get/shop/order/payForGoods',
      type: '',
      data: postdata
    }
    ajaxJS(
      param,
      res => {
        submiting = false;
        let xtfqUrl = res.data.payInfo.comfirmUrl
        sessionStorage.paytype = 9
        if (!isWechat && isAndroid) {
          window.android.isShowSubTitle(true)
        } else if(!isWechat) {
          window.webkit.messageHandlers.isShowSubTitle.postMessage(true)
        }
        location.href = xtfqUrl
      },
      error => {
        submiting = false;
        layer.open({
          content: error.msg,
          skin: 'msg',
          time: 2 //2秒后自动关闭
        })
      }
    )
  }

  var isPageHide = false
  // 兼容ios返回不刷新的问题
  window.addEventListener('pageshow', function() {
    if (isPageHide) {
      window.location.reload()
    }
  })
  window.addEventListener('pagehide', function() {
    isPageHide = true
  })

  // ios软键盘弹起来的时候 页面跳转到最上面，禁止页面滚动
  $('textarea').focus(function(){
    document.getElementsByTagName('body')[0].scrollTop = 0
    document.body.addEventListener('touchmove',bodyScroll,false);
  })
  $('textarea').blur(function(){
    document.body.removeEventListener('touchmove',bodyScroll,false);
  })
  $('input').focus(function(){
    document.getElementsByTagName('body')[0].scrollTop = 0
    document.body.addEventListener('touchmove',bodyScroll,false);
  })
  $('input').blur(function(){
    document.body.removeEventListener('touchmove',bodyScroll,false);
  })

  // 失去焦点时 去除表情
  $("#consignee").blur(function(){
    let name = $("#consignee").val().replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "");
    name = name.replace(/\s+/g,"");
    $(this).val(name);
  });
  $("#detailAddress").blur(function(){
    let name = $("#detailAddress").val().replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "");
    name = name.replace(/\s+/g,"");
		$(this).val(name);
  });
})

//获取地址栏参数
const getUrl = function(url) {
  url = !url ? location.search : url
  var temp = {}
  if (url.indexOf('?') != -1) {
    var params = url.substr(url.indexOf('?') + 1).split('&')
    for (var i = 0; i < params.length; i++) {
      var param = params[i].split('=')
      temp[param[0]] = param[1]
    }
    return temp
  } else {
    return false
  }
}

// 禁止页面滚动
function bodyScroll(event){  
  event.preventDefault();  
}