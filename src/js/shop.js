let shopId = getUrl(location.href).shopId
var appdownurl = h5pswurl + '/tiens-h5/html/download.html'
var ifdownloading = false
var querydata = {
  searchName: $('#searchName').val(),
  shopId: getUrl(location.href).shopId,
  searchType: 1,
  page: 1,
  pageSize: 10
}

function bodyfontrep(){
}

$(function() {
  // 若连接中带sta=1 则跳转下载页面
  if (getUrl(location.href).sta == 1) {
    if(getUrl(location.href).invitationCode){
      window.location.href = appdownurl+'?invitationCode='+getUrl(location.href).invitationCode
    }else{
      window.location.href = appdownurl
    }
  }

  // 下拉刷新成功事件
	function reloadinit(){
		querydata.searchName = $('#searchName').val()
    querydata.page = 1
    shopGoodsGet(querydata)
	}
	// 上拉加载成功事件
	const pullloadfun = ()=>{
    if(querydata.page <= (totalpages-1)){
      querydata.page++
      shopGoodsGet(querydata)
    }
	}
	// 下拉刷新、上拉加载初始化方法
	tianscrollinit(reloadinit,pullloadfun)

  if(!isWechat){
    // 顶部高度计算
    $('.home_top').css({
      'padding-top': (statusBarHeight / 75).toFixed(4) + 'rem'
    })
    $('.content').css(
      'height',
      '-webkit-calc(100vh - ' + ((310 + statusBarHeight) / 75).toFixed(4) + 'rem)'
    )
  }
  $('.shop_box').css('visibility','visible');
  if ($('#searchName').val() !== '') {
    $('.home_seach .plachehold').hide()
  }
  $('.search_top').css('visibility', 'visible')
  
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

  querydata.shopId = shopId
  shopInfoGet()
  shopGoodsGet(querydata)

  // 输入框点击 文字隐藏
  $('.home_seach .plachehold').click(function() {
    $('.home_seach .plachehold').hide()
    $('.home_seach input').focus()
    bodyfontrep();
  })
  $('.home_seach input').blur(function() {
    if ($(this).val() === '') {
      $('.home_seach .plachehold').show()
    } else {
      $('.home_seach .plachehold').hide()
    }
    bodyfontrep();
  })

  let menuliSel_index = ''
  // 筛选
  $('.menuUl li').click(function() {
    menuliSel_index = $(this).index()
    switch ($(this).index()) {
      case 0:
        var arr = [
          { name: '默认排序', searchType: 0 },
          { name: '价格从高到低', searchType: 1 },
          { name: '价格从低到高', searchType: 2 },
          { name: '新品优先', searchType: 4 }
        ]
        var menuSon = ''
        for (let i in arr) {
          if ($(this).hasClass('menusel_re')) {
            if (Number(querydata.searchType) === Number(arr[i].searchType)) {
              menuSon +=
                "<li searchType='" +
                arr[i].searchType +
                "' class='menusonSel'>" +
                arr[i].name +
                '</li>'
            } else {
              menuSon +=
                "<li searchType='" +
                arr[i].searchType +
                "'>" +
                arr[i].name +
                '</li>'
            }
          } else {
            menuSon +=
              "<li searchType='" +
              arr[i].searchType +
              "'>" +
              arr[i].name +
              '</li>'
          }
        }
        $('.menuSonUl').html(menuSon)
        $('.menusel_re').removeClass('menusel_re')
        $(this).addClass('menusel_re')
        // 隐藏滚动条
        $('.shop_box').css({ height: '100vh', overflow: 'hidden' })
        $('.graymodel').show()
        $('.menuSonUl').show()
        break
      case 1:
        $('.menusel').removeClass('menusel')
        $(this).addClass('menusel')
        querydata.searchName = $('#searchName').val(),
        querydata.searchType = $(this).attr('searchType')
        querydata.page = 1
        document.getElementsByClassName('content')[0].scrollTop = 0
        shopGoodsGet(querydata)
        $('.menuUl li:eq(3)').html('价格<span class="ordersort">')
        $('.menuUl li:eq(0)').html('综合<span class="ordersort">')
        $('.graymodel').hide()
        $('.menuSonUl').hide()
        break
      case 2:
        $('.menusel').removeClass('menusel')
        $(this).addClass('menusel')
        querydata.searchName = $('#searchName').val(),
        querydata.searchType = $(this).attr('searchType')
        querydata.page = 1
        document.getElementsByClassName('content')[0].scrollTop = 0
        shopGoodsGet(querydata)
        $('.menuUl li:eq(3)').html('价格<span class="ordersort">')
        $('.menuUl li:eq(0)').html('综合<span class="ordersort">')
        $('.graymodel').hide()
        $('.menuSonUl').hide()
        break
      case 3:
        var arr = [
          { name: '价格从高到低', searchType: 1 },
          { name: '价格从低到高', searchType: 2 }
        ]
        var menuSon = ''
        for (let i in arr) {
          if ($(this).hasClass('menusel_re')) {
            if (Number(querydata.searchType) === Number(arr[i].searchType)) {
              menuSon +=
                "<li searchType='" +
                arr[i].searchType +
                "' class='menusonSel'>" +
                arr[i].name +
                '</li>'
            } else {
              menuSon +=
                "<li searchType='" +
                arr[i].searchType +
                "'>" +
                arr[i].name +
                '</li>'
            }
          } else {
            menuSon +=
              "<li searchType='" +
              arr[i].searchType +
              "'>" +
              arr[i].name +
              '</li>'
          }
        }
        $('.menuSonUl').html(menuSon)
        $('.menusel_re').removeClass('menusel_re')
        $(this).addClass('menusel_re')
        // 隐藏滚动条
        $('.shop_box').css({ height: '100vh', overflow: 'hidden' })
        $('.graymodel').show()
        $('.menuSonUl').show()
        break
    }
  })
  // 排序选择
  $('.menuSonUl').delegate('li', 'click', function() {
    $('.menusonSel').removeClass('menusonSel')
    $(this).addClass('menusonSel')
    // 显示滚动条
    $('.shop_box').attr('style','visibility: visible;')
    $('.graymodel').hide()
    $('.menuSonUl').hide()
    if ($('.menusel_re').index() === 0) {
      $('.menuUl li:eq(3)').html('价格<span class="ordersort">')
    } else if ($('.menusel_re').index() === 3) {
      $('.menuUl li:eq(0)').html('综合<span class="ordersort">')
    }
    $('.menusel_re').html($(this).text() + '<span class="ordersort">')
    querydata.searchType = $(this).attr('searchType')
    querydata.page = 1
    document.getElementsByClassName('content')[0].scrollTop = 0;
    shopGoodsGet(querydata)
    $('.menusel').removeClass('menusel')
    $('.menusel_re').addClass('menusel')
  })
  // 模态框点击隐藏
  $('.graymodel').click(function() {
    // 显示滚动条
    $('.shop_box').attr('style',"visibility:visible")
    $('.graymodel').hide()
    $('.menuSonUl').hide()
  })

  // 商品添加
  $('.home_content_content').delegate('.add', 'click', function(ev) {
    ev.preventDefault()
    // 若session中带share 则唤醒或下载app
    if(sessionStorage.fromshare !== undefined){
      if(isAndroid){
        wakeOrInstallApp()
      }else if (isiOS){
        fromShareFun()
      }
      return false
    }
    if (
      localStorage.token === undefined ||
      localStorage.scMemId === undefined
    ) {
      if (isWechat) {
				location.href = h5loginurl
			} else if (isAndroid) {
        window.android.mustLogin()
      } else {
        // ios
        window.webkit.messageHandlers.mustLogin.postMessage(null)
      }
      throw ''
    }
    // 加入购物车动画
    var flyElm = $(this)
      .parents('li')
      .find('.img img')
      .clone()
      .css('opacity', '0.8')
    flyElm.css({
      'z-index': 9000,
      display: 'block',
      position: 'absolute',
      top:
        $(this)
          .parents('li')
          .find('.img img')
          .offset().top + 'px',
      left:
        $(this)
          .parents('li')
          .find('.img img')
          .offset().left + 'px',
      width:
        $(this)
          .parents('li')
          .find('.img img')
          .width() + 'px',
      height:
        $(this)
          .parents('li')
          .find('.img img')
          .height() + 'px'
    })
    $('body').append(flyElm)
    flyElm.animate(
      {
        top: $('.home_bottom_nav ul li:eq(2)').offset().top,
        left: $('.home_bottom_nav ul li:eq(2)').offset().left,
        width: 2,
        height: 2
      },
      600,
      function() {
        flyElm.remove()
      }
    )
    // 加入购物车
    addtoShopCar($(this).attr('goodsid'))
  })

  // 搜索提交
  $('#searchName').bind('keypress', function(event) {
    if (event.keyCode == '13') {
      event.preventDefault()
      $('#searchName').blur()
      querydata = {
        searchName: $('#searchName').val(),
        shopId: shopId,
        searchType: 1,
        page: 1,
        pageSize: 10
      }
      menulistrenew();
      shopGoodsGet(querydata)
      $('.shop_box').attr('style',"visibility:visible")
      $('.graymodel').hide()
      $('.menuSonUl').hide()
    }
  })

  
})

