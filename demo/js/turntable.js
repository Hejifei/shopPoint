'use strict';

var lotteryId = getUrl(location.href).lotteryId;
var frompoint = getUrl(location.href).frompoint ? true : false; // 从积分商城内部过来
var ifLotteryStart = false; // 抽奖是否开始
var complimentaryNumber = 0; // 剩余抽奖次数
var exchangeIntegral = 0; // 换购抽奖积分数
var ifLotterying = false; //抽奖是否进行中
var allIntegral = 0; //用户积分
var isBoolean = true; //用户是否可以抽奖
var exchangeCount = 0; //限换次数
var hasExchangedCount = 0; //已换购次数
var isStart = true;
var mySwiper = new Swiper('.swiper-container', {
  direction: 'vertical',
  pagination: {
    el: '.swiper-pagination'
  },
  speed: 1500,
  loop: true,
  observer: true, //修改swiper自己或子元素时，自动初始化swiper 
  observeParents: true, //修改swiper的父元素时，自动初始化swiper 
  onSlideChangeEnd: function onSlideChangeEnd(swiper) {
    swiper.update();
    mySwiper.startAutoplay();
    mySwiper.reLoop();
  },
  autoplayDisableOnInteraction: false,
  autoplay: 300
});

$(function () {
  prizecheck();
  lotterydetail();
  prizeList();
  // 延时获取客服电话
  setTimeout(function () {
    getHelp();
  }, 300);
});

// 立即抽奖
var luckydraw = function luckydraw(resdata) {
  console.log(resdata.index);
  var purposeSel = resdata.index; // 选中项
  var nowsel = 0; //当前选中奖品
  var timeSpace = 80; //滚动速度 单位毫秒
  // 背景每隔8毫秒切换
  var loadng = setInterval(function () {
    luckysel(nowsel);
    nowsel++;
    if (nowsel === 8) {
      nowsel = 0;
    }
  }, timeSpace);
  // 加速
  setTimeout(function () {
    timeSpace = 40;
    clearInterval(loadng);
    loadng = setInterval(function () {
      luckysel(nowsel);
      nowsel++;
      if (nowsel === 8) {
        nowsel = 0;
      }
    }, timeSpace);
  }, 1000);
  // 减速
  setTimeout(function () {
    timeSpace = 100;
    clearInterval(loadng);
    loadng = setInterval(function () {
      luckysel(nowsel);
      nowsel++;
      if (nowsel === 8) {
        nowsel = 0;
      }
    }, timeSpace);
  }, 1500);
  // 三秒后执行
  setTimeout(function () {
    // mySwiper.stopAutoplay()
    // 使得swiper滚动到第一条数据
    // mySwiper.slideTo(1, 1000, false);
    var timeout = 0;

    if (purposeSel > nowsel) {
      timeout = timeSpace * (Math.abs(purposeSel - nowsel) + 1);
    } else {
      timeout = timeSpace * (Math.abs(8 + purposeSel - nowsel) + 1);
    }

    setTimeout(function () {
      clearInterval(loadng);
      luckysel(purposeSel);
      setTimeout(function () {
        ifLotterying = false;
        // 弹出抽奖结果
        ttResultShow(resdata.prizeType, resdata);
      }, 1000);
    }, timeout);
  }, 3000);
};

// 背景灯切换
setInterval(function () {
  if ($('.draw').hasClass('runing')) {
    $('.runing').removeClass('runing');
  } else {
    $('.draw').addClass('runing');
  }
}, 200);

// 奖品选中效果 0~7
var luckysel = function luckysel(sel) {
  if (sel < 3) {
    $('.drawColSel').removeClass('drawColSel');
    $('.draw .drawRow:eq(0)').find('.drawCol:eq(' + sel + ')').addClass('drawColSel');
  } else if (sel === 3) {
    $('.drawColSel').removeClass('drawColSel');
    $('.draw .drawRow:eq(1)').find('.drawCol:eq(2)').addClass('drawColSel');
  } else if (sel >= 4 && sel <= 6) {
    $('.drawColSel').removeClass('drawColSel');
    $('.draw .drawRow:eq(2)').find('.drawCol:eq(' + (6 - sel) + ')').addClass('drawColSel');
  } else if (sel === 7) {
    $('.drawColSel').removeClass('drawColSel');
    $('.draw .drawRow:eq(1)').find('.drawCol:eq(0)').addClass('drawColSel');
  }
};

/* 获奖或谢谢惠顾弹框
 * type 1 中奖 2 谢谢惠顾
 * goods 奖品名称
 * goodsimg 奖品图片
*/
var ttResultShow = function ttResultShow(type, goodsInfo) {
  if (type === 0) {
    // 谢谢惠顾
    $('.ttrTitle span').text('很遗憾');
    $('.ttrTitle label').text('奖品与你擦肩而过了');
    $('.ttrimg img').attr('src', '../images/mian_pic11.png');
  } else {
    // 中奖
    $('.ttrTitle span').text('恭喜您');
    $('.ttrTitle label').text('获得了' + goodsInfo.prizeName);
    $('.ttrimg img').attr('src', goodsInfo.prizeImg);
  }

  $('.ttResultC').fadeIn();
};

// 点击页面关闭
$('.sign_out').click(function () {
  if (frompoint) {
    window.history.go(-1);
  } else if (isWechat) {
    window.location.href = h5pswurl + '/tiens-h5/html/home.html';
  } else if (isAndroid) {
    setTimeout(function () {
      window.history.go(-1);
    }, 1000);
    window.android.onClosePage();
  } else if (isiOS) {
    setTimeout(function () {
      window.history.go(-1);
    }, 1000);
    window.webkit.messageHandlers.onClosePage.postMessage(null);
  } else {
    window.history.go(-1);
  }
});

// 抽奖结果弹窗关闭
$('.backbtn').click(function () {
  $('.ttResultC').fadeOut();
});

// 积分换取抽奖机会 关闭
$('.cancelBth').click(function () {
  $('.ttStartC').fadeOut();
  ifLotterying = false;
});

var ifexchanging = false; // 是否正在换购  防止积分换购连点
// 确认消耗积分抽奖
$('.confirmBth').click(function () {
  if (!ifexchanging) {
    ifexchanging = true;

    $('.ttStartC').hide();
    // 积分不足
    if (allIntegral < exchangeIntegral) {
      layer.open({
        content: '积分不足',
        skin: 'msg',
        time: 2 //2秒后自动关闭
      });
    }
    // 如果限购次数和已换购次数相等
    else if (exchangeCount == hasExchangedCount) {
        layer.open({
          content: '剩余次数为0',
          skin: 'msg',
          time: 2 //2秒后自动关闭
        });
      } else {
        prize();
      }
  }
});

// 抽奖
var prize = function prize() {
  if (localStorage.scMemId && localStorage.token) {
    var param = {
      url: 'html/get/lottery/prize',
      type: '',
      data: {
        memId: memidGet(),
        lotteryId: lotteryId
      }
    };
    ajaxJS(param, function (res) {
      if (res.code === '0') {
        // 剩余抽奖次数
        complimentaryNumber = res.data.complimentaryNumber;
        // 调抽奖方法
        luckydraw(res.data);
        // 调用详情接口
        if (complimentaryNumber === 0) {
          $('#awBtn p').text(exchangeIntegral + '\u79EF\u52061\u6B21');
          // 积分不足
          if (allIntegral < exchangeIntegral) {
            $('#awBtn p').text('\u79EF\u5206\u4E0D\u8DB3');
            isBoolean = false;
          }
          // 如果限购次数和已换购次数相等
          if (exchangeCount == hasExchangedCount) {
            isBoolean = false;
            $('#awBtn p').text('\u5269\u4F590\u6B21');
          }
        } else {
          $('#awBtn p').text('\u5269\u4F59' + complimentaryNumber + '\u6B21');
        }
        if (res.data.hasExchangedCount === res.data.exchangeCount) {
          isBoolean = false;
          $('#awBtn p').text('可换购0次');
          $('#awBtn').click(function () {
            if (checkLogin()) {
              layer.open({
                content: '当日换购次数上限',
                skin: 'msg',
                time: 2 //2秒后自动关闭
              });
            }
          });
        }
        // 获取中奖记录
        prizeList();
      } else {
        ifLotterying = false;
      }
      setTimeout(function () {
        ifexchanging = false;
      }, 1000);
    }, function (error) {
      setTimeout(function () {
        ifexchanging = false;
      }, 1000);
      layer.open({
        content: error.msg,
        skin: 'msg',
        time: 2 //2秒后自动关闭
      });
      $('#awBtn').click(function () {
        if (checkLogin()) {
          layer.open({
            content: error.msg,
            skin: 'msg',
            time: 2 //2秒后自动关闭
          });
        }
      });
    });
  }
};

// 获取中奖记录
var prizeList = function prizeList() {
  var param = {
    url: 'html/get/lottery/prizeList',
    type: '',
    data: {
      lotteryId: lotteryId
    }
  };
  ajaxJS(param, function (res) {
    if (res.code === '0') {
      var prizeListArr = '';
      if (res.data.length > 0) {
        for (var i in res.data) {
          prizeListArr += '\n            <div class="swiper-slide">\n              <p><span class="cityname">' + (res.data[i].memNickName !== null ? res.data[i].memNickName : '赢粉会员') + '</span><span>' + res.data[i].memPhone + '</span></p>\n              <p><span>\u62BD\u4E2D\u4E86' + res.data[i].prizeName + '</span></p>\n            </div>';
        }
      } else {
        prizeListArr += '\n            <div class="swiper-slide">\n              <p class="norecord"><span>\u6682\u65E0\u4E2D\u5956\u8BB0\u5F55\uFF01</span></p>\n            </div>';
      }
      $('.swiper-wrapper').html(prizeListArr);
    }
  }, function (error) {
    layer.open({
      content: error.msg,
      skin: 'msg',
      time: 2 //2秒后自动关闭
    });
  });
};

