'use strict';

var orderNo = '';
var iforderlastpro = getUrl(location.href).iforderlastpro;
var submitsuccess = false;
var suborderno = '';
var refundType = '';
var RefundReasonslist = [];
var ifedit = '';
var iflastAfterserv_app = false;

$(function () {
  if (!isWechat) {
    // 顶部高度计算
    $('.navigation').css({
      height: ((90 + statusBarHeight) / 75).toFixed(4) + 'rem',
      'padding-top': (statusBarHeight / 75).toFixed(4) + 'rem'
    });
    $('.refund_box').css({
      'padding-top': ((90 + statusBarHeight) / 75).toFixed(4) + 'rem'
    });
  }
  $('.navigation').css('visibility', 'visible');
  $('.refund_box').css('visibility', 'visible');

  orderNo = getUrl(location.href).orderNo;
  suborderno = getUrl(location.href).suborderno;
  refundType = getUrl(location.href).refundType;
  ifedit = getUrl(location.href).ifedit;

  if (ifedit !== undefined) {
    // 退款详情
    RefundResultGet();

    $('.textarealine textarea').remove();
    $('.refund_upload .uploadimg').hide();
    $('.assessSubC').hide();
    $('.infoline .select').css({
      background: "url('')",
      'padding-right': '0'
    });
  } else {
    //退款申请
    // 订单详情
    getOrderDetail();
    // 退款原因列表
    refundReasonGet();
    // 绑定退款原因选择
    $('.lineright.select').click(function () {
      drawbackMethod();
    });
    $('.refundType').text(refundType === '1' ? '仅退款' : refundType === '2' ? '退货退款' : '仅换货');
    $('.aftersaleResText').text(refundType === '1' ? '退款原因' : refundType === '2' ? '退货退款原因' : '换货原因');
    $('.thtext').text(refundType === '1' ? '退款说明' : refundType === '2' ? '退货退款说明' : '换货说明');
    $('.instructions').attr('placeholder', refundType === '1' ? '这里是退款说明' : refundType === '2' ? '这是里退货退款说明' : '这里是换货说明');
    // 换货的时候不要显示金额
    if (refundType === '3') {
      $('.refundAmoutline').hide();
    }
  }
  // 退款原因选择
  $('body').delegate('.shipselC .row', 'click', function () {
    $('.checkseled').removeClass('checkseled');
    $(this).find('.ifcheck').addClass('checkseled');
    $(this).find('input').prop('checked', true);
  });
  // 退款原因选择
  $('body').delegate('.shipSubC a', 'click', function () {
    var reasonId = $('input[name="refundReason"]:checked').val();
    $('.select').text($('.checkseled').siblings('.reasonName').text());
    $('.select').attr('reasonId', reasonId);
    layer.closeAll();
  });

  // 图片上传
  $('#csl_file').change(function () {
    var self = $(this);
    var name = $(this)[0].files[0].name;
    var file = $(this)[0].files[0];
    if (!/image\/\w+/.test(file.type)) {
      layer.open({
        content: '请选择图片',
        skin: 'msg',
        time: 1 //2秒后自动关闭
      });
      throw '';
    }

    imginputchange('csl_file', function (res) {
      layer.closeAll();
      $('.uploadimg').before('<div class="img"><img src="' + res.data[0].bigUrl + '" bigUrl=\'' + res.data[0].bigUrl + '\' smallUrl=\'' + res.data[0].smallUrl + '\' class="imgData"><span class="imgdel"></span></div>');
      if ($('.refund_upload .img').length >= 4) {
        $('.uploadimg').hide();
      } else {
        $('.uploadimg').show();
      }
    });
  });

  // 图片删除
  $('.refund_upload').delegate('.imgdel', 'click', function () {
    $(this).parent('.img').remove();
    if ($('.refund_upload .img').length >= 4) {
      $('.uploadimg').hide();
    } else {
      $('.uploadimg').show();
    }
  });

  var fileSelect = document.getElementById('uploadimg'),
      fileElem = document.getElementById('csl_file');
});
var getOrderDetail = function getOrderDetail() {
  var param = {
    url: 'get/shop/order/getOrderDetail',
    type: '',
    data: {
      orderNo: orderNo
    }
  };
  ajaxJS(param, function (res) {
    var assessarr = '';
    for (var i in res.data.product) {
      if (res.data.product[i].subOrderNo === suborderno) {
        assessarr += '\n                <a class="commodity" href="./shop_detail.html?id=' + res.data.product[i].goodsId + '" goodsId=\'' + res.data.product[i].goodsId + '\'>\n                    <div class="img"><img src="' + (res.data.product[i].goodsImageUrl === '' ? '../images/shop_nopic.png' : res.data.product[i].goodsImageUrl) + '" alt=""></div>\n                    <div class="detail">\n                        <div class="title">' + res.data.product[i].goodsName + '</div>\n                        <div class="describe">' + res.data.product[i].productName + '</div>\n                    </div>\n                </a>\n                ';
        // refundIntegral   应退积分  refundAmount 应退金额    商品的总的退款积分和金额  不包含邮费
        var refundMoney = Number(res.data.product[i].refundAmount);
        // data  下面加个refundFreightFlag   1的话退邮费  0 的话不退
        if (refundType === '1' && res.data.refundFreightFlag === 1 && (refundType === '1' || refundType === '2')) {
          refundMoney = (refundMoney + res.data.freight).toFixed(2);
        }

        $('.refundAmoutline .lineright').text('\xA5 ' + refundMoney + '\n                ' + (res.data.product[i].refundIntegral === 0 || res.data.product[i].refundIntegral === null ? '' : ' + ' + res.data.product[i].refundIntegral + '分') + '\n                ');
      }
    }
    if (res.data.product.length === 1) {
      iflastAfterserv_app = true;
    }
    $('.prolist').html(assessarr);
    // Imglazy();
    $('.inithide').css('visibility', 'visible');
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

// 退款原因列表获取
var refundReasonGet = function refundReasonGet() {
  var param = {
    url: 'get/shop/order/listRefundReasons',
    type: '',
    data: {}
  };
  ajaxJS(param, function (res) {
    if (res.code === '0') {
      $('.select').text(res.data[0].reasonName);
      $('.select').attr('reasonId', res.data[0].reasonId);
      RefundReasonslist = res.data;
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

// 图片上传
var focusclick = function focusclick() {}
// $('#csl_file').click();
// var el = document.getElementById("csl_file");
// el.addEventListener("touchend", handleEnd, false);


// 退款原因列表
;var drawbackMethod = function drawbackMethod() {
  var reasonlist = [];
  var reasonId = Number($('.select').attr('reasonId'));
  // console.log(reasonId)
  for (var i in RefundReasonslist) {
    reasonlist += '\n        <label class=\'row\'><div class=\'reasonName\'>' + RefundReasonslist[i].reasonName + '</div><div class="ifcheck checksel ' + (RefundReasonslist[i].reasonId === reasonId ? 'checkseled' : '') + '"><input type=\'radio\' name=\'refundReason\' ' + (RefundReasonslist[i].reasonId === reasonId ? 'checked' : '') + '  value=\'' + RefundReasonslist[i].reasonId + '\'/></div></label>\n        ';
  }
  layer.open({
    type: 1,
    content: '\n        <div class=\'shipmetC\'>\n            <div class=\'title\'>\u9000\u6B3E\u539F\u56E0</div>\n            <div class=\'shipselC\'>\n                ' + reasonlist + '\n            </div>\n            <div class=\'shipSubC\'>\n                <a>\u786E\u8BA4</a>\n            </div>\n        </div>\n        ',
    anim: 'up',
    style: 'position:fixed; bottom:0; left:0; width: 100%; padding:0.266667rem 0; border:none;'
  });
  $('.layui-m-layercont').addClass('layernormal');
};

// 退款申请提交
var refundSubmit = function refundSubmit() {
  if ($('.instructions').val() === '') {
    layer.open({
      content: '请输入退款说明!',
      skin: 'msg',
      time: 2 //2秒后自动关闭
    });
    throw '';
  }
  var imgUrl = [];
  $('.refund_upload .img').each(function () {
    imgUrl.push($(this).find('img').attr('bigUrl'));
  });

  var param = {
    url: 'get/shop/order/refund',
    type: '',
    data: {
      subOrderNo: suborderno,
      reasonId: $('.select').attr('reasonId'),
      instructions: $('.instructions').val(),
      imgUrl: imgUrl,
      refundType: refundType
    }
  };
  ajaxJS(param, function (res) {
    layer.closeAll();
    if (res.code === '0') {
      // 埋点申请售后
      aftersaleTracker('', '', '', '', $('.commodity').attr('goodsId'), $('.commodity .title').text(), $('.refundType').text(), $('.select').text(), $('.instructions').val());
      if (iforderlastpro !== undefined || iflastAfterserv_app) {
        setTimeout(function () {
          location.href = './order_all.html?type=5';
        }, 300);
      } else {
        setTimeout(function () {
          location.href = './order_detail.html?orderNo=' + orderNo;
        }, 300);
      }
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
};

// 获取退款详情
var RefundResultGet = function RefundResultGet() {
  var param = {
    url: 'get/shop/order/getRefundResult',
    type: '',
    data: {
      subOrderNo: suborderno
    }
  };
  ajaxJS(param, function (res) {
    if (res.code === '0') {
      $('.prolist').html('\n                <a class="commodity" href="./shop_detail.html?id=' + res.data.goodsId + '">\n                    <div class="img"><img src="' + (res.data.goodsImageUrl === '' ? '../images/shop_nopic.png' : res.data.goodsImageUrl) + '" alt=""></div>\n                    <div class="detail">\n                        <div class="title">' + res.data.goodsName + '</div>\n                        <div class="describe">' + res.data.productName + '</div>\n                    </div>\n                </a>\n            ');
      // 1 退款 2 退货退款 3 换货
      $('.refundType').text(res.data.afterServiceType === '1' ? '仅退款' : res.data.afterServiceType === '2' ? '退货退款' : '仅换货');
      $('.thtext').text(res.data.afterServiceType === '1' ? '退款说明' : res.data.afterServiceType === '2' ? '退货说明' : '换货说明');

      // 换货的时候不要显示金额
      if (res.data.afterServiceType === '3') {
        $('.refundAmoutline').hide();
      }
      $('.lineright.select').text(res.data.refundReason);
      $('.refundAmoutline .lineright').text('\xA5 ' + res.data.refundAmount.toFixed(2) + '\n          ' + (res.data.refundIntegral === 0 || res.data.refundIntegral === null ? '' : '+' + res.data.refundIntegral + '积分') + '\n          ');
      $('.textarealine').html('<p>' + res.data.instructions + '</p>');
      $('.infoline .textarealine').css('height', 'auto');
      var imglist = '';
      for (var i in res.data.imageUrl) {
        imglist += '\n                <div class="img"><img src="' + res.data.imageUrl[i] + '"></span></div>\n                ';
      }
      $('.refund_upload').html(imglist);

      // 0未退款 1售后中 2:已完成 3已拒绝 4商家同意售后 5等待退款换货
      switch (res.data.refundStatus) {
        case 1:
          $('.saleaft_status .lineright').text('\u7B49\u5F85\u5546\u5BB6\u786E\u8BA4');
          $('.saleaft_status').show();
          break;
        case 2:
          // 实物有物流
          if (res.data.afterServiceType === '3') {
            $('.saleaft_status .lineright').html('\u5DF2\u5B8C\u6210<a href=\'./logistics.html?orderNo=' + orderNo + '&&logisticsNo=' + res.data.sellerLogisticsNo + '\'>\u67E5\u770B\u7269\u6D41</a>');
          } else {
            $('.saleaft_status .lineright').html('\u5DF2\u5B8C\u6210');
          }
          $('.saleaft_status').show();
          break;
        case 3:
          $('.saleaft_status .lineright').html('\u5DF2\u62D2\u7EDD');
          $('.saleaft_status').show();
          break;
        case 4:
          // 实物有物流
          if (res.data.afterServiceType !== '1') {
            $('.saleaft_status .lineright').html('\u552E\u540E\u4E2D<a href=\'./costumer_sg.html?redundId=' + res.data.refundId + '&&subOrderNo=' + suborderno + '&&orderNo=' + orderNo + '\'>\u53BB\u53D1\u8D27</a>');
          } else {
            $('.saleaft_status .lineright').html('\u552E\u540E\u4E2D');
          }
          $('.saleaft_status').show();
          break;
        case 5:
          // 实物有物流
          if (res.data.afterServiceType !== '1') {
            $('.saleaft_status .lineright').html('\u552E\u540E\u4E2D<a href=\'./logistics.html?orderNo=' + orderNo + '&&logisticsNo=' + res.data.buyerLogisticsNo + '\'>\u67E5\u770B\u7269\u6D41</a>');
          } else {
            $('.saleaft_status .lineright').html('\u552E\u540E\u4E2D');
          }
          $('.saleaft_status').show();
          break;
        default:
          break;
      }

      // 仅退款不显示发货
      if (res.data.afterServiceType === '1') {
        $('.lineright').find('a').hide();
      }
      $('.inithide').css('visibility', 'visible');
      // Imglazy();
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

// 图片上传
var imginputchange = function imginputchange(inputid, sucFun) {
  layer.open({
    type: 2,
    content: '上传中'
  });
  var ele = $('#' + inputid);
  var all = ele[0].files;
  var reader = new FileReader();
  var album = [];
  var length = all.length;
  var i = 0;
  var recur = function recur() {
    reader.readAsDataURL(all[i]);
    var One = all[i];
    reader.onload = function (e) {
      One.data = this.result;
      album.push(One);
      i++;
      if (i < length) {
        recur();
      } else {
        ele.value = '';
        //alert(i);
        callBack(album, sucFun);
      }
    };
  };
  recur();
};

var callBack = function callBack(album, sucFun) {
  var arg = album[0].data;
  var imgName = album[0].name;
  var imgType = album[0].type;
  var size = parseInt(album[0].size / 1024); //大小kb
  var img = '<img class="scaleImg" src="' + arg + '" alt="">';
  var canvas = $('<canvas>')[0];
  var canvasCtx = canvas.getContext('2d');

  $(img)[0].onload = function () {
    var imgWidth = $(img)[0].width;
    var imgHeight = $(img)[0].height;
    var orient = getPhotoOrientation($(img)[0]);
    // var orient = 0
    canvas.width = imgWidth;
    canvas.height = imgHeight;
    canvasCtx.drawImage($(img)[0], 0, 0, imgWidth, imgHeight);
    // 需要顺时针（向左）90度旋转
    // rotateImg($(img)[0], 'left', canvas)
    switch (orient) {
      case 6:
        //需要顺时针（向左）90度旋转
        //	                alert('需要顺时针（向左）90度旋转');
        rotateImg($(img)[0], 'left', canvas);
        break;
      case 8:
        //需要逆时针（向右）90度旋转
        //	                alert('需要顺时针（向右）90度旋转');
        rotateImg($(img)[0], 'right', canvas);
        break;
      case 3:
        //需要180度旋转
        //	                alert('需要180度旋转');
        rotateImg($(img)[0], 'right', canvas); //转两次
        rotateImg($(img)[0], 'right', canvas);
        break;
    }

    var base64 = '';
    var ratio = 1;
    if (size > 10 * 1024) {
      ratio = 0.02;
    } else if (size > 1 * 1024) {
      ratio = 0.25;
    } else if (size > 200) {
      ratio = 0.6;
    } else {}
    //			console.log(ratio);
    //			console.log(base64)
    if (ratio == 1) {
      base64 = arg;
    } else {
      base64 = canvas.toDataURL('image/jpeg', ratio);
    }

    var picFile = uploadPic(base64, imgType);
    var imgEnd = '<img class="scaleImg" src="' + base64 + '" alt="">';
    sendPic(picFile, imgEnd, imgName, sucFun);
  };
};
function uploadPic(basestr, type) {
  var text = window.atob(basestr.split(',')[1]);

  var buffer = new ArrayBuffer(text.length);

  var ubuffer = new Uint8Array(buffer);

  var pecent = 0,
      loop = null;

  for (var i = 0; i < text.length; i++) {
    ubuffer[i] = text.charCodeAt(i);
  }

  var Builder = window.WebKitBlobBuilder || window.MozBlobBuilder;

  var blob;

  if (Builder) {
    var builder = new Builder();
    builder.append(buffer);
    blob = builder.getBlob(type);
  } else {
    blob = new window.Blob([buffer], { type: type });
  }
  return blob;
}
//获取照片的元信息（拍摄方向）
function getPhotoOrientation(img) {
  var orient;
  EXIF.getData(img, function () {
    orient = EXIF.getTag(this, 'Orientation');
  });
  return orient;
}
//对图片旋转处理
function rotateImg(img, direction, canvas) {
  //最小与最大旋转方向，图片旋转4次后回到原方向
  var min_step = 0;
  var max_step = 3;
  //var img = document.getElementById(pid);
  if (img == null) return;
  //img的高度和宽度不能在img元素隐藏后获取，否则会出错
  var height = img.height;
  var width = img.width;
  var step = 2;
  if (step == null) {
    step = min_step;
  }
  if (direction == 'right') {
    step++;
    //旋转到原位置，即超过最大值
    step > max_step && (step = min_step);
  } else {
    step--;
    step < min_step && (step = max_step);
  }
  //旋转角度以弧度值为参数
  var degree = step * 90 * Math.PI / 180;
  var ctx = canvas.getContext('2d');
  switch (step) {
    case 0:
      canvas.width = width;
      canvas.height = height;
      ctx.drawImage(img, 0, 0);
      break;
    case 1:
      canvas.width = height;
      canvas.height = width;
      ctx.rotate(degree);
      ctx.drawImage(img, 0, -height);
      break;
    case 2:
      canvas.width = width;
      canvas.height = height;
      ctx.rotate(degree);
      ctx.drawImage(img, -width, -height);
      break;
    case 3:
      canvas.width = height;
      canvas.height = width;
      ctx.rotate(degree);
      ctx.drawImage(img, -width, 0);
      break;
  }
}
function sendPic(picFile, img, fileName, sucFun) {
  var formData = new FormData();
  formData.append('fileList', picFile, fileName);
  formData.append('memId', memidGet());
  var xhr = new XMLHttpRequest();
  xhr.onreadystatechange = function (e) {
    if (xhr.readyState == 4) {
      if (xhr.status >= 200 && xhr.status < 300 || xhr.status == 304) {
        var jsonData = JSON.parse(xhr.responseText);
        if (jsonData.code === '0') {
          sucFun(jsonData);
        } else {
          layer.closeAll();
          layer.open({
            content: jsonData.msg,
            skin: 'msg',
            time: 1 //2秒后自动关闭
          });
        }
      }
    }
  };
  xhr.onloadend = function () {
    //无论失败或成功
    // layer.closeAll();
  };
  xhr.onerror = function (res) {
    //网络失败
    console.log('网络失败');
    layer.closeAll();
    layer.open({
      content: res.msg,
      skin: 'msg',
      time: 1 //2秒后自动关闭
    });
  };
  // 开始上传
  xhr.open('POST', fileuploadUrl, true);
  xhr.setRequestHeader('X-Token', token);
  xhr.setRequestHeader('X-Language', localStorage.getItem('language') == 'en' ? '2' : '1');
  xhr.send(formData);
}

function dispatch(dom, type) {
  try {
    var evt = document.createEvent('Event');
    evt.initEvent(type, true, true);
    dom.dispatchEvent(evt);
  } catch (e) {
    alert(e);
  }
}

// 凭证图片放大预览
$('.refund_upload').delegate('img', 'click', function () {
  var imgArr = [];
  $('img[class=imgData]').each(function () {
    var src = $(this).attr('src');
    imgArr.push(src);
  });
  var srcData = $(this).attr('src');
  $('.bigImg').find('img').attr('src', srcData);
  $('.bigImg').css('display', 'flex');
});

$('.bigImg').click(function () {
  $('.bigImg').fadeOut(500);
});