// 排序选项及文字恢复
const menulistrenew = () => {
  // querydata.page = 1;
  // querydata.searchType = 1;
  $('.menusel').removeClass('menusel');
  $('.menusel_re').removeClass('menusel_re');
  $('.menuUl li:eq(3)').html('价格<span class="ordersort">')
  $('.menuUl li:eq(0)').html('综合<span class="ordersort">')
}

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

const shopInfoGet = () => {
  var param = {
    url: 'get/shop/goods/getShopInfo',
    type: '',
    data: {
      shopId: shopId
    }
  }
  ajaxJS(
    param,
    res => {
      $('.shop_detail .title').html(
        `<span class="opacity">${
          res.data.shopName
        }</span><a href='./shopInfo.html?shopId=${shopId}'>商家信息<img src="../images/general_next.png" /></a>`
      )
      let starlist = ''
      if (res.data.starLevel > 0) {
        for (let i = 0; i < res.data.starLevel; i++) {
          starlist += `<img class='opacity' src="../images/shop_level.png" />`
        }
      }
      $('.home_top').css({
        background:
          'url(' + res.data.backUrlImage + ') no-repeat center center',
        'background-size': 'cover'
      })
      $('.logoImage').attr('src', res.data.logoImage === '' || res.data.logoImage === null ? '../images/shop_nopic.png' : res.data.logoImage)
      $('.shop_detail .rank').html(starlist)
      // 定时下拉加载文字及小狮子页面加载一秒钟后显示
      setTimeout(() => {
        $('.top-tip').show()
      }, 1000);
    },
    error => {
      layer.open({
        content: error.msg,
        skin: 'msg',
        time: 2 //2秒后自动关闭
      })
    }
  )
}

