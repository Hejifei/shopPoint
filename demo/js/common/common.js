FastClick.attach(document.body)

if (localStorage.getItem('language') == 'en') {
  $('.cn').hide()
  $('.en').show()
} else {
  $('.en').hide()
  $('.cn').show()
}

//防sql
//过滤URL非法SQL字符
/*var sUrl = location.search.toLowerCase()
var sQuery = sUrl.substring(sUrl.indexOf("=") + 1)
re = /select|update|delete|truncate|join|union|exec|insert|drop|count|'|"|;|>|<|%/i
if (re.test(sQuery)) {
  alert("请勿输入非法字符")
  location.href = sUrl.replace(sQuery, "")
}*/

// 2.输入文本框防注入:

//防止SQL注入
function AntiSqlValid(oField) {
  // re = /select|update|delete|exec|count|'|"|=|;|>|<|%/i;
  re = /select|update|delete|exec|count|'|"|;|>|<|%/i
  if (re.test(oField.value)) {
    // alert("请您不要在参数中输入特殊字符和SQL关键字！");
    oField.value = ''
    oField.className = 'errInfo'
    oField.focus()
    return false
    window.location.reload()
  }
}

$('input').attr('onblur', 'AntiSqlValid(this)') //防止Sql脚本注入

//获取基础数据

// 清除H5在app端的头部信息
function hideTopData() {
  $('.activites_top').css('display', 'none')
}

// 只保留2位小数
function num2num(num) {
  var bb = num + ''
  var dian = bb.indexOf('.')
  var result = ''
  if (dian == -1) {
    result = num.toFixed(2)
  } else {
    var cc = bb.substring(dian + 1, bb.length)
    if (cc.length >= 3) {
      result = ((Number(num.toFixed(2)) + 0.01) * 100000000000) / 100000000000
    } else {
      result = num.toFixed(2)
    }
  }
}

//  判断终端的类型
function isIosAndH5() {
  var u = navigator.userAgent
  var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) //ios终端
  var kg = UrlParm.parm('from')
  var arrKg = [
    'active',
    'news',
    'ad',
    'store',
    'push',
    'infoma',
    'business',
    'message'
  ]
  if (arrKg.indexOf(kg) == '-1') {
    if (isiOS) {
      return 1
    } else {
      return 2
    }
  } else {
    return 0
  }
}

// 判断是否登录
// function isLogin() {
//   var status = isIosAndH5()
//   if(status === 0){
//     if(localStorage.getItem('data')){
//       console.log('h5已经登录')
//     } else {
//       window.location.href = 'login.html'
//     }
//   } else if(status === 1){
//     if(UrlParm.parm('userId')){
//       console.log('ios已经登录')
//     } else {
//       window.webkit.messageHandlers.mustLogin.postMessage(null)
//     }
//   } else {
//     if(UrlParm.parm('memId')){
//       console.log('安卓已经登录')
//     } else {
//       window.android.mustLogin()
//     }
//   }
// }

// 传送userId和token
function transferUser(userId, token) {
  var relationId = UrlParm.parm('relationId')
  var type = UrlParm.parm('type')
  window.location.href =
    'activities.html?type=' +
    type +
    '&relationId=' +
    relationId +
    '&memId=' +
    userId +
    '&token=' +
    token
}

// 2018.8.31 hejifei
//获取地址栏参数
function getUrl(url) {
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

var u = navigator.userAgent
var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1 //android终端
var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) //ios终端
var ua = navigator.userAgent.toLowerCase()
var isWechat = localStorage.h5sta === '2';

// 获取用户id
function memidGet() {
  // console.log(getUrl(location.href).memId !== undefined,)
  if(isWechat && getUrl(location.href).userId !== undefined){
    localStorage.h5sta = '2'
    localStorage.scMemId = getUrl(location.href).userId
    localStorage.token = getUrl(location.href).token
      return getUrl(location.href).userId;
    }else if (getUrl(location.href).memId !== undefined && isAndroid) {
    // 安卓
    localStorage.scMemId = getUrl(location.href).memId
    localStorage.token = getUrl(location.href).token
    return getUrl(location.href).memId
  } else if (getUrl(location.href).userId !== undefined && isiOS) {
    // ios
    localStorage.scMemId = getUrl(location.href).userId
    localStorage.token = getUrl(location.href).token
    return getUrl(location.href).userId
  }
  // else if(isWechat){
  //   localStorage.scMemId = JSON.parse(localStorage.data).memId;
  //   return JSON.parse(localStorage.data).memId;
  // }
  else if (
    localStorage.scMemId !== 'undefined' &&
    localStorage.scMemId !== ''
  ) {
    return localStorage.scMemId
  } else {
    alert('无法获取用户id')
  }
}

var statusBarHeight = ''
if (getUrl(location.href).statusBarHeight !== undefined) {
  statusBarHeight = Number(getUrl(location.href).statusBarHeight)
  localStorage.statusBarHeight = statusBarHeight
} else {
  statusBarHeight = Number(localStorage.statusBarHeight) || 60
}

function transferUser(userId, token) {
  localStorage.scMemId = userId
  localStorage.token = token
  window.location.reload()
}

