'use strict';

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

var qrcode = '';
var appdownurl = h5pswurl + '/tiens-h5/html/download.html';
var undercarriage = ''; //1上架  2 下架
var goodDetail = '';

var goodsid = '';
var specificationProductIdList = '';
var shopId = '';
var probuyInfo = '';
var defaultGoods = '';
var shareJson = '';
var enterSectime = 0;
var topSwiper = '';
var detSwiper = '';
var wakeOrInstallApp = ''; // 唤醒或下载app方法
var ifshare = getUrl(location.href).share ? true : false; // 是否来自app分享
var fromshare = sessionStorage.fromshare ? true : false; //是否来自分享的别的页面进来
var ifdownloading = false;

// webview兼容rem
var html = document.getElementsByTagName('html')[0];
var settingFs = 0;
var settedFs = settingFs = parseInt(html.style.fontSize);
var whileCount = 0;
while (true) {
  var realFs = parseInt(window.getComputedStyle(html).fontSize);
  var delta = realFs - settedFs;
  if (Math.abs(delta) >= 1) {
    //不相等
    if (delta > 0) settingFs--;else settingFs++;
    html.setAttribute('style', 'font-size:' + settingFs + 'px!important');
  } else break;
  if (whileCount++ > 100 //之所以弄个100的循环跳出的原因，在于实在无法预判设备是否能计算得到36px，比如设备只能计算35px，37px，这样会死循环只能跳出了
  ) break;
}

$(function () {
  // 若连接中带sta=1 则跳转下载页面
  if (getUrl(location.href).sta == 1) {
    if (getUrl(location.href).invitationCode) {
      window.location.href = appdownurl + '?invitationCode=' + getUrl(location.href).invitationCode;
    } else {
      window.location.href = appdownurl;
    }
  }
});

