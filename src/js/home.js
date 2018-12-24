var tagg = true
var hight = $('.search_top').height()
var u = navigator.userAgent
var isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1 //android终端
var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/) //ios终端

var totalpages = 1
var loading = false

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
		indexInfoGet();
	}
	// 下拉刷新、上拉加载初始化方法
	tianscrollinit(reloadinit,'')

	if(!isWechat){
		$('.HomeBox').css({
			'padding-top': ((88 + statusBarHeight) / 75).toFixed(4) + 'rem',
		})
		// 顶部高度计算
		$('.search_top').css({
			height: ((88 + statusBarHeight) / 75).toFixed(4) + 'rem',
			'padding-top': (statusBarHeight / 75).toFixed(4) + 'rem'
		})
		
	}
	$('.search_top').css('visibility', 'visible')
	// 定时下拉加载文字及小狮子页面加载一秒钟后显示
	setTimeout(() => {
		$('.top-tip').show()
	}, 1000)

	// 进入商城埋点
	shopEnterTracker()
	// 点击广告位埋点
	$('.indexContent').delegate('.home_swiper .swiper-slide', 'click', function() {
		adbannerTracker('首页banner', '', '', $(this).find('img').attr('src'))
	})
	$('.indexContent').delegate('.home_ad', 'click', function() {
		adbannerTracker('首页中间banner', '', '', $(this).find('img').attr('src'))
	})
	// 点击猜你喜欢
	$('.indexContent').delegate('.home_content_content li a', 'click', function() {
		recommendationTracker($(this).find('.add').attr('goodsId'), $(this).find('.title').text(), '', '', '')
	})

	//首页渲染
	indexInfoGet()
	$('.home_back').click(function() {
		if (isWechat) {
			// window.history.go(-1)
			window.location.href = h5pswurl+'/tiens-h5/html/home.html';
		} else if (isAndroid) {
			window.android.onClosePage()
		} else if (isiOS) {
			window.webkit.messageHandlers.onClosePage.postMessage(null)
		} else {
			window.history.go(-1)
		}
	})

	// 顶部搜索事件绑定
	$('.home_seach .plachehold').click(() => {
		window.location.href = 'search.html'
	})
	$('#searchipt').focus(function() {
		window.location.href = 'search.html'
	})
	// $("img").lazyload();

	// 加入购物车
	$('.HomeBox').delegate('.add', 'click', function(ev) {
		ev.preventDefault()
		if (localStorage.token === undefined || localStorage.scMemId === undefined) {
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
		// 加入购物车
		addtoShopCar($(this).attr('goodsid'))
	})

	$('.HomeBox').delegate('.newdir_href', 'click', function() {
		if($(this).attr('externalUrl')){
			if($(this).attr('externalUrl').indexOf('?') === -1){
				location.href = $(this).attr('externalUrl')+'?frompoint=1'
			}else{
				location.href = $(this).attr('externalUrl')+'&frompoint=1'
			}
		}
	})
})

function indexInfoGet() {
	var param = {
		url: 'get/shop/index/getIndexInfo',
		type: '',
		data: {}
	}
	ajaxJS(
		param,
		(res) => {
			$('.indexContent').html('')
			for (let i in res.data) {
				if (res.data[i].moduleType === 1) {
					// 图片单图
					justImg(res.data[i].layoutInfo)
				} else if (res.data[i].moduleType === 2) {
					// 轮播
					getswiper(res.data[i].layoutInfo)
				} else if (res.data[i].moduleType === 3) {
					// 2*5图文栏目
					column(res.data[i].layoutInfo)
				} else if (res.data[i].moduleType === 5) {
					// 横向滚动商品
					getswiper3(res.data[i].layoutInfo)
				} else if (res.data[i].moduleType === 4) {
					// 2*N竖向商品
					guess(res.data[i].layoutInfo)
				}
			}
			$('.indexContent').append(`<div class="nomore homenomore"><span>没有更多内容了</span></div>`)
			// 关闭上拉加载功能
			tianscrolCloseup()
			// 下拉刷新成功回调
			tianscrolsuccFun()
			
			Imglazy()
			setTimeout(() => {
				$('.homeModel').hide()
			}, 500);
		},
		(error) => {
			layer.open({
				content: error.msg,
				skin: 'msg',
				time: 2 //2秒后自动关闭
			})
		}
	)
}

