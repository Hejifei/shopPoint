var querydata = {
  searchName: $('.find_input_serch').val(),
  layoutId: '',
  searchType: 1,
  page: 1,
  pageSize: 10,
  senseType: 1
}
var layoutId = ''
var layoutName = ''
var shareJson = ''
var appdownurl = h5pswurl + '/tiens-h5/html/download.html'
var wakeOrInstallApp = '' // 唤醒或下载app方法
var ifdownloading = false


$(function () {
  // 若连接中带sta=1 则跳转下载页面
  if (getUrl(location.href).sta == 1) {
    if(getUrl(location.href).invitationCode){
      window.location.href = appdownurl+'?invitationCode='+getUrl(location.href).invitationCode
    }else{
      window.location.href = appdownurl
    }
  }
  // 如果是从分享链接进来的  sessionStorage保留标识 若 fromshare=1 则唤醒app或跳下载页面
  if(getUrl(location.href).share !== undefined){
    sessionStorage.fromshare = 1
  }
})
$(function() {
  

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

  // 下拉刷新成功事件
	function reloadinit(){
		querydata.page = 1
    search(querydata)
	}
	// 上拉加载成功事件
	const pullloadfun = ()=>{
    if(querydata.page <= (totalpages-1)){
      querydata.page++;
      search(querydata)
    }
	}
	// 下拉刷新、上拉加载初始化方法
  tianscrollinit(reloadinit,pullloadfun)
  
  if(!isWechat){
    // 顶部高度计算
    $('.find_input_box').css({
      height: ((92 + statusBarHeight) / 75).toFixed(4) + 'rem',
      'padding-top': (statusBarHeight / 75).toFixed(4) + 'rem'
    })
    
    $('.find_search_list_item').css(
      'height',
      '-webkit-calc(100vh - ' + ((92 + statusBarHeight) / 75).toFixed(4) + 'rem)'
    )
    $('.prolistOutC').css(
      'height',
      '-webkit-calc(100vh - ' + ((172 + statusBarHeight) / 75).toFixed(4) + 'rem)'
    )
    $('.noresult').css(
      'height',
      '-webkit-calc(100vh - ' + ((92 + statusBarHeight) / 75).toFixed(4) + 'rem)'
    )
    $('.navigation').css({
      height: ((90 + statusBarHeight) / 75).toFixed(4) + 'rem',
      'padding-top': (statusBarHeight / 75).toFixed(4) + 'rem'
    })
  }
  $('.find_input_box').css('visibility','visible');
  $('.navigation').css('visibility','visible');
  layoutId = getUrl(location.href).layoutId
  layoutName = decodeURI(getUrl(location.href).layoutName)

  if (layoutId === undefined) {
    // 搜索
    if (
      sessionStorage.searchName !== undefined &&
      sessionStorage.searchName !== ''
    ) {
      // 若sessionStorage存在缓存，则继续搜索之前搜索的内容
      $('.find_input_serch').val(sessionStorage.searchName)
      querydata = {
        searchName: ($('.find_input_serch').val()).trim(),
        searchType: 0,
        page: 1,
        pageSize: 10,
        senseType: 1
      }
      //回车执行查询
      search(querydata)
    } else {
      if (
        localStorage.token !== undefined &&
        localStorage.scMemId !== undefined
      ) {
        getSearchHistory()
      }
      $('.find_input_serch').focus()
      $('.find_input_serch').focus(function() {
        getSearchHistory()
      })
    }
  } else {
    // 分享出去的链接 顶部没有返回按钮
    if(getUrl(location.href).share){
      $('.navigation a').hide()
    }
    $('.navigation span').text(layoutName)
    $('.find_input_box').css('visibility', 'hidden')
    $('.navigation').show()
    // 栏目商品列表
    querydata.layoutId = Number(layoutId)
    search(querydata)
    // 商城_点击分类埋点
    categoryTracker(layoutName)
    console.log(localStorage.token !== undefined && localStorage.scMemId !== undefined && localStorage.token != "" && localStorage.scMemId !== "")
    if(localStorage.token !== undefined && localStorage.scMemId !== undefined && localStorage.token != "" && localStorage.scMemId !== ""){
      $('.find_input_serch').focus(function() {
        getSearchHistory()
      })
    }
  }

  $('.find_input_serch').click(function(){
    $('.find_input_serch').focus();
  })
  let menuliSel_index = '';
  // 筛选
  $('.menuUl li').click(function() {
    menuliSel_index = $(this).index();
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
            if (Number(querydata.searchType) === arr[i].searchType) {
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
        $('.find_seach_page').css({ height: '100vh', overflow: 'hidden' })
        $('.graymodel').show()
        $('.menuSonUl').show()
        break
      case 1:
        $('.menusel').removeClass('menusel')
        $(this).addClass('menusel')
        querydata.searchName = ($('.find_input_serch').val()).trim();
        querydata.searchType = $(this).attr('searchType')
        querydata.page = 1
        querydata.senseType = 1
        document.getElementsByClassName('content')[0].scrollTop = 0
        if (layoutId !== undefined || querydata.searchName !== '') {
          search(querydata)
        } else {
          layer.open({
            content: '请输入商品名称进行搜索！',
            skin: 'msg',
            time: 2 //2秒后自动关闭
          })
        }
        $('.menuUl li:eq(3)').html('价格<span class="ordersort">')
        $('.menuUl li:eq(0)').html('综合<span class="ordersort">')
        $('.graymodel').hide()
        $('.menuSonUl').hide()
        break
      case 2:
        $('.menusel').removeClass('menusel')
        $(this).addClass('menusel')
        querydata.searchName = ($('.find_input_serch').val()).trim();
        querydata.searchType = $(this).attr('searchType')
        querydata.page = 1
        querydata.senseType = 1
        document.getElementsByClassName('content')[0].scrollTop = 0
        if (layoutId !== undefined || querydata.searchName !== '') {
          search(querydata)
        } else {
          layer.open({
            content: '请输入商品名称进行搜索！',
            skin: 'msg',
            time: 2 //2秒后自动关闭
          })
        }
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
            if (Number(querydata.searchType) === arr[i].searchType) {
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
        $('.find_seach_page').css({ height: '100vh', overflow: 'hidden' })
        $('.graymodel').show()
        $('.menuSonUl').show()
        break
    }
  })
  // 排序选择
  $('.menuSonUl').delegate('li', 'click', function() {
    if(menuliSel_index === 0){
      $('.menuUl li:eq(3)').html('价格<span class="ordersort">')
    }else if(menuliSel_index === 3){
      $('.menuUl li:eq(0)').html('综合<span class="ordersort">')
    }
    $('.menusonSel').removeClass('menusonSel')
    $(this).addClass('menusonSel')
    //显示滚动条
    $('.find_seach_page').attr('style','');
    $('.graymodel').hide()
    $('.menuSonUl').hide()
    if ($('.menusel_re').index() === 0) {
      $('.menuUl li:eq(3)').html('价格<span class="ordersort">')
    } else if ($('.menusel_re').index() === 3) {
      $('.menuUl li:eq(0)').html('综合<span class="ordersort">')
    }
    $('.menusel_re').html($(this).text() + '<span class="ordersort">')
    querydata.searchName = ($('.find_input_serch').val()).trim();
    querydata.searchType = $(this).attr('searchType')
    querydata.page = 1
    querydata.senseType = 1
    document.getElementsByClassName('content')[0].scrollTop = 0
    if (layoutId !== undefined || querydata.searchName !== '') {
      search(querydata)
    } else {
      layer.open({
        content: '请输入商品名称进行搜索！',
        skin: 'msg',
        time: 2 //2秒后自动关闭
      })
    }
    $('.menusel').removeClass('menusel')
    $('.menusel_re').addClass('menusel')
  })
  // 模态框点击隐藏
  $('.graymodel').click(function() {
    //显示滚动条
    $('.find_seach_page').attr('style','');
    $('.graymodel').hide()
    $('.menuSonUl').hide()
  })

  // 搜索提交
  $('#search').bind('keypress', function(event) {
    if (event.keyCode == '13') {
      event.preventDefault();
      if (($('#search').val()).trim() === '') {
        layer.open({
          content: '请输入商品名称进行搜索！',
          skin: 'msg',
          time: 2 //2秒后自动关闭
        })
        return false
      }
      // 搜索埋点
      searchTracker($('#search').val())
      querydata.searchName = ($('#search').val()).trim()
      $('#search').blur()
      // 搜索时清空之前排序选项及选中效果及文字
      menulistrenew();
      //回车执行查询
      search(querydata)
    }
  })
  // 阻止表单的默认行为
  $('.find_seach_page').on('submit', 'form', function(event) {
    event.preventDefault()
  })
  // 商品添加
  $('.prolistC').delegate('.add', 'click', function(ev) {
    ev.preventDefault()
    // 若连接中带share 则唤醒或下载app
    if(getUrl(location.href).share !== undefined){
      if(isAndroid){
        wakeOrInstallApp()
      }else if (isiOS){
        fromShareFun()
      }
      return false
    }
    console.log(localStorage.token !== undefined && localStorage.scMemId !== undefined && localStorage.token !== "" && localStorage.scMemId !== "")
    if (localStorage.token !== undefined && localStorage.scMemId !== undefined && localStorage.token !== "" && localStorage.scMemId !== "") {
      
      // 加入购物车
      addtoShopCar($(this).attr('goodsid'))
    }else{
      if (isWechat) {
				location.href = h5loginurl
			} else if (isAndroid) {
        window.android.mustLogin()
      } else {
        // ios
        window.webkit.messageHandlers.mustLogin.postMessage(null)
      }
      return false
    }
    
  })

  // 搜索历史点击搜索
  $('.find_seach_content ul').delegate('li', 'click', function() {
    $('.find_input_serch').val($(this).text())
    querydata.searchName = $(this).text()
    menulistrenew();
    // bodyfontrep();
    //执行查询
    search(querydata)
  })

  // 删除历史记录
  $('#recorddel').click(function() {
    if ($('.find_seach_content ul li').length === 0) {
      layer.open({
        content: '您还没有任何搜索记录！',
        skin: 'msg',
        time: 2 //2秒后自动关闭
      })
      return false
    }
    tiansLayer({
      title:'提示',
      content: '是否确定删除查询历史？',
      btn: ['确定', '取消'],
      yes: function() {
        // 提示框关闭公共方法
        tiansLayerClose();
        var param = {
          url: 'get/shop/goods/deleteSearchHistory',
          type: '',
          data: {}
        }
        ajaxJS(
          param,
          res => {
            getSearchHistory()
            layer.open({
              title: [
                '提示',
                'background-color: #fff; color:#030303;border-bottom:1px solid #009943;'
              ],
              content: res.msg,
              btn: ['我知道了'],
              yes: function(index) {
                layer.closeAll()
              }
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
    })
  })

  /* URL中 type 
  1 广告位 右上角分享功能
  2 业态 不变
  3 活动 右上角分享 */
  if(getUrl(location.href).tType === '1' || getUrl(location.href).tType === '3'){
    $('.navigation .navright img').attr('src','../images/faxian_share.png')
    $('.navright2').show();
  }
  
  // 顶部右侧菜单事件
  /* URL中 type 
  1 广告位 右上角分享功能
  2 业态 不变
  3 活动 右上角分享 */
  $('.navright').click(function() {
    // 分享用的数据
    shareJson = {
      goodsId:'',
      title: ifnull(getUrl(location.href).layoutName),
      shareContent: ifnull(getUrl(location.href).layoutName),
      imageUrl: ifnull($('.prolistC ul li:eq(0)').find('.img img').attr('src')),
      url: ('https://'+window.location.host+location.pathname+'?layoutId='+getUrl(location.href).layoutId+'&layoutName='+getUrl(location.href).layoutName+'&type='+getUrl(location.href).type+'&fromshop=1&sharerId='+localStorage.scMemId+'&url='+'https://' + window.location.host + location.pathname),
      isShowQrCode: 0,
      shareAwardIntegral: ''
    }
    let type = getUrl(location.href).tType;
    if(type === '1' || type === '3'){
      // 未登录的跳登陆页
      if (localStorage.token === undefined || localStorage.scMemId === undefined) {
        if (isWechat) {
          location.href = h5loginurl
        } else if (isAndroid) {
          window.android.mustLogin()
        } else {
          // ios
          window.webkit.messageHandlers.mustLogin.postMessage(null)
        }
        return
      } else {
        // 分享
        if(isWechat){
          shareData();
        } else if (isAndroid) {
          window.android.onShareFromWeb(JSON.stringify(shareJson))
        } else {
          // ios
          window.webkit.messageHandlers.onShareFromWeb.postMessage(JSON.stringify(shareJson))
        }
      }
    }else{
      sessionStorage.removeItem('searchName')
      $('.navigation').hide()
      $('.find_input_box').css('visibility', 'visible')
    }
  })
  $('.navright2').click(function(){
    sessionStorage.removeItem('searchName')
    $('.navigation').hide()
    $('.find_input_box').css('visibility', 'visible')
  })



  // 定时下拉加载文字及小狮子页面加载一秒钟后显示
  setTimeout(() => {
    $('.top-tip').show()
  }, 1000);

})

// 排序选项及文字恢复
const menulistrenew = () => {
  querydata.page = 1;
  querydata.searchType = 1;
  $('.menusel').removeClass('menusel');
  $('.menusel_re').removeClass('menusel_re');
  $('.menuUl li:eq(3)').html('价格<span class="ordersort">')
  $('.menuUl li:eq(0)').html('综合<span class="ordersort">')
}

// 查询历史
const getSearchHistory = () => {
  var param = {
    url: 'get/shop/goods/getSearchHistory',
    type: '',
    data: {}
  }
  ajaxJS(
    param,
    res => {
      let arrlist = ''
      if (res.data.length !== 0) {
        $('.search_result').hide()
        for (let i in res.data) {
          arrlist += `<li seahis_id='${res.data[i].id}'>${
            res.data[i].searchKey
          }</li>`
        }
        $('.find_search_list').show();
      } else {
        // 没有搜索记录时，显示缺省页
        $('.find_search_list').hide()
        if($('#imgFix').attr('src') !== '../images/general_none1.png'){
          $('#imgFix').attr('src', '../images/general_none1.png')
        }
        $('.noresult').css('background', '#fff')
        $('.search_result').hide()
        $('.nthword').show()
        $('.noresult').show()
        $('.prolistOutC').hide()
      }
      $('.find_seach_content ul').html(arrlist)
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

function search(data) {
  let param = ''
  if (layoutId === undefined) {
    // 搜索
    param = {
      url: 'get/shop/goods/listGoodsBySearchCondition',
      type: '',
      data: data
    }
  } else {
    // 栏目商品列表
    param = {
      url: 'get/shop/index/getColumnGoods',
      type: '',
      data: data
    }
  }
  ajaxJS(param, res => {
    sessionStorage.searchName = data.searchName
    if (res.data === null || res.data.list === null) {
      totalpages = 0
    } else {
      totalpages = res.data.pages
    }
    let arr = ''
    if (res.data === null || res.data.list === null) {
      // 推荐隐藏
      $('.find_search_list').hide()
      $('.search_result').hide()
      if($('#imgFix').attr('src') !== '../images/general_none.png'){
        $('#imgFix').attr('src', '../images/general_none.png')
      }
      $('.noresult').css('background','#f2f2f2');
      $('.noresult').show()
      $('.prolistOutC').hide()
      $('.proOrdC').show()
    } else {
      for (let i in res.data.list) {
        arr += `
                <li class="opacity" goodsId='${res.data.list[i].goodsId}'>
                    <a href="./shop_detail.html?id=${res.data.list[i].goodsId}">
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
                                  res.data.list[i].integralPrice === 0 ||
                                  res.data.list[i].integralPrice === null
                                    ? ''
                                    : '<div class="search-discount">+积分:' +
                                      res.data.list[i].integralPrice +
                                      '</div>'
                                }
                                <div class="add" goodsId="${
                                  res.data.list[i].goodsId
                                }"><img  src="../images/main_add.png" alt=""></div>
                            </div>
                        </div>
                    </a>
                </li>
                `
      }
      // 推荐隐藏
      $('.find_search_list').hide()
      $('.search_result').show()
      $('.noresult').hide()
      $('.prolistOutC').show()
    }
    // 如果是第一页清空列表数据
    if (data.page === 1) {
      $('.prolistC ul').html('')
      $('.prolistC ul').html(arr)
    } else {
      $('.prolistC ul').append(arr)
    }
    Imglazy();
    // 下拉刷新成功回调
    tianscrolsuccFun()
  })
}

// 加入购物车
const addtoShopCar = goodsId => {
  var param = {
    url: 'get/shop/order/addToShoppingCart',
    type: '',
    data: {
      memId: memidGet(),
      number: 1,
      goodsId: goodsId
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

//搜索顶部排序
$(function() {
  var arr = [
    { name: '默认排序', searchType: 0 },
    { name: '价格从高到低', searchType: 1 },
    { name: '价格从低到高', searchType: 2 },
    { name: '新品优先', searchType: 4 }
  ]
  $('.search-top')
    .find('div')
    .click(function(e) {
      e.stopPropagation()
      $('.search-top')
        .find('div')
        .each(function(i, item) {
          $(item).removeClass('active')
        })
      $(this).addClass('active')
      if ($($(this).find('span')[0]).html() == '综合') {
        $('.search-content').show()
      } else if ($($(this).find('span')[0]).html() == '价格') {
        $('.search-content').show()
      } else {
        $('.search-content').hide()
      }
    })
})

// 返回之前页面
function goback(){
  if(layoutId !== undefined && $('.navigation').css('display') === 'none'){
    menulistrenew();
    $('.find_input_serch').val('');
    querydata.searchName = '';
    search(querydata);
    sessionStorage.removeItem('searchName')
    $('.navigation').show()
    $('.find_input_box').css('visibility', 'hidden')
  }else{
    $('.find_input_serch').val('')
    sessionStorage.removeItem('searchName')
    let type = getUrl(location.href).tType;
    if(type === '1' || type === '2' || type === '3'){
      if (isWechat) {
        window.location.href = h5pswurl+'/tiens-h5/html/home.html';
      } else if (isAndroid) {
        window.android.onClosePage()
      } else if (isiOS) {
        window.webkit.messageHandlers.onClosePage.postMessage(null)
      } else {
        window.history.go(-1)
      }
    }else{
      location.href = './home.html'
    }
  }
}

const ifnull = (val) => {
	return val === undefined || val === null ? '' : val
}

//openinstall初始化时将与openinstall服务器交互，应尽可能早的调用
/*web页面向app传递的json数据(json string/js Object)，应用被拉起或是首次安装时，通过相应的android/ios api可以获取此数据*/
var openappdata = OpenInstall.parseUrlParams();//openinstall.js中提供的工具函数，解析url中的所有查询参数
new OpenInstall({
    /*appKey必选参数，openinstall平台为每个应用分配的ID*/
    appKey : "qje2hg",
    /*可选参数，自定义android平台的apk下载文件名，只有apk在openinstall托管时才有效；个别andriod浏览器下载时，中文文件名显示乱码，请慎用中文文件名！*/
    //apkFileName : 'com.fm.openinstalldemo-v2.2.0.apk',
    /*可选参数，是否优先考虑拉起app，以牺牲下载体验为代价*/
    //preferWakeup:true,
    /*自定义遮罩的html*/
    //mask:function(){
    //  return "<div id='openinstall_shadow' style='position:fixed;left:0;top:0;background:rgba(0,255,0,0.5);filter:alpha(opacity=50);width:100%;height:100%;z-index:10000;'></div>"
    //},
    /*openinstall初始化完成的回调函数，可选*/
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
  // let downUrl = 'https://picture.tiens.com/tiens-h5/html/download.html'
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
