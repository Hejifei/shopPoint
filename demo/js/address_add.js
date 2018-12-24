'use strict';

var submiting = false;
$(function () {
  $('body').delegate('.layui-m-layershade', 'click', function (ev) {
    ev.preventDefault();
  });
  if (!isWechat) {
    // 顶部高度计算
    $('.navigation').css({
      height: ((90 + statusBarHeight) / 75).toFixed(4) + 'rem',
      'padding-top': (statusBarHeight / 75).toFixed(4) + 'rem'
    });
    $('.add_content').css({
      'padding-top': ((90 + statusBarHeight) / 75).toFixed(4) + 'rem'
    });
  }
  $('.navigation').css('visibility', 'visible');
  $('.add_content').css('visibility', 'visible');

  var ranges = ['\uD83C[\uDF00-\uDFFF]', '\uD83D[\uDC00-\uDE4F]', '\uD83D[\uDE80-\uDEFF]'];

  var orderSumType = getUrl(location.href).orderSumType;
  var addressId = getUrl(location.href).addressId;
  if (addressId !== undefined && localStorage.adsEdit) {
    var adsEdit = JSON.parse(localStorage.adsEdit);
    $('#location').val(adsEdit.area);
    $('#detailAddress').val(adsEdit.detailAddress);
    $('#consignee').val(adsEdit.consignee);
    $('#phone').val(adsEdit.phone);
    $('#defaultStatus').prop('checked', adsEdit.defaultStatus === 1 ? true : false);
    if (adsEdit.defaultStatus === 1) {
      $('.ifcheck').addClass('checkseled');
    }
  }
  $('#location').cityPicker({
    toolbarTemplate: '<header class="bar bar-nav">\
        <button class="button button-link pull-right close-picker">确定</button>\
        <h1 class="title">选择收货地址</h1>\
        </header>'
  });
  // 默认地址选择
  $('.ifcheck').click(function () {
    if ($(this).hasClass('checkseled')) {
      $(this).removeClass('checkseled');
      $(this).find('input').prop('checked', false);
    } else {
      $(this).addClass('checkseled');
      $(this).find('input').prop('checked', true);
    }
  });

  // 保存
  $('.submit_btn').click(function () {
    if (addressId === undefined && submiting === true) {
      layer.open({
        content: '请勿重复提交！',
        skin: 'msg',
        time: 2 //2秒后自动关闭
      });
      setTimeout(function () {
        window.location.reload();
      }, 1000);
      throw '';
    }
    $('.required').each(function () {
      if ($(this).val() === '') {
        tiansLayer({
          title: '提示',
          content: '请输入' + $(this).parents('.consignee').find('.title').text() + '!',
          btn: ['我知道了'],
          yes: function yes() {
            // 提示框关闭公共方法
            tiansLayerClose();
          }
        });
        throw '';
      }
    });
    var reg = /^[1][0-9]{10}$/;
    if (!reg.test($('#phone').val())) {
      tiansLayer({
        title: '提示',
        content: '手机号格式错误！',
        btn: ['我知道了'],
        yes: function yes() {
          // 提示框关闭公共方法
          tiansLayerClose();
        }
      });
      throw '';
    }
    if ($('#detailAddress').val().length < 5 || $('#detailAddress').val().length > 50) {
      tiansLayer({
        title: '提示',
        content: '详细地址不少于5或大于50个字！',
        btn: ['我知道了'],
        yes: function yes() {
          // 提示框关闭公共方法
          tiansLayerClose();
        }
      });
      throw '';
    }
    submiting = true;
    setTimeout(function () {
      submiting = false;
    }, 3000);
    var param = {
      url: 'get/shop/user/insertOrUpdateAddress',
      type: '',
      data: {
        memId: memidGet(),
        addressId: addressId === undefined ? '' : addressId,
        area: $('#location').val(),
        detailAddress: $('#detailAddress').val(),
        consignee: $('#consignee').val(),
        phone: $('#phone').val(),
        defaultStatus: $('#defaultStatus').prop('checked') ? 1 : 0
      }
    };
    ajaxJS(param, function (res) {
      submiting = false;
      var url = './address_list.html';
      if (orderSumType !== undefined) {
        var balancelist = getUrl(location.href).balancelist.split(',');
        url = './address_list.html?balancelist=' + balancelist + '&orderSumType=' + orderSumType;
      }
      tiansLayer({
        title: '提示',
        content: res.msg,
        btn: ['我知道了'],
        yes: function yes() {
          // 提示框关闭公共方法
          tiansLayerClose();
          location.href = url;
        }
      });
    }, function (error) {
      submiting = false;
      layer.open({
        content: error.msg,
        skin: 'msg',
        time: 2 //2秒后自动关闭
      });
    });
  });

  var isPageHide = false;
  // 兼容ios返回不刷新的问题
  window.addEventListener('pageshow', function () {
    if (isPageHide) {
      window.location.reload();
    }
  });
  window.addEventListener('pagehide', function () {
    isPageHide = true;
  });

  // ios软键盘弹起来的时候 页面跳转到最上面，禁止页面滚动
  $('textarea').focus(function () {
    // alert($('body').height)
    document.getElementsByTagName('body')[0].scrollTop = 0;
    document.body.addEventListener('touchmove', bodyScroll, false);
  });
  $('textarea').blur(function () {
    document.body.removeEventListener('touchmove', bodyScroll, false);
  });
  $('input').focus(function () {
    document.getElementsByTagName('body')[0].scrollTop = 0;
    document.body.addEventListener('touchmove', bodyScroll, false);
  });
  $('input').blur(function () {
    document.body.removeEventListener('touchmove', bodyScroll, false);
  });

  // 失去焦点时 去除表情
  $("#consignee").blur(function () {
    var name = $("#consignee").val().replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "");
    name = name.replace(/\s+/g, "");
    $(this).val(name);
  });
  $("#detailAddress").blur(function () {
    var name = $("#detailAddress").val().replace(/\uD83C[\uDF00-\uDFFF]|\uD83D[\uDC00-\uDE4F]/g, "");
    name = name.replace(/\s+/g, "");
    $(this).val(name);
  });
});

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