//轮播广告
function getswiper(data) {
	let arr = ''
	for (let i = 0; i < data.length; i++) {
		let externalUrl = ''
		if (data[i].externalUrl !== '' && data[i].externalUrl !== null) {
			if (data[i].externalUrl.substr(0, 4).toLowerCase() != 'http') {
				externalUrl = 'https://' + data[i].externalUrl
			} else {
				externalUrl = data[i].externalUrl
			}
		}
		arr += `
            <div class="swiper-slide">
                <a href="${data[i].type === 3 ? './shop_detail.html?id=' + data[i].goodsId : 'javascript:void(0);'}"
                    atype="${data[i].type}" layoutName='${data[i].layoutName}'   class="newdir_href"    externalUrl="${data[i].type !== 3 &&
		data[i].externalUrl !== ''
			? externalUrl
			: ''}" >
                    <img src="${data[i].layoutImgUrl}" >
                </a>
            </div>
        `
	}
	$('.indexContent').append(`
          <div class="home_swiper opacity">
             <div class="swiper-container swiper-container1">
                 <div class="swiper-wrapper  swiper-container1">
                      ${arr}
                 </div>
                 <div class="swiper-pagination"></div>
             </div>
         </div>
      `)
	var mySwiper = new Swiper('.home_swiper .swiper-container', {
		autoplay: 5000, //可选选项，自动滑动
		speed: 300,
		pagination: '.swiper-pagination',
		loop: true,
		loopFillGroupWithBlank: true
		//   lazyLoading: true,
	})
}

// 图片单图
function justImg(data) {
	let externalUrl = ''
	if (data[0].externalUrl !== '' && data[0].externalUrl !== null) {
		if (data[0].externalUrl.substr(0, 4).toLowerCase() != 'http') {
			externalUrl = 'https://' + data[0].externalUrl
		} else {
			externalUrl = data[0].externalUrl
		}
	}
	$('.indexContent').append(`
        <div class="home_ad opacity">
            <a href="${data[0].type === 3 ? './shop_detail.html?id=' + data[0].goodsId : 'javascript:void(0);'}"
                    atype="${data[0].type}"    class="newdir_href"    externalUrl="${data[0].type !== 3 &&
	data[0].externalUrl !== ''
		? externalUrl
		: ''}" >
                <img class="lazy" data-original="${data[0].layoutImgUrl}" alt="">
            </a>
       </div>
    `)
}

//分类
function column(data) {
	let twlm1 = ''
	let twlm2 = ''
	for (let j = 0; j < data.length; j++) {
		let externalUrl = ''
		if (data[j].externalUrl !== '' && data[j].externalUrl !== null) {
			if (data[j].externalUrl.substr(0, 4).toLowerCase() != 'http') {
				externalUrl = 'https://' + data[j].externalUrl
			} else {
				externalUrl = data[j].externalUrl
			}
		}
		let columnarr = `
        <div class="typebox">
            <a href="${data[j].type === 3
				? './search.html?layoutId=' + data[j].layoutId + '&layoutName=' + data[j].layoutName
				: 'javascript:void(0);'}"
                    atype="${data[j].type}"  layoutName='${data[j].layoutName}'  class="newdir_href"    externalUrl="${data[j].type !== 3 &&
		data[j].externalUrl !== ''
			? externalUrl
			: ''}" >
                <img class="lazy" data-original="${data[j].layoutImgUrl}"/>
            </a>
        </div>
        `
		if (j < 5) {
			twlm1 += columnarr
		} else {
			twlm2 += columnarr
		}
	}
	$('.indexContent').append(`
        <div class="home_column opacity">
            <div class="typesline">${twlm1}</div>
            <div class="typesline">${twlm2}</div>
        </div>
	`)
}
// 横向滚动商品
function getswiper3(data) {
	let arr = ''
	for (let j in data) {
		let externalUrl = ''
		if (data[j].externalUrl !== '' && data[j].externalUrl !== null) {
			if (data[j].externalUrl.substr(0, 4).toLowerCase() != 'http') {
				externalUrl = 'https://' + data[j].externalUrl
			} else {
				externalUrl = data[j].externalUrl
			}
		}
		arr += `
            <div class="swiper-slide">
                <a href="${data[j].type === 3 ? './shop_detail.html?id=' + data[j].goodsId : 'javascript:void(0);'}"
                    atype="${data[j].type}"  layoutName='${data[j].layoutName}'   class="newdir_href"    externalUrl="${data[j].type !== 3 &&
		data[j].externalUrl !== ''
			? externalUrl
			: ''}" >
                    <img src="${data[j].layoutImgUrl}" alt="">
                    <div class="title">${data[j].goodsName}</div>
                    <div class="parce">¥ ${data[j].goodsPrice}</div>
                    ${data[j].integralPrice === 0 || data[j].integralPrice === null
						? ''
						: '<div class="discount">+积分:' + data[j].integralPrice + '</div>'}
                    
                </a>
            </div>
        `
	}
	$('.indexContent').append(`
    <div class="home_content opacity">
        <div class="home_content_con">
            
            <div class="">
                <div class="swiper-container3 ${data.length < 4 ? 'swiper-no-swiping' : ''}">
                    <div class="swiper-wrapper">
                          ${arr}
                    </div>
                    <div class="swiper-pagination"></div>
                </div>
            </div>
        </div>
    </div>
    `)
	var swiper3 = new Swiper('.swiper-container3', {
		slidesPerView: data.length < 4 ? data.length : 3.5,
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
	})
}