//openinstall初始化时将与openinstall服务器交互，应尽可能早的调用
/*web页面向app传递的json数据(json string/js Object)，应用被拉起或是首次安装时，通过相应的android/ios api可以获取此数据*/
var openappdata = OpenInstall.parseUrlParams(); //openinstall.js中提供的工具函数，解析url中的所有查询参数
new OpenInstall({
  /*appKey必选参数，openinstall平台为每个应用分配的ID*/
  appKey: "qje2hg",
  onready: function onready() {
    var m = this,
        button = document.getElementById("downloadButton");
    button.style.visibility = "visible";
    if (ifshare || fromshare) {
      /*在app已安装的情况尝试拉起app*/
      m.schemeWakeup();

      /*用户点击某个按钮时(假定按钮id为downloadButton)，安装app*/
      button.onclick = function () {
        try {
          /*在app已安装的情况尝试拉起app*/
          m.schemeWakeup();
          // m.wakeupOrInstall();
        } catch (error) {
          // 否则跳转app下载页面
          // m.wakeupOrInstall();
          if (getUrl(location.href).invitationCode) {
            location.href = appdownurl + "?invitationCode=" + getUrl(location.href).invitationCode;
          } else {
            location.href = appdownurl;
          }
        }
        return false;
      };
      wakeOrInstallApp = function wakeOrInstallApp() {
        if (isOtherBro()) {
          $('.shareFlex').toggle();
        } else {
          try {
            // 若无法唤醒app 5秒后跳转下载页
            setTimeout(function () {
              if (!ifdownloading) {
                // loading 隐藏
                $('.loadingC').hide();
                if (getUrl(location.href).invitationCode) {
                  location.href = appdownurl + "?invitationCode=" + getUrl(location.href).invitationCode;
                } else {
                  location.href = appdownurl;
                }
              }
            }, 3000);
            /*在app已安装的情况尝试拉起app*/
            // loading 显示
            $('.loadingC').show();
            m.schemeWakeup();
          } catch (error) {
            // loading 隐藏
            $('.loadingC').hide();
            // 否则跳转app下载页面
            // m.wakeupOrInstall();
            ifdownloading = true;
            if (getUrl(location.href).invitationCode) {
              location.href = appdownurl + "?invitationCode=" + getUrl(location.href).invitationCode;
            } else {
              location.href = appdownurl;
            }
          }
        }
      };
    }
  }
}, openappdata);
$(function () {

  // 如果是从分享链接进来的  sessionStorage保留标识 若 fromshare=1 则唤醒app或跳下载页面
  if (ifshare) {
    sessionStorage.fromshare = 1;
  }

  // alert(!isWechat+' '+localStorage.sta)
  if (!isWechat) {
    // 顶部高度计算
    $('.shop_top').css({
      'padding-top': ((26 + statusBarHeight) / 75).toFixed(4) + 'rem'
    });
    $('.navigation').css({
      height: ((90 + statusBarHeight) / 75).toFixed(4) + 'rem',
      'padding-top': (statusBarHeight / 75).toFixed(4) + 'rem'
    });
  }
  $('.shop_top').css('visibility', 'visible');
  $('.navigation').css('visibility', 'visible');
  // 判定是否从app的猜你喜欢进入
  if (getUrl(location.href).guess !== undefined) {
    $('.return').click(function () {
      if (isWechat) {
        window.history.go(-1);
      } else if (isAndroid) {
        window.android.onClosePage();
      } else if (isiOS) {
        window.webkit.messageHandlers.onClosePage.postMessage(null);
      } else {
        window.history.back();
      }
    });
    $('.navigation a').click(function () {
      if (isWechat) {
        window.history.go(-1);
      } else if (isAndroid) {
        window.android.onClosePage();
      } else if (isiOS) {
        window.webkit.messageHandlers.onClosePage.postMessage(null);
      } else {
        window.history.go(-1);
      }
    });
  } else {
    $('.return').click(function () {
      if (ifshare || fromshare) {
        ifAoIdownOshare();
      } else {
        // 埋点浏览商品
        browseProductTracker('', '', '', '', goodsid, $('.shop_detail .title').text(), enterSectime);
        setTimeout(function () {
          history.go(-1);
        }, 200);
      }
    });
    $('.navigation a').click(function () {
      history.go(-1);
    });
  }

  goodsid = getUrl(location.href).id;

  setInterval(function () {
    enterSectime++;
  }, 1000);

  // 商品评价跳转
  $('.shop_common a').click(function () {
    // 埋点浏览商品
    browseProductTracker('', '', '', '', goodsid, $('.shop_detail .title').text(), enterSectime);
    setTimeout(function () {
      location.href = './shop_assess.html?goodsid=' + goodsid;
    }, 200);
  });
  // 前往购物车
  $('.shop_car').click(function () {
    if (localStorage.token === undefined || localStorage.scMemId === undefined) {
      if (ifshare || fromshare) {
        ifAoIdownOshare();
        return false;
      } else if (isWechat) {
        location.href = h5loginurl;
      } else if (isAndroid) {
        window.android.mustLogin();
      } else {
        // ios
        window.webkit.messageHandlers.mustLogin.postMessage(null);
      }
      return false;
    }
    // 埋点浏览商品
    browseProductTracker('', '', '', '', goodsid, $('.shop_detail .title').text(), enterSectime);
    //  埋点点击购物车
    shopshowcartTracker();
    setTimeout(function () {
      location.href = './shop_car.html';
    }, 200);
  });

  // 商品详情
  goodsDetail(goodsid);
  // 商品规格获取
  listGoodsSpecification(goodsid);
  // 获取购物车中商品数
  if (localStorage.token !== undefined) {
    ShopCarPNGet();
  }

  // 规格选择弹框
  $('.goods_size').click(function () {
    $('.shop_box').css({
      height: '100vh',
      overflow: 'hidden',
      position: 'fixed'
    });
    $('.now_buy').show();
  });

  // 规格选择
  $('.goodssflistC').delegate('.select_item_btn div', 'click', function () {
    var _this = this;

    // 若此div不可选，则点击无效
    if (!($(this).hasClass('cansel') || $(this).hasClass('active'))) {
      return false;
    }
    var nowselid = $(this).attr('specificationdetailid');

    if ($(this).hasClass('active')) {
      $(this).parents('.select_item').siblings('.select_item').each(function () {
        $(this).find('div').each(function () {
          $(this).addClass('cansel');
        });
      });
      $(this).removeClass('active');
    } else {
      (function () {
        // 获取已选的其他类型的选项
        var ggSel = [];
        $(_this).parents('.select_item').siblings('.select_item').each(function () {
          if ($(this).find('.active').length === 1) {
            ggSel.push($(this).find('.active').attr('specificationdetailid'));
          }
        });
        // console.log(ggSel)
        // 获取可选选项
        var cansellist = [];
        for (var i in specificationProductIdList) {
          var goodsSpecificationPath = specificationProductIdList[i].goodsSpecificationPath.split(',');
          if (goodsSpecificationPath.indexOf(nowselid) !== -1) {
            cansellist = cansellist.concat(goodsSpecificationPath);
          }
        }

        // 判定其他选项是否可选
        $(_this).parents('.select_item').siblings('.select_item').each(function () {
          $(this).find('.select_item_btn div').each(function () {
            if (cansellist.indexOf($(this).attr('specificationdetailid')) === -1) {
              $(this).removeClass('cansel');
            } else {
              $(this).addClass('cansel');
            }
          });
        });
        if (ggSel.length > 0) {
          var _loop = function _loop(j) {
            // 如果当前别的类型的选项有不可选的 ，去除选中效果以及可选中类
            if (cansellist.indexOf(ggSel[j]) === -1) {
              $('.select_item_btn .active').each(function () {
                // console.log(ggSel[j],$(this).attr('specificationdetailid'))
                if ($(this).attr('specificationdetailid') === ggSel[j]) {
                  $(this).removeClass('active');
                  $(this).parents('.select_item_btn').find('.cansel').eq(0).addClass('active');
                }
              });
            }
          };

          for (var j in ggSel) {
            _loop(j);
          }
        } else {}

        if ($(_this).parent('.select_item_btn').find('.active').length > 0) {
          $(_this).parent('.select_item_btn').find('.active').removeClass('active');
        }
        $(_this).addClass('cansel').addClass('active');
      })();
    }
    // 判定同行可选选项
    ggsel_sameline($(this).parents('.select_item').index());
  });
  // 数量添加
  $('.numchange').click(function () {
    var stock = Number($('.goods_size .sizesel').attr('stock'));
    // 未选择商品规格前点击添加删除按钮提示请先选择商品规格
    if ($('.goods_size .sizesel').attr('stock') === '') {
      layer.open({
        content: '请先选择商品规格',
        skin: 'msg',
        time: 2 //2秒后自动关闭
      });
      return;
    }
    var num = Number($('.select_num').val());
    if ($(this).hasClass('add')) {
      if (num == stock) {
        layer.open({
          content: '库存数量不足',
          skin: 'msg',
          time: 2 //2秒后自动关闭
        });
        return;
      }
      if (num < stock) {
        num++;
        $('.goods_size .sizesel').attr('pronum', num);
      }
    } else if ($(this).hasClass('min')) {
      if (num == 1) {
        layer.open({
          content: '数量不能再减少了',
          skin: 'msg',
          time: 2 //2秒后自动关闭
        });
      }
      if (num > 1) {
        num--;
        $('.goods_size .sizesel').attr('pronum', num);
      }
    }
    $('.select_num').val(num);
  });
  $('.select_num').bind('input propertychange', function (event) {
    $(this).val($(this).val().replace(/[^\d]/g, '')); //清除“数字”以外的字符
  });
  // 数量输入，失去焦点验证
  $('.select_num').blur(function () {
    var stock = Number($('.goods_size .sizesel').attr('stock'));
    // 未选择商品规格前点击添加删除按钮提示请先选择商品规格
    if ($('.goods_size .sizesel').attr('stock') === '') {
      layer.open({
        content: '请先选择商品规格',
        skin: 'msg',
        time: 2 //2秒后自动关闭
      });
      $('.select_num').val(1);
      $('.goods_size .sizesel').attr('pronum', 1);
      return;
    }
    if ($('.select_num').val() === '') {
      $('.select_num').val(1);
      $('.goods_size .sizesel').attr('pronum', 1);
      return;
    }
    var num = parseInt($('.select_num').val());

    // console.log(num)
    if (num > stock) {
      layer.open({
        content: '库存数量不足',
        skin: 'msg',
        time: 2 //2秒后自动关闭
      });
      num = stock;
    } else if (num < 1) {
      layer.open({
        content: '数量不能再减少了',
        skin: 'msg',
        time: 2 //2秒后自动关闭
      });
      num = 1;
    }
    $('.goods_size .sizesel').attr('pronum', num);
    $('.select_num').val(num);
  });
  // 规格选择提交
  $('.submit').click(function () {
    // 只有当选择了颜色跟款式之后才能提交
    if ($('.active').length === $('.goodssflistC').find('.select_item').length) {
      $('.shop_box').css({ overflow: 'auto', position: 'relative' });
      $('.now_buy').hide();
    } else {
      layer.open({
        content: '请选择商品规格！',
        skin: 'msg',
        time: 2 //2秒后自动关闭
      });
    }
  });
  // 规格选择弹框隐藏
  $('.now_buyBG').click(function () {
    $('.shop_box').css({ overflow: 'auto', position: 'relative' });
    $('.now_buy').hide();
  });
  // 分享展示
  $('.shop_share').click(function () {
    if (localStorage.token === undefined || localStorage.scMemId === undefined) {
      if (ifshare || fromshare) {
        ifAoIdownOshare();
        return false;
      } else if (isWechat) {
        location.href = h5loginurl;
      } else if (isAndroid) {
        window.android.mustLogin();
      } else {
        // ios
        window.webkit.messageHandlers.mustLogin.postMessage(null);
      }
      return;
    } else {
      productshareTracker();
      setTimeout(function () {
        if (isWechat) {
          shareData();
        } else if (isAndroid) {
          window.android.onShareFromWeb(JSON.stringify(shareJson));
        } else {
          // ios
          window.webkit.messageHandlers.onShareFromWeb.postMessage(JSON.stringify(shareJson));
        }
      }, 200);
    }
  });
  // 分享隐藏
  $('.shareBG').click(function () {
    $('.shop_box').css({ overflow: 'auto' });
    $('.shareC').hide();
  });
  // 分享二维码隐藏
  $('.qrCodeBG').click(function () {
    $('.shop_box').css({ overflow: 'auto' });
    $('.shareQRCode').hide();
  });
  setTimeout(function () {
    if (localStorage.scMemId) {
      var param = {
        url: 'html/get/center/getMember',
        type: '',
        data: {
          memId: localStorage.scMemId
        }
      };
      ajaxJS(param, function (res) {
        var qrcodeUrl = 'https://picture.tiens.com/shop-h5/html/shop_detail.html?id=' + getUrl(location.href).id + '&share=1&sharerId=' + localStorage.scMemId + '&invitationCode=' + res.data.inviteCode;
        var code = new AraleQRCode({
          render: 'canvas',
          text: qrcodeUrl,
          size: 74
        });
        $('.codeimg').append(code);
      }, function (error) {});
    }
  }, 1000);

  // 使得页面顶部始终有个返回头
  $(window).scroll(function () {
    if ($(window).scrollTop() >= 750 - 90 - statusBarHeight) {
      $('.shop_top').stop(true, true).fadeOut(500);
      $('.navigation').fadeIn(500); // 开始淡入
    } else {
      $('.shop_top').fadeIn(500);
      $('.navigation').stop(true, true).fadeOut(500); // 如果小于等于 200 淡出
    }
  });

  // 规格图片点击放大
  $('.buy_top .shop_img img').click(function () {
    $('.proggimg_Detail .imgDetailC img').attr('src', $(this).attr('src'));
    $('.proggimg_Detail').css('display', 'flex');
  });

  // 轮播放大
  $('.proTopDet_swiper').delegate('.swiper-slide', 'click', function () {
    var indexclick = $(this).index();
    if ($(this).index() < $('.proTopDet_swiper .swiper-slide').length - 2) {} else {
      indexclick = 0;
    }
    detSwiper.slideTo(indexclick);
    $('.proban_Detail').css('display', 'flex');
  });
  // 图片放大弹框收缩
  $('.imgDetail').click(function () {
    $('.modelimgDetail').fadeOut(500);
  });
  $('.imgDetailC').click(function () {
    $('.modelimgDetail').fadeOut(500);
  });
  $('.imgDet_close').click(function () {
    $('.modelimgDetail').fadeOut(500);
  });

  // 通过别人分享的链接点进来的
  if (getUrl(location.href).sharerId !== undefined) {
    pageView();
  }

  // 猜你喜欢数据加载
  setTimeout(function () {
    goodspreferGet();
  }, 300);
});