// h5
if(getUrl(location.href).cmfrom === 'h5'){
  localStorage.h5sta = '2'
  if(getUrl(location.href).userId !== undefined && getUrl(location.href).token !== undefined){
    localStorage.scMemId = getUrl(location.href).userId
    localStorage.token = getUrl(location.href).token
  }
  isWechat = localStorage.h5sta === '2';
}else if (getUrl(location.href).memId !== undefined && isAndroid) {
  // 安卓
  localStorage.scMemId = getUrl(location.href).memId
  localStorage.token = getUrl(location.href).token
} else if (getUrl(location.href).userId !== undefined && isiOS) {
  // ios
  localStorage.scMemId = getUrl(location.href).userId
  localStorage.token = getUrl(location.href).token
}

var reloading = false;
var reloadtimeout = '';
var reloadsucc = '';
var reloaderr = '';
// 下拉刷新公共方法
function pullReload(succFun){
  
  
  // 下拉刷新
  $(document).on('refresh', '.pull-to-refresh-content',function(e) {
      if (reloading) return;
      $('.pull-to-refresh-arrow .span span').text('小狮子正在奋力加载中')
      clearTimeout(reloadtimeout);
      clearTimeout(reloadsucc);
      reloading = true;
      // 下拉刷新自动跳到顶部
      // $(window).scrollTop(0);
      $('.pull-to-refresh-arrow').css('position','relative')
      $('.pull-to-refresh-arrow').addClass('top0')
      reloadtimeout = setTimeout(function() {
          reloading = false;
          // 刷新的方法
          succFun();
          reloaderr = setTimeout(function(){
            $('.pull-to-refresh-arrow .span span').text('刷新失败');
            reloadsucc = setTimeout(() => {
                $('.pull-to-refresh-arrow').css('position','absolute');
                $('.pull-to-refresh-arrow').removeClass('top0')
                $('.pull-to-refresh-arrow .span span').text('下拉刷新');
            }, 500);
          },5000)
          $.pullToRefreshDone('.pull-to-refresh-content');
      }, 1000);
  });
  
  var _element = document.querySelector('.indexContent'),
    _startPos = 0,
    _transitionHeight = 0;

  _element.addEventListener('touchstart', function(e) {
      _startPos = e.touches[0].pageY;
  }, false);
  
  _element.addEventListener('touchmove', function(e) {
      _transitionHeight = e.touches[0].pageY - _startPos;
      
      if (_transitionHeight > 137+$('.pull-to-refresh-layer').position().top) {
          $('.pull-to-refresh-arrow .span span').text('释放立即刷新');
      }			
  }, false);
}

// 下拉刷新成功回调方法
function reloadsuccFun(){
  clearTimeout(reloaderr);
  $('.pull-to-refresh-arrow .span span').text('刷新完成');
  reloadsucc = setTimeout(() => {
      $('.pull-to-refresh-arrow').css('position','absolute');
      $('.pull-to-refresh-arrow').removeClass('top0')
      $('.pull-to-refresh-arrow .span span').text('下拉刷新');
  }, 500);
}

// 上拉加载公共方法
// var totalpages = 1  //总页数
var loading = false //是否加载中
// pulfun 上拉加载调用方法  nowpage 当前页数
function pullupload(pulfun,querydate){
  $(document).on('infinite', '.infinite-scroll', function() {
    // 如果正在加载，则退出
    if (loading) return
    // 设置flag
    loading = true
    setTimeout(function() {
      loading = false
      if (parseInt(querydate.page) >= totalpages) {
        $.detachInfiniteScroll($('.infinite-scroll'))
        $('.infinite-scroll-preloader').remove()
        $('.nomore').show()
        return
      }
      // 加载更多数据的方法
      pulfun()
    }, 1000)
  })
}

// 天狮积分商城提示框公共方法
// option.title 提示标题
// option.content 提示内容
// option.btn 提示按钮list 如 ['确认', '取消'];
// option.yes 确认按钮回调方法
// option.no 取消按钮回调方法
function tiansLayer(option){
  var title = (option.title !== undefined) ? option.title : '提示';
  if (typeof option.no != "function") {
    option.no = function (data) {
      tiansLayerClose()
    }
  }
  var layerbtn = '';
  for(var i = 0;i<option.btn.length ;i++){
    if(i===0){
      layerbtn+='<div class="tslayerbtn-yes">'+option.btn[i]+'</div>'
    }else{
      layerbtn+='<div class="tslayerbtn-no">'+option.btn[i]+'</div>'
    }
    
  }
  var tianslayer = '<div class="tiansshop_layerC">'+
                '<div class="tsl_Bg"></div>'+
                '<div class="tsl_Content">'+
                    '<div class="tsl_header">'+title+'</div>'+
                    '<div class="tsl_body">'+ option.content +'</div>'+
                    '<div class="tsl_footer">'+
                      layerbtn+
                    '</div>'+
                '</div> '+       
            '</div>';
  $('body').append(tianslayer);
  document.body.addEventListener('touchmove',bodyScroll,false);
  $('body').css({ height: '100vh', overflow: 'hidden' })
  $('.tiansshop_layerC').show();
  // 按钮事件绑定
  $('.tslayerbtn-yes').click(function(){
    option.yes();
    document.body.removeEventListener('touchmove',bodyScroll,false);
    // $('body').css({ height: 'auto', overflow: 'auto'  })
    $('body').css({ overflow: 'auto'  })
  })
  $('.tslayerbtn-no').click(function(){
    option.no();
    document.body.removeEventListener('touchmove',bodyScroll,false);
    // $('body').css({ height: 'auto', overflow: 'auto' })
    $('body').css({ overflow: 'auto'  })
  })
}
// 禁止页面滚动
function bodyScroll(event){  
  event.preventDefault();  
}
// 模态框关闭事件
function tiansLayerClose(){
  $('.tiansshop_layerC').hide();
  $('.tiansshop_layerC').remove();
}