// 猜你喜欢
function guess(data) {
	let arr = ''
	for (let j in data) {
		let externalUrl = ''
		if (data[j].externalUrl !== '' && data[j].externalUrl !== null) {
			if (data[j].externalUrl.substr(0, 4).toLowerCase() != 'http') {
				externalUrl = 'https://' + data[j].externalUrl
			} else {
				externalUrl = data[j].externalUrl
			}
		}
		// 商品才可以加入购物车
		arr += `
        <li>
            <a href="${data[j].type === 3 ? './shop_detail.html?id=' + data[j].goodsId : 'javascript:void(0);'}"
                    atype="${data[j].type}"   layoutName='${data[j].layoutName}'  class="newdir_href"    externalUrl="${data[j].type !== 3 &&
		data[j].externalUrl !== ''
			? externalUrl
			: ''}" >
                <div class="img">
                    <div><img  class="lazy" data-original="${data[j].layoutImgUrl}"></div>
                </div>
                <div class="detail">
                    <div class="title">${data[j].goodsName}</div>
                    <div class="more">
                        <div class="price">¥ ${data[j].goodsPrice}</div>
                        ${data[j].integralPrice !== 0 && data[j].integralPrice !== null
							? '<div class="discount">+积分 ' + data[j].integralPrice + '</div>'
							: ''}
                        ${data[j].type === 3
							? '<div class="add" goodsId="' +
								data[j].goodsId +
								'"><img src="../images/main_add.png" alt=""></div>'
							: ''}
                    </div>
                </div>
            </a>
        </li>
        `
	}

	$('.indexContent').append(`
    <div class="home_content opacity">
        <div class="home_content_con">
            
            <div class="home_content_content guess">
                <ul>${arr}</ul>
            </div>
        </div>
    </div>
    `)
}

// 加入购物车
const addtoShopCar = (goodsId) => {
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
		(res) => {
			layer.open({
				content: res.msg,
				skin: 'msg',
				time: 2 //2秒后自动关闭
			})
		},
		(error) => {
			layer.open({
				content: error.msg,
				skin: 'msg',
				time: 2 //2秒后自动关闭
			})
		}
	)
}

const Imglazy = () => {
	$('img.lazy').lazyload({
		placeholder: '../images/shop_nopic.png', //用图片提前占位
		// placeholder,值为某一图片路径.此图片用来占据将要加载的图片的位置,待图片加载时,占位图则会隐藏
		effect: 'fadeIn', // 载入使用何种效果
		// effect(特效),值有show(直接显示),fadeIn(淡入),slideDown(下拉)等,常用fadeIn
		threshold: 20, // 提前开始加载
		// threshold,值为数字,代表页面高度.如设置为200,表示滚动条在离目标位置还有200的高度时就开始加载图片,可以做到不让用户察觉
		// event: 'sporty',  // 事件触发时才加载
		// event,值有click(点击),mouseover(鼠标划过),sporty(运动的),foobar(…).可以实现鼠标莫过或点击图片才开始加载,后两个值未测试…
		container: $('.content >div'), // 对某容器中的图片实现效果
		// container,值为某容器.lazyload默认在拉动浏览器滚动条时生效,这个参数可以让你在拉动某DIV的滚动条时依次加载其中的图片
		failurelimit: 10, // 图片排序混乱时
		// failurelimit,值为数字.lazyload默认在找到第一张不在可见区域里的图片时则不再继续加载,但当HTML容器混乱的时候可能出现可见区域内图片并没加载出来的情况,failurelimit意在加载N张可见区域外的图片,以避免出现这个问题.
		skip_invisible: false
	})
}