var goodsSFcontrol = function goodsSFcontrol() {};

// 商品详情
var goodsDetail = function goodsDetail(goodsId) {
  var param = {
    url: 'get/shop/goods/getGoodDetail',
    type: '',
    data: {
      goodsId: goodsId
    }
  };
  ajaxJS(param, function (res) {
    var _probuyInfo;

    goodDetail = res.data;
    // 轮播
    var swiperlist = '';
    for (var i in res.data.goodsImgs) {
      swiperlist += '\n            <div class="swiper-slide opacity">\n                <a>\n                    <img src="' + res.data.goodsImgs[i] + '" alt="">\n                </a>\n            </div>\n            ';
    }
    $('.proTopDet_swiper .swiper-wrapper').html(swiperlist);
    $('.proDet_swiper .swiper-wrapper').html(swiperlist);
    // 轮播
    topSwiper = new Swiper('.proTopDet_swiper', {
      autoplay: 5000, //可选选项，自动滑动
      speed: 300,
      pagination: '.proTopDet_swiper .swiper-pagination',
      loop: true,
      loopFillGroupWithBlank: true,
      paginationType: 'fraction',
      paginationFractionRender: function paginationFractionRender(swiper, currentClassName, totalClassName) {
        return '<span class="' + currentClassName + '"></span>' + ' / ' + '<span class="' + totalClassName + '"></span>';
      }
    });
    // 商品详情轮播
    detSwiper = new Swiper('.proDet_swiper', {
      autoplay: 5000, //可选选项，自动滑动
      speed: 300,
      pagination: '.proDet_swiper .swiper-pagination',
      loop: true,
      loopFillGroupWithBlank: true,
      observer: true,
      observeParents: true,
      paginationType: 'fraction',
      paginationFractionRender: function paginationFractionRender(swiper, currentClassName, totalClassName) {
        return '<span class="' + currentClassName + '"></span>' + ' / ' + '<span class="' + totalClassName + '"></span>';
      }
    });

    // 商品价格信息
    $('.shop_detail .title').text(res.data.goodsName);
    $('.shop_detail .title').addClass('opacity');
    $('.shop_detail .describe').text(res.data.goodsIntroduce);
    $('.shop_detail .describe').addClass('opacity');
    $('.shop_detail .discount .price').text('￥' + res.data.showPrice);
    $('.shop_detail .discount .score').text(parseInt(res.data.integralPrice) === 0 || res.data.integralPrice === null ? '' : '+' + parseInt(res.data.integralPrice) + '积分');
    $('.shop_detail .discount .oldprice').text('' + (Number(res.data.originalPrice) === Number(res.data.showPrice) ? '' : '￥' + res.data.originalPrice));
    $('.shop_detail .discount').addClass('opacity');
    var deliveryMethod = '';
    if (res.data.deliveryMethod === '' && res.data.goodsType === 1) {
      res.data.deliveryMethod = '2';
    }
    if (res.data.deliveryMethod.indexOf(',') !== -1) {
      var deliverylist = res.data.deliveryMethod.split(',');
      for (var _i in deliverylist) {
        if (_i > 0) {
          deliveryMethod += ' | ';
        }
        deliveryMethod += deliverylist[_i] === '0' ? '快递:' + res.data.freight + '元' : deliverylist[_i] === '1' ? '自提' : '到店消费';
      }
    } else {
      deliveryMethod += res.data.deliveryMethod === '0' ? '快递:' + res.data.freight + '元' : res.data.deliveryMethod === '1' ? '自提' : '到店消费';
    }
    $('.shop_detail .expressage').html('<div>' + deliveryMethod + '</div><div>\u9500\u91CF:' + res.data.soldNumber + '</div><div>' + res.data.goodsLocation + '</div>');
    $('.shop_detail .expressage').addClass('opacity');
    $('.shop_common .assessNum').text('(' + res.data.commentNumber + ')');
    $('.shop_detail .assessNum').addClass('opacity');
    // 店铺信息介绍
    $('.shop_store .stroe_img img').attr('src', res.data.shopLogo === '' || res.data.shopLogo === null ? '../images/shop_nopic.png' : res.data.shopLogo);
    $('.shop_store .stroe_img').addClass('opacity');
    $('.shop_store .store_detail .title').text(res.data.shopName);
    var shoptip = '';
    for (var _i2 in res.data.labelList) {
      shoptip += res.data.labelList[_i2];
      if (Number(_i2) + 1 !== res.data.labelList.length) {
        shoptip += ' | ';
      }
    }
    $('.shop_store .store_detail .describe').html(shoptip);
    $('.shop_store .store_detail .number').text('全部宝贝:' + res.data.shopGoodsNumber);
    $('.shop_store .store_detail').addClass('opacity');
    $('.shop_store .goto_store').attr('href', './shop.html?shopId=' + res.data.shopId);
    shopId = res.data.shopId;
    $('.shop_describe').html(res.data.imgTextContent ? res.data.imgTextContent : '<img width="100%" src="../images/shop_nothing.png">');
    $('.shop_describe').addClass('opacity');
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
    // 是否下架 1上架  2下架
    undercarriage = res.data.undercarriage;
    if (undercarriage === 2) {
      $('.option .add_shopcar').addClass('cannotbuy');
      $('.option .buy').addClass('cannotbuy');
    }
    // 立即购买需要带过去的数据
    probuyInfo = (_probuyInfo = {
      shopId: res.data.shopId,
      shopName: res.data.shopName,
      shopLogo: res.data.shopLogo,
      goodsId: res.data.goodsId
    }, _defineProperty(_probuyInfo, 'goodsId', res.data.goodsId), _defineProperty(_probuyInfo, 'goodsName', res.data.goodsName), _defineProperty(_probuyInfo, 'goodsImageUrl', ''), _defineProperty(_probuyInfo, 'goodsType', res.data.goodsType), _defineProperty(_probuyInfo, 'deliveryMethod', res.data.deliveryMethod), _defineProperty(_probuyInfo, 'productId', ''), _defineProperty(_probuyInfo, 'productName', ''), _defineProperty(_probuyInfo, 'number', 1), _defineProperty(_probuyInfo, 'originalPrice', res.data.originalPrice), _defineProperty(_probuyInfo, 'showPrice', res.data.showPrice), _defineProperty(_probuyInfo, 'intetral', parseInt(res.data.integralPrice)), _defineProperty(_probuyInfo, 'shopAddres', res.data.shopAddres), _probuyInfo);

    // 分享用的数据
    shareJson = {
      goodsId: res.data.goodsId,
      title: ifnull(res.data.goodsName),
      shareContent: ifnull(res.data.goodsIntroduce),
      imageUrl: ifnull(res.data.goodsImgs[0]),
      url: 'https://' + window.location.host + location.pathname + '?id=' + getUrl(location.href).id + '&comefrom=share&fromshop=1&url=' + 'https://' + window.location.host + location.pathname,
      isShowQrCode: 1,
      shareAwardIntegral: res.data.shareAwardIntegral ? res.data.shareAwardIntegral : '' //分享奖励积分量


      // 分享二维码文字赋值
    };$('.qrCodeCImg img').attr('src', res.data.goodsImgs[0]);
    $('.codeTxt h3').text(res.data.goodsName);
    $('.codeTxt p').html('\n          <label><i>\uFFE5</i>' + res.data.showPrice + '</label>\n          ' + (parseInt(res.data.integralPrice) === 0 || res.data.integralPrice === null ? '' : '<label><i>积分</i>' + parseInt(res.data.integralPrice) + '</label>') + '\n        ');

    // 定时下拉加载文字及小狮子页面加载一秒钟后显示
    setTimeout(function () {
      $('.inithide').css('visibility', 'visible');
    }, 100);
  }, function (error) {
    layer.open({
      content: error.msg,
      skin: 'msg',
      time: 2 //2秒后自动关闭
    });
  });
};