// 获取抽奖详情
var lotterydetail = function lotterydetail() {
  var param = {
    url: 'html/get/lottery/detail',
    type: '',
    data: {
      memId: memidGet(),
      lotteryId: lotteryId
    }
  };
  ajaxJS(param, function (res) {

    $('head title').html(res.data.title);
    complimentaryNumber = res.data.complimentaryNumber;
    exchangeIntegral = res.data.exchangeIntegral;
    exchangeCount = res.data.exchangeCount;
    hasExchangedCount = res.data.hasExchangedCount;
    allIntegral = res.data.integral;
    $('.ttsbody p span').text(exchangeIntegral + '积分');
    if (complimentaryNumber === 0) {
      $('#awBtn p').text(exchangeIntegral + '\u79EF\u52061\u6B21');
      // 积分不足
      if (allIntegral < exchangeIntegral) {
        $('#awBtn p').text('\u79EF\u5206\u4E0D\u8DB3');
        isBoolean = false;
      }
      // 如果限购次数和已换购次数相等
      if (exchangeCount == hasExchangedCount) {
        isBoolean = false;
        $('#awBtn p').text('可换购0次');
      }
    } else {
      $('#awBtn p').text('\u5269\u4F59' + complimentaryNumber + '\u6B21');
    }

    $('.ttFooter p').html(res.data.regulation);

    for (var i = 0; i < 3; i++) {
      $('.draw .drawRow:eq(0)').find('.drawCol:eq(' + i + ')').find('img').attr('src', res.data.prizes[i].img);
      $('.draw .drawRow:eq(0)').find('.drawCol:eq(' + i + ')').find('p').text(res.data.prizes[i].name);
    }
    $('.draw .drawRow:eq(1)').find('.drawCol:eq(2)').find('img').attr('src', res.data.prizes[3].img);
    $('.draw .drawRow:eq(1)').find('.drawCol:eq(2)').find('p').text(res.data.prizes[3].name);
    for (var _i = 4; _i < 7; _i++) {
      var j = 6 - _i;
      $('.draw .drawRow:eq(2)').find('.drawCol:eq(' + j + ')').find('img').attr('src', res.data.prizes[_i].img);
      $('.draw .drawRow:eq(2)').find('.drawCol:eq(' + j + ')').find('p').text(res.data.prizes[_i].name);
    }
    $('.draw .drawRow:eq(1)').find('.drawCol:eq(0)').find('img').attr('src', res.data.prizes[7].img);
    $('.draw .drawRow:eq(1)').find('.drawCol:eq(0)').find('p').text(res.data.prizes[7].name);
    if (res.data.freezeStatus == 1) {
      $('#awBtn p').text('\u8D26\u53F7\u5DF2\u51BB\u7ED3');
      isBoolean = false;
    }
  }, function (error) {
    isBoolean = false;
    layer.open({
      content: error.msg,
      skin: 'msg',
      time: 2 //2秒后自动关闭
    });
    $('.noGoodsCover').show();
  });
};

// 抽奖活动验证
var prizecheck = function prizecheck() {
  var param = {
    url: 'html/get/lottery/check',
    type: '',
    data: {
      lotteryId: lotteryId
    }
  };
  ajaxJS(param, function (res) {
    if (res.code === '0') {
      $('#awBtn').click(function () {
        if (checkLogin()) {
          if (isBoolean) {
            gotoLottery();
          } else {
            // 积分不足
            if (allIntegral < exchangeIntegral) {
              layer.open({
                content: '积分不足',
                skin: 'msg',
                time: 2 //2秒后自动关闭
              });
            }
            // 如果限购次数和已换购次数相等
            if (exchangeCount === hasExchangedCount) {
              layer.open({
                content: '换购次数为0',
                skin: 'msg',
                time: 2 //2秒后自动关闭
              });
            }
          }
        }
      });
    } else {
      $('#awBtn').click(function () {
        if (checkLogin()) {
          layer.open({
            content: res.msg,
            skin: 'msg',
            time: 2 //2秒后自动关闭
          });
        }
      });
    }
  }, function (error) {
    layer.open({
      content: error.msg,
      skin: 'msg',
      time: 2 //2秒后自动关闭
    });
    $('#awBtn').click(function () {
      if (checkLogin()) {
        layer.open({
          content: error.msg,
          skin: 'msg',
          time: 2 //2秒后自动关闭
        });
      }
    });
    $('.noGoodsCover').show();
  });
};

var gotoLottery = function gotoLottery() {
  // 若正在抽奖中，则点击抽奖无效
  if (!ifLotterying) {
    ifLotterying = true;
    if (complimentaryNumber === 0) {
      // 没有免费抽奖次数 需要消耗积分
      $('.ttStartC').fadeIn();
    } else {
      prize();
    }
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
      $('.mobilea').attr('href', "tel:" + res.data.walletServicePhone);
      // res.data.walletServicePhone
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

var checkLogin = function checkLogin() {
  // 强制登录
  if (localStorage.token === undefined || localStorage.scMemId === undefined || localStorage.scMemId === '') {
    if (isWechat) {
      location.href = h5loginurl;
    } else if (isAndroid) {
      window.android.mustLogin();
    } else {
      // ios
      window.webkit.messageHandlers.mustLogin.postMessage(null);
    }
    return false;
  } else {
    return true;
  }
};