var scroll = ''
var totalpages = 1  //总页数
// reloadsuFun 下拉刷新成功回调方法，若传空 则功能不开启
// pullsunFun 上拉加载成功回调方法，若传空 则功能不开启
function tianscrollinit(reloadsuFun, pullsunFun) {
	// console.log(typeof reloadsuFun === "function")
	// console.log(typeof pullsunFun === "function")
	// 初始化
	var pulldownopen = {
		threshold: 0
	}
	var pullupopen = {
		threshold: 0
	}
	var wrapper = document.querySelector('.wrapper')
	scroll = new BScroll(wrapper, {
		probeType: 1,
		click: true,
		stopPropagation: true,
		preventDefaultException: {
			tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT|DIV)$/
		},
		pullDownRefresh: typeof reloadsuFun === 'function' ? pulldownopen : false,
		pullUpLoad: typeof pullsunFun === 'function' ? pullupopen : false
	})

	if (typeof reloadsuFun === 'function') {
		// 下拉刷新
		scroll.on('pullingDown', function(){
      $('.top-tip').hide()
			$('.up_refresh').fadeIn()
			setTimeout(function() {
				reloadsuFun()
				scroll.finishPullDown()
				scroll.refresh()
				$('.up_refresh').fadeOut()
			}, 1000)
			setTimeout(() => {
				$('.top-tip').show()
			}, 1500)
    })
	}

	if (typeof pullsunFun === 'function') {
		// 上拉加载
		scroll.on('pullingUp', function(){
      $('.scroll_bottom').css('visibility', 'visible')
			setTimeout(function() {
				pullsunFun()
				// scroll.finishPullUp()
				// scroll.refresh()
				$('.scroll_bottom').css('visibility', 'hidden')
			}, 1000)
    })
  }
  
  scroll.on('touchEnd',function(){
    scroll.stop()
  })
}

function tianscrolCloseup() {
  scroll.closePullUp()
}

// 下拉刷新成功回调方法
function tianscrolsuccFun() {
	scroll.finishPullUp()
  scroll.refresh()
}

//天狮分享
function shareData() {
  // '<div id="share-qzone" title="QQ空间分享"></div>' +
  // 点击复制链接事件
  let shareBox =
      ' <div class="tiansbox"><div class="tiansboxBg"></div><div class="tiansboxbottom">' +
      '<div id="share-qrcode" title="二维码分享"></div> ' +
      '<div id="share-sina" title="新浪微博分享"></div>' +
      '<div id="share-qq" title="QQ好友分享"></div>' +
      '</div></div>'

  if($('.tiansbox').length > 0){
    $('body').css({'height':'100vh','overflow':'hidden'})
    $('.tiansbox').show()
  }else{
    $('body').css({'height':'100vh','overflow':'hidden'})
    jsModern.share({
      qrcode: '#share-qrcode',
      link: '#share-link',
      // qzone: '#share-qzone',
      sina: '#share-sina',
      qq: '#share-qq',
      sms: '#share-sms'
    })
    $('body').append(shareBox)
  }
  

  //点击其他的位置，分享的窗口消失
  var top = $('.tiansbox').offset().top
  var left = $('.tiansbox').offset().left
  var height = $('.tiansbox').height()
  var width = $('.tiansbox').width()

  function getX(e) {//点击鼠标，获取鼠标X位置
    e = e || window.event
    return e.pageX || e.clientX + document.body.scroolLeft
  }

  function getY(e) {//点击鼠标，获取鼠标Y位置
    e = e || window.event
    return e.pageY || e.clientY + document.boyd.scrollTop
  }

  $('.tiansboxBg').click(function(){
    $('.tiansbox').hide()
    $('body').css({'height':'auto','overflow':'auto'})
  })
  // $(document).click(function (e) {
  //   if (getX(e) > left && getX(e) < left + width && getY(e) > top && getY(e) < top + height) {
  //     return
  //   } else {
  //     $('.tiansbox').hide()
  //     $('body').css({'height':'auto','overflow':'auto'})
  //   }
  // })
}

function linkClick() {
  let urlData = window.location.href
        $('#share-link').zclip({        　
          path: 'ZeroClipboard.swf',
          copy: function(){ 　　　　　　　　　
            return urlData  　
          },
          afterCopy: function(){ //复制成功
            alert('复制成功');
          }
        });
}