// 商品规格列表
var listGoodsSpecification = function listGoodsSpecification(goodsId) {
  var param = {
    url: 'get/shop/goods/listGoodsSpecification',
    type: '',
    data: {
      goodsId: goodsId
    }
  };
  ajaxJS(param, function (res) {
    var goodssflist = '';
    var defaultGoodsgg = '';
    if (res.data.specificationProductIdList.length > 0) {
      for (var k in res.data.specificationProductIdList) {
        if (res.data.specificationProductIdList[k].defaultStatus === true) {
          defaultGoodsgg = res.data.specificationProductIdList[k].goodsSpecificationPath.split(',');
          defaultGoods = res.data.specificationProductIdList[k];
        }
      }
    }
    if (res.data.specificationOutData.length > 0) {
      for (var i in res.data.specificationOutData) {
        var sfsonlist = '';
        for (var j in res.data.specificationOutData[i].specificationValue) {
          if (defaultGoodsgg.indexOf(String(res.data.specificationOutData[i].specificationValue[j].specificationDetailId)) !== -1) {
            sfsonlist += '<div class="active cansel" specificationDetailId=\'' + res.data.specificationOutData[i].specificationValue[j].specificationDetailId + '\' >' + res.data.specificationOutData[i].specificationValue[j].specificationDetailValue + '</div>';
          } else {
            sfsonlist += '<div class="cansel" specificationDetailId=\'' + res.data.specificationOutData[i].specificationValue[j].specificationDetailId + '\' >' + res.data.specificationOutData[i].specificationValue[j].specificationDetailValue + '</div>';
          }
        }
        goodssflist += '\n                <div class="color select_item">\n                    <div class="select_item_lab">' + res.data.specificationOutData[i].specificationName + '</div>\n                    <div class="select_item_btn">' + sfsonlist + '</div>\n                </div>\n                ';
      }
    }
    $('.goodssflistC').html(goodssflist);
    specificationProductIdList = res.data.specificationProductIdList;
    ggsel_sameline(0);
  }, function (error) {
    layer.open({
      content: error.msg,
      skin: 'msg',
      time: 2 //2秒后自动关闭
    });
  });
};

// 规格 确定点击同一行的 可选项
var ggsel_sameline = function ggsel_sameline(lineIndex) {
  var btnthislineSel = $('.goodssflistC').find('.select_item').eq(lineIndex).find('.active').attr('specificationdetailid');
  var newggSel = [];
  $('.goodssflistC').find('.select_item').eq(lineIndex).siblings('.select_item').each(function () {
    if ($(this).find('.active').length === 1) {
      newggSel.push($(this).find('.active').attr('specificationdetailid'));
    }
  });
  // 获取可选选项
  var thislinecansellist = [];
  var allsellist = [];
  for (var i in specificationProductIdList) {
    var goodsSpecificationPath = specificationProductIdList[i].goodsSpecificationPath.split(',');
    allsellist = allsellist.concat(goodsSpecificationPath);
    var _thislinecansel = 0;
    if (newggSel.length !== 0) {
      for (var j in newggSel) {
        if (goodsSpecificationPath.indexOf(newggSel[j]) !== -1) {
          _thislinecansel++;
        }
      }
      if (_thislinecansel > 0) {
        (function () {
          var a = new Set(goodsSpecificationPath);
          var b = new Set(newggSel);
          var difference = new Set([].concat(_toConsumableArray(a)).filter(function (x) {
            return !b.has(x);
          }));
          thislinecansellist = thislinecansellist.concat(Array.from(difference));
        })();
      }
    }
  }
  if (newggSel.length === 0) {
    if ($('.goodssflistC .active').length === 1) {} else {
      $('.goodssflistC').find('.select_item div').each(function () {
        if (allsellist.indexOf($(this).attr('specificationdetailid')) !== -1) {
          $(this).addClass('cansel');
        } else {
          $(this).removeClass('cansel');
        }
      });
    }
  } else {
    $('.goodssflistC').find('.select_item').each(function () {
      if ($(this).index() === lineIndex) {
        $(this).find('div').each(function () {
          if (thislinecansellist.indexOf($(this).attr('specificationdetailid')) !== -1) {
            $(this).addClass('cansel');
          } else {
            $(this).removeClass('cansel');
          }
        });
      } else if ($(this).find('.active').length === 0) {
        $(this).find('div').each(function () {
          if (thislinecansellist.indexOf($(this).attr('specificationdetailid')) !== -1) {
            $(this).addClass('cansel');
          } else {
            $(this).removeClass('cansel');
          }
        });
      }
    });
  }

  var selnowtime = [];
  $('.goodssflistC .select_item').each(function () {
    if ($(this).find('.active').length > 0) {
      selnowtime.push($(this).find('.active').attr('specificationdetailid'));
    }
  });
  var nowselgginfo = '';
  var thislinecansel = 0;
  if (selnowtime.length === $('.goodssflistC .select_item').length) {
    var _loop2 = function _loop2(_i3) {
      var goodsSpecificationPath = specificationProductIdList[_i3].goodsSpecificationPath.split(',');
      var a = new Set(goodsSpecificationPath);
      var b = new Set(selnowtime);
      var difference = new Set([].concat(_toConsumableArray(a)).filter(function (x) {
        return !b.has(x);
      }));
      if (Array.from(difference).length === 0) {
        nowselgginfo = specificationProductIdList[_i3];
        thislinecansel++;
      }
    };

    for (var _i3 in specificationProductIdList) {
      _loop2(_i3);
    }
  }

  // 若选择到不存在的规格，重新指向存在从规格
  if (thislinecansel === 0 && $('.goodssflistC').find('.active').length === $('.goodssflistC').find('.select_item').length) {
    (function () {
      var canselarrlist = [];
      for (var _i4 in specificationProductIdList) {
        var _goodsSpecificationPath = specificationProductIdList[_i4].goodsSpecificationPath.split(',');
        if (_goodsSpecificationPath.indexOf(btnthislineSel) !== -1) {
          canselarrlist.push(_goodsSpecificationPath);
        }
      }

      var _loop3 = function _loop3(m) {
        if (canselarrlist[m].indexOf(newggSel[0]) !== -1) {
          selnowtime = canselarrlist[m];
          $('.goodssflistC .select_item').each(function () {
            if (canselarrlist[m].indexOf($(this).find('.active').attr('specificationdetailid')) === -1) {
              $(this).find('.active').removeClass('active').removeClass('cansel');
              $(this).find('.select_item_btn div').each(function () {
                if (canselarrlist[m].indexOf($(this).attr('specificationdetailid')) !== -1) {
                  $(this).addClass('active');
                }
              });
            }
          });
        }
      };

      for (var m in canselarrlist) {
        _loop3(m);
      }

      var _loop4 = function _loop4(_i5) {
        var goodsSpecificationPath = specificationProductIdList[_i5].goodsSpecificationPath.split(',');
        var a = new Set(goodsSpecificationPath);
        var b = new Set(selnowtime);
        var difference = new Set([].concat(_toConsumableArray(a)).filter(function (x) {
          return !b.has(x);
        }));
        if (Array.from(difference).length === 0) {
          nowselgginfo = specificationProductIdList[_i5];
        }
      };

      for (var _i5 in specificationProductIdList) {
        _loop4(_i5);
      }
    })();
  }
  // 若所有商品规格都选中了，则赋值商品规格类型价格图片
  if ($('.goodssflistC').find('.active').length === $('.goodssflistC').find('.select_item').length) {
    var gglist_act = [];
    $('.goodssflistC .active').each(function () {
      gglist_act.push($(this).attr('specificationdetailid'));
    });

    $('.buy_top .shop_img img').attr('src', nowselgginfo.pic !== null && nowselgginfo.pic !== '' ? nowselgginfo.pic : '../images/shop_nopic.png');
    $('.buy_top .detail .title').text(nowselgginfo.name);
    $('.buy_top .detail .price').html('\n        <span>\xA5 ' + nowselgginfo.price + '</span>\n        ' + (nowselgginfo.integral === null || nowselgginfo.integral === '0' || nowselgginfo.integral === '0.00' ? '' : '<div>+' + parseInt(nowselgginfo.integral) + '积分</div>') + '\n        <span class=\'oldprice\'>' + (Number(nowselgginfo.originalPrice) === Number(nowselgginfo.price) ? '' : '￥' + nowselgginfo.originalPrice) + '</span>\n        ');
    $('.buy_top .detail .number').text('库存:' + nowselgginfo.stock);
    $('.buy_top .detail .number').attr('stock', nowselgginfo.stock);
    $('.add .select_num').attr('stock', nowselgginfo.stock);
    if (nowselgginfo.stock === 0) {
      $('.add .select_num').val(0);
    }
    $('.goods_size .sizesel').html('<i>\u89C4\u683C</i><span>\u5DF2\u9009 ' + nowselgginfo.name + '\u89C4\u683C</span>');
    $('.goods_size .sizesel').attr('productId', nowselgginfo.id);
    $('.goods_size .sizesel').attr('goodsImageUrl', nowselgginfo.pic);
    $('.goods_size .sizesel').attr('productName', nowselgginfo.name);
    $('.goods_size .sizesel').attr('stock', nowselgginfo.stock);
    $('.goods_size .sizesel').attr('price', nowselgginfo.price);
    $('.goods_size .sizesel').attr('integral', parseInt(Number(nowselgginfo.integral)));
    if (nowselgginfo.stock === 0) {
      $('.goods_size .sizesel').attr('pronum', 0);
      $('.select_num').val(0);
    } else {
      $('.goods_size .sizesel').attr('pronum', 1);
      $('.select_num').val(1);
    }

    $('.shop_detail .discount .price').text('￥' + nowselgginfo.price);
    $('.shop_detail .discount .score').text(nowselgginfo.integral === null || nowselgginfo.integral === '0' || nowselgginfo.integral === '0.00' ? '' : '+' + parseInt(nowselgginfo.integral) + '积分');
    $('.shop_detail .discount .oldprice').text('' + (Number(nowselgginfo.originalPrice) === Number(nowselgginfo.price) ? '' : '￥' + nowselgginfo.originalPrice));
  } else {
    $('.buy_top .shop_img img').attr('src', specificationProductIdList[0].pic ? specificationProductIdList[0].pic : '../images/shop_nopic.png');
    $('.buy_top .detail .title').text($('.shop_detail .title').text());
    $('.buy_top .detail .price').html('\n        <span> ' + goodDetail.showPrice + '</span>\n        ' + ('<div>' + (parseInt(goodDetail.integralPrice) === 0 || goodDetail.integralPrice === null) ? '' : '+' + parseInt(goodDetail.integralPrice) + '积分' + '</div>') + '\n        <span class=\'oldprice\'>' + (Number(goodDetail.originalPrice) === Number(goodDetail.showPrice) ? '' : '￥' + goodDetail.originalPrice) + '</span>\n        ');
    $('.buy_top .detail .number').text('库存:' + defaultGoods.stock);

    $('.goods_size .sizesel').html('<i>\u89C4\u683C</i><span>\u8BF7\u9009\u62E9\u5546\u54C1\u89C4\u683C</span>');
    $('.goods_size .sizesel').attr('productId', '');
    $('.goods_size .sizesel').attr('goodsImageUrl', '');
    $('.goods_size .sizesel').attr('productName', '');
    $('.goods_size .sizesel').attr('stock', '');
    $('.goods_size .sizesel').attr('pronum', '');

    $('.shop_detail .discount .price').text('￥' + goodDetail.showPrice);
    $('.shop_detail .discount .score').text(parseInt(goodDetail.integralPrice) === 0 || goodDetail.integralPrice === null ? '' : '+' + parseInt(goodDetail.integralPrice) + '积分');
    $('.shop_detail .discount .oldprice').text('' + (Number(goodDetail.originalPrice) === Number(goodDetail.showPrice) ? '' : '￥' + goodDetail.originalPrice));
  }
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

// 加入购物车
var AddtoShopCar = function AddtoShopCar() {
  if (localStorage.token === undefined || localStorage.scMemId === undefined) {
    if (ifshare || fromshare) {
      ifAoIdownOshare();
      return false;
    } else if (isWechat) {
      location.href = h5loginurl;
    } else if (isAndroid) {
      window.android.mustLogin();
    } else {
      // ios
      window.webkit.messageHandlers.mustLogin.postMessage(null);
    }
    return false;
  }
  if ($('.goods_size .sizesel').attr('pronum') === '') {
    layer.open({
      content: '请选择商品规格!',
      skin: 'msg',
      time: 2 //2秒后自动关闭
    });
    return false;
  }
  if ($('.goods_size .sizesel').attr('stock') === '0') {
    layer.open({
      content: '商品库存不足!',
      skin: 'msg',
      time: 2 //2秒后自动关闭
    });
    return false;
  }
  // 下架的商品无法加入购物车
  if (undercarriage === 2) {
    return false;
  }
  var addtSCData = {
    productId: $('.sizesel').attr('productid'),
    memId: memidGet(),
    shopId: shopId,
    number: $('.sizesel').attr('pronum'),
    goodsId: goodsid
    // 分享着id
  };if (getUrl(location.href).sharerId) {
    addtSCData.sharerId = getUrl(location.href).sharerId;
  }
  var param = {
    url: 'get/shop/order/addToShoppingCart',
    type: '',
    data: addtSCData
    // 是否是通过别人分享的链接进行购买
  };if (getUrl(location.href).sharerId) {
    param.data.sharerId = getUrl(location.href).sharerId;
  }
  ajaxJS(param, function (res) {
    if (res.code === '0') {
      // 埋点加入购物车
      addshopcartTracker('', '', '', '', goodsid, $('.shop_detail .title').text());
      ShopCarPNGet();
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

// 立即购买
var buyNow = function buyNow() {
  if (localStorage.token === undefined || localStorage.scMemId === undefined) {
    if (ifshare || fromshare) {
      ifAoIdownOshare();
      return false;
    } else if (isWechat) {
      location.href = h5loginurl;
    } else if (isAndroid) {
      window.android.mustLogin();
    } else {
      // ios
      window.webkit.messageHandlers.mustLogin.postMessage(null);
    }
    return false;
  }
  if ($('.goods_size .sizesel').attr('pronum') === '') {
    layer.open({
      content: '请选择商品规格!',
      skin: 'msg',
      time: 2 //2秒后自动关闭
    });
    return false;
  }
  if ($('.goods_size .sizesel').attr('stock') === '0') {
    layer.open({
      content: '商品库存不足!',
      skin: 'msg',
      time: 2 //2秒后自动关闭
    });
    return false;
  }
  // 若下架无法购买
  if (undercarriage === 2) {
    return false;
  }
  probuyInfo.goodsImageUrl = $('.sizesel').attr('goodsimageurl');
  probuyInfo.productId = $('.sizesel').attr('productid');
  probuyInfo.productName = $('.sizesel').attr('productname');
  probuyInfo.number = $('.sizesel').attr('pronum');
  probuyInfo.showPrice = Number($('.sizesel').attr('price')).toFixed(2);
  probuyInfo.intetral = Number($('.sizesel').attr('integral'));
  // 是否是通过别人分享的链接进行购买
  if (getUrl(location.href).sharerId) {
    probuyInfo.sharerId = getUrl(location.href).sharerId;
  }
  sessionStorage.proInfo = JSON.stringify(probuyInfo);

  // 埋点浏览商品
  browseProductTracker('', '', '', '', goodsid, $('.shop_detail .title').text(), enterSectime);
  shopnowTracker('', '', '', '', goodsid, $('.shop_detail .title').text());
  setTimeout(function () {
    location.href = './order_submit.html?orderSumType=2';
  }, 200);
};
// 获取购物车商品数量
var ShopCarPNGet = function ShopCarPNGet() {
  var param = {
    url: 'get/shop/order/selectProductNumInCart',
    type: '',
    data: {
      memId: memidGet()
    }
  };
  ajaxJS(param, function (res) {
    if (res.code === '0') {
      $('.shopcarNum').text(res.data !== null && res.data !== 0 ? res.data < 100 ? res.data : '...' : '');
      if (res.data === null || res.data === 0) {
        $('.shopcarNum').hide();
      } else {
        $('.shopcarNum').show();
      }
      if (res.data > 99) {
        $('.bottom .shop_car .car div').css('line-height', '0.203333rem');
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

var ifnull = function ifnull(val) {
  return val === undefined || val === null ? '' : val;
};

/**
 * 分享的是否用的系统浏览器打开；以及是否安装app等
 */
var fromShareFun = function fromShareFun() {
  var shareUrl = window.location.href;
  // let downUrl = 'https://picture.tiens.com/tiens-h5/html/download.html'
  var openAppUrl = 'https://photo.pointswin.com/openApp.html';
  if (isOtherBro()) {
    $('.shareFlex').toggle();
  } else if (navigator.userAgent.match(/(iPhone|iPod|iPad);?/i)) {
    // ios唤醒app
    if (getUrl(location.href).invitationCode) {
      window.location.href = openAppUrl + '?url=' + shareUrl + '&sta=1&invitationCode=' + getUrl(location.href).invitationCode;
    } else {
      window.location.href = openAppUrl + '?url=' + shareUrl + '&sta=1';
    }
  }
};

/**
 *  判断分享中的浏览器
 */
var isOtherBro = function isOtherBro() {
  var ua = navigator.userAgent.toLowerCase(); //获取判断用的对象
  if (ua.match(/MicroMessenger/i) == 'micromessenger') {
    return true;
  } else if (ua.match(/WeiBo/i) == 'weibo') {
    return true;
  } else if (ua.match(/QQ/i) == 'qq') {
    return true;
  }
};

// 访问别人分享的链接
var pageView = function pageView() {
  var param = {
    url: 'html/get/common/pageView',
    type: '',
    data: {
      memId: getUrl(location.href).sharerId,
      type: 5,
      relationId: getUrl(location.href).id
    }
  };
  ajaxJS(param, function (res) {}, function (error) {});
};

// 分享二维码
var codeShare = function codeShare() {
  $('.shop_box').css({
    height: '100vh',
    overflow: 'hidden',
    position: 'fixed'
  });
  $('.shareQRCode').show();
};

// 猜你喜欢
var goodspreferGet = function goodspreferGet() {
  var param = {
    url: 'html/get/index/getInfo',
    type: '',
    data: {
      memId: localStorage.scMemId || ''
    }
  };
  ajaxJS(param, function (res) {
    var arr = '';
    for (var j in res.data.products) {
      var goodsId = res.data.products[j].goodsUrl.substr(res.data.products[j].goodsUrl.indexOf('id=') + 3);
      // console.log(goodsId)
      arr += '\n                <div class="swiper-slide">\n                    <a href="./shop_detail.html?id=' + goodsId + '" class="newdir_href">\n                        <img src="' + res.data.products[j].goodsImage + '" alt="">\n                        <div class="title">' + res.data.products[j].goodsTitle + '</div>\n                        <div class="parce">\xA5 ' + res.data.products[j].goodsPrice.toFixed(2) + '</div>\n                        ' + (res.data.products[j].integralPrice === 0 || res.data.products[j].integralPrice === null || res.data.products[j].integralPrice === undefined ? '' : '<div class="discount">+积分:' + res.data.products[j].integralPrice + '</div>') + '\n                        \n                    </a>\n                </div>\n            ';
    }
    $('.guesslikeC').html('\n        <div class="home_content opacity">\n            <div class="home_content_con">\n                <div class="">\n                    <div class="swiper-container3 ' + (res.data.products.length < 4 ? 'swiper-no-swiping' : '') + '">\n                        <div class="swiper-wrapper">\n                              ' + arr + '\n                        </div>\n                        <div class="swiper-pagination"></div>\n                    </div>\n                </div>\n            </div>\n        </div>\n        ');
    var swiper3 = new Swiper('.swiper-container3', {
      slidesPerView: res.data.length < 4 ? res.data.length : 3.5,
      // spaceBetween: 20,
      slidesPerGroup: 1,
      // loop: true,
      loopFillGroupWithBlank: true,
      observer: true,
      observerParent: true,
      pagination: {
        el: '.swiper-container3 .swiper-pagination',
        clickable: true
      }
    });
  }, function (error) {});
};

//安卓或IOS的唤醒或下载方法
var ifAoIdownOshare = function ifAoIdownOshare() {
  if (isAndroid) {
    wakeOrInstallApp();
  } else if (isiOS) {
    fromShareFun();
  }
};