// 店铺主页商品
const shopGoodsGet = querydata => {
  var param = {
    url: 'get/shop/goods/getShopGoods',
    type: '',
    data: querydata
  }
  ajaxJS(
    param,
    res => {
      let arrlist = ''
      if (res.data.list !== null) {
        totalpages = res.data.pages;
        arrlist += '<ul>'
        for (let i in res.data.list) {
          arrlist += `
                <li class="opacity">
                    <a href='./shop_detail.html?id=${res.data.list[i].goodsId}'>
                        <div class="img">
                          <div><img class="lazy" data-original="${res.data.list[i].imageUrl}" alt=""></div>
                        </div>
                        <div class="detail">
                            <div class="title">${
                              res.data.list[i].goodsName
                            }</div>
                            <div class="more">
                                <div class="price">¥ ${
                                  res.data.list[i].showPrice
                                }</div>
                                ${
                                  res.data.list[i].integralPrice === null ||
                                  res.data.list[i].integralPrice === 0
                                    ? ''
                                    : '<div class="discount">+积分:' +
                                      parseInt(res.data.list[i].integralPrice) +
                                      '</div>'
                                }
                                <div class="add" goodsid='${
                                  res.data.list[i].goodsId
                                }'><img src="../images/main_add.png" /></div>
                            </div>
                        </div>
                    </a>
                </li>
                `
        }
        arrlist += '</ul>'
      } else {
        totalpages = 0;
        if (querydata.searchName === '') {
          arrlist += `<div class="shopregistnone opacity">该店铺暂无商品！</div>`
        } else {
          arrlist += `<div class="shopregistnone opacity">该店铺暂无此类商品！</div>`
        }
      }
      if (querydata.page === 1) {
        $('.home_content_content').html(arrlist)
      } else {
        $('.home_content_content').append(arrlist)
      }
      // 下拉刷新成功回调
      tianscrolsuccFun()
      Imglazy()
    },
    error => {
      layer.open({ content: error.msg, skin: 'msg', time: 2 }) //2秒后自动关闭
    }
  )
}

// 加入购物车
const addtoShopCar = goodsid => {
  var param = {
    url: 'get/shop/order/addToShoppingCart',
    type: '',
    data: {
      memId: memidGet(),
      number: 1,
      goodsId: goodsid
    }
  }
  ajaxJS(
    param,
    res => {
      layer.open({
        content: res.msg,
        skin: 'msg',
        time: 2 //2秒后自动关闭
      })
    },
    error => {
      layer.open({
        content: error.msg,
        skin: 'msg',
        time: 2 //2秒后自动关闭
      })
    }
  )
}

const Imglazy =()=>{
  $("img.lazy").lazyload({
      placeholder : "../images/shop_nopic.png", //用图片提前占位
      // placeholder,值为某一图片路径.此图片用来占据将要加载的图片的位置,待图片加载时,占位图则会隐藏
      effect: "fadeIn", // 载入使用何种效果
      // effect(特效),值有show(直接显示),fadeIn(淡入),slideDown(下拉)等,常用fadeIn
      threshold: 20, // 提前开始加载
      // threshold,值为数字,代表页面高度.如设置为200,表示滚动条在离目标位置还有200的高度时就开始加载图片,可以做到不让用户察觉
      // event: 'sporty',  // 事件触发时才加载
      // event,值有click(点击),mouseover(鼠标划过),sporty(运动的),foobar(…).可以实现鼠标莫过或点击图片才开始加载,后两个值未测试…
      container: $(".content >div"),  // 对某容器中的图片实现效果
      // container,值为某容器.lazyload默认在拉动浏览器滚动条时生效,这个参数可以让你在拉动某DIV的滚动条时依次加载其中的图片
      failurelimit : 10 ,// 图片排序混乱时
      // failurelimit,值为数字.lazyload默认在找到第一张不在可见区域里的图片时则不再继续加载,但当HTML容器混乱的时候可能出现可见区域内图片并没加载出来的情况,failurelimit意在加载N张可见区域外的图片,以避免出现这个问题.
      skip_invisible : false,
  });
}

//openinstall初始化时将与openinstall服务器交互，应尽可能早的调用
/*web页面向app传递的json数据(json string/js Object)，应用被拉起或是首次安装时，通过相应的android/ios api可以获取此数据*/
var openappdata = OpenInstall.parseUrlParams();//openinstall.js中提供的工具函数，解析url中的所有查询参数
new OpenInstall({
    /*appKey必选参数，openinstall平台为每个应用分配的ID*/
    appKey : "qje2hg",
    onready : function() {
        var m = this, button = document.getElementById("downloadButton");
        button.style.visibility = "visible";
        if(getUrl(location.href).share !== undefined){
          /*在app已安装的情况尝试拉起app*/
          m.schemeWakeup();
          
          /*用户点击某个按钮时(假定按钮id为downloadButton)，安装app*/
          button.onclick = function() {
              try {
                /*在app已安装的情况尝试拉起app*/
                // m.schemeWakeup();
                m.wakeupOrInstall();
              } catch (error) {
                // 否则跳转app下载页面
                // m.wakeupOrInstall();
                if(getUrl(location.href).invitationCode){
                  location.href = appdownurl+"?invitationCode="+getUrl(location.href).invitationCode
                }else{
                  location.href = appdownurl
                }
              }
              return false;
          }
          wakeOrInstallApp = function(){
            if (isOtherBro()) {
              $('.shareFlex').toggle()
            } else {
              try {
                setTimeout(() => {
                  if(!ifdownloading){
                    // loading 隐藏
                    $('.loadingC').hide()
                    if(getUrl(location.href).invitationCode){
                      location.href = appdownurl+"?invitationCode="+getUrl(location.href).invitationCode
                    }else{
                      location.href = appdownurl
                    }
                  }
                }, 3000);
                /*在app已安装的情况尝试拉起app*/
                // loading 显示
                $('.loadingC').show()
                m.schemeWakeup();
              } catch (error) {
                // loading 隐藏
                $('.loadingC').hide()
                // 否则跳转app下载页面
                // m.wakeupOrInstall();
                ifdownloading = true
                if(getUrl(location.href).invitationCode){
                  location.href = appdownurl+"?invitationCode="+getUrl(location.href).invitationCode
                }else{
                  location.href = appdownurl
                }
              }
            }
          }
        }
    }
}, openappdata);

/**
 * 分享的是否用的系统浏览器打开；以及是否安装app等
 */
const fromShareFun = () => {
  let shareUrl = window.location.href+'&download=1'
  let openAppUrl = 'https://photo.pointswin.com/openApp.html'
  if (isOtherBro()) {
    $('.shareFlex').toggle()
  } else if (navigator.userAgent.match(/(iPhone|iPod|iPad);?/i)) {
    // ios唤醒app
    if(getUrl(location.href).invitationCode){
      window.location.href = openAppUrl + '?url=' + shareUrl + '&sta=1&invitationCode='+getUrl(location.href).invitationCode
    }else{
      window.location.href = openAppUrl + '?url=' + shareUrl + '&sta=1'
    }
    
  }
}

/**
 *  判断分享中的浏览器
 */
const isOtherBro = () => {
  var ua = navigator.userAgent.toLowerCase()//获取判断用的对象
  if (ua.match(/MicroMessenger/i) == 'micromessenger') {
    return true
  } else if (ua.match(/WeiBo/i) == 'weibo') {
    return true
  } else if (ua.match(/QQ/i) == 'qq') {
    return true
  }
}
