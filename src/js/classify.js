let queryData = {
  categoryId: '',
  page: 1,
  pageSize: 10
}
let Goodslist = ''

$(function () {

	// 上拉加载成功事件
	const pullloadfun = ()=>{
    if(queryData.page <= (totalpages-1)){
      queryData.page++
      getGoodsByTypeId(queryData)
    }
	}
	// 下拉刷新、上拉加载初始化方法
	tianscrollinit('',pullloadfun)


  if(!isWechat){
    // 顶部高度计算
    $('.home_top').css({
      height: ((90 + statusBarHeight) / 75).toFixed(4) + 'rem',
      'padding-top': (statusBarHeight / 75).toFixed(4) + 'rem'
    })
    $('.classify_content').css({
      'padding-top': ((90 + statusBarHeight) / 75).toFixed(4) + 'rem'
    })
  }
  $('.classify_box').css('visibility', 'visible');
  // 二级菜单的子菜单的选中
  $('.classify_two').delegate('.menuSec .menuSec_son li', 'click', function () {
    $(this)
      .siblings('.menuSec_sonactive')
      .removeClass('menuSec_sonactive')
    $(this).addClass('menuSec_sonactive')
    queryData.categoryId = $(this).attr('typeId')
    queryData.page = 1
    $('.menutitle').html(
      `${$(this).text()}<img  src="../images/general_xiala.png"/>`
    )
    $('.menuSec_son').hide()
    getGoodsByTypeId(queryData)

  })

  // 商品添加
  $('.commodity').delegate('.add', 'click', function (ev) {
    ev.preventDefault()
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
    // 加入购物车
    addtoShopCar($(this).attr('goodsid'))
  })

  // 获取商品分类列表
  listGoodsType()
  // 左侧菜单选中效果
  $('.classify_one ul').delegate('li', 'click', function () {
    $('.menuSec_son').hide()
    $('.active').removeClass('active')
    $('.nomore').hide()
    $(this).addClass('active')
    let parentid = Number($(this).attr('typeId'))
    let menuseclist = Goodslist.filter(val => {
      if (val.id === parentid) {
        return val
      }
    })

    let menulistson = ''
    if (menuseclist[0].children.length > 0) {
      for (let j in menuseclist[0].children) {
        menulistson += `<li class='${
          j === '0' ? 'menuSec_sonactive' : ''
          }' typeId='${menuseclist[0].children[j].id}' >${
          menuseclist[0].children[j].typeName
          }</li>`
      }
      queryData.categoryId = menuseclist[0].children[0].id
      queryData.page = 1
      getGoodsByTypeId(queryData)
    } else {
      $('.commodity ul').html('')
      $('.commodity ul').html('<div class="nogoods">该分类下暂无商品</div>')
    }
    // 左侧菜单
    // 左侧第一菜单的二级菜单选项
    // 没有图片时隐藏顶部
    if (menuseclist[0].pic === '') {
      $('.adv_img').hide();
    } else {
      $('.adv_img img').attr('src', menuseclist[0].pic)
      $('.adv_img').attr('atype', menuseclist[0].type)
      $('.adv_img img').error(function(){
        $('.adv_img img').attr('src','../images/depic_main1@2x.png')
      })
    }

    let externalUrl = ''
    if (menuseclist[0].goodsUrl !== '' && menuseclist[0].goodsUrl !== null) {
      if (menuseclist[0].goodsUrl.substr(0, 4).toLowerCase() != 'http') {
        externalUrl = 'https://' + menuseclist[0].goodsUrl
      } else {
        externalUrl = menuseclist[0].goodsUrl
      }
    }
    $('.adv_img').attr('externalUrl', externalUrl)
    $('.adv_img').attr('layoutName',menuseclist[0].typeName)
    $('.menuSec_son').html(menulistson)
    if(menuseclist[0].children.length > 0){
      $('.menutitle').html(
        `${menuseclist[0].children[0].typeName}<img  src="../images/general_xiala.png"/>`
      )
    }else{
      $('.menutitle').html('')
    }
    
    // 使得右侧产品列表回到顶部
    document.getElementsByClassName('content')[0].scrollTop = 0
    $('.classify_two').addClass('opacity');
  })
  $('.menutitle').click(function () {
    if ($('.menuSec_son').is(':visible')) {
      $('.menuSec_son').hide()
    } else {
      $('.menuSec_son').show()
    }
  })

  // 链接类型,是否是外部 0否 1是
  $('.adv_img').click(function () {
    if ($(this).attr('atype') === '0' && $(this).attr('externalUrl') !== '') {
      // 内部链接
      // window.location.href = $(this).attr('externalUrl');
    } else if (
      $(this).attr('atype') === '1' &&
      $(this).attr('externalUrl') !== ''
    ) {
      // 外部链接
      if (
        $(this)
          .attr('externalUrl')
          .indexOf('/html/search.html?layoutId=') !== -1
      ) {
        // 内部链接
        let layoutId = getUrl($(this).attr('externalUrl')).layoutId
        let layoutName = getUrl($(this).attr('externalUrl')).layoutName
        location.href = `./search.html?layoutId=${layoutId}&layoutName=${layoutName}`
      } else {
        //外部链接
        sessionStorage.setItem('newurl', $(this).attr('externalUrl'))
        sessionStorage.setItem('newurlname', $(this).attr('layoutName'))
        location.href = './shopnweUrl.html'
      }
    }
  })
})

// 商品分类列表
function listGoodsType() {
  var param = {
    url: 'get/shop/order/listGoodsType',
    type: '',
    data: {}
  }
  ajaxJS(
    param,
    res => {
      Goodslist = res.data
      if (res.data.length > 0) {
        let arr = ''
        for (let i in res.data) {
          arr += `
                <li  class="opacity ${i === '0' ? 'active' : ''}" typeId='${
            res.data[i].id
            }'>
                    <div class="item_one">
                        <div class="bar"></div>
                        <span>${res.data[i].typeName}</span>
                    </div>
                </li>
                `
        }
        let menulistson = ''
        if (res.data[0].children.length > 0) {
          for (let j in res.data[0].children) {
            menulistson += `<li class="${
              j === '0' ? 'menuSec_sonactive' : ''
              }" typeId='${res.data[0].children[j].id}' >${
              res.data[0].children[j].typeName
              }</li>`
          }
        }
        // 左侧菜单
        $('.classify_one ul')
          .html('')
          .html(arr)
        // 左侧第一菜单的二级菜单选项
        $('.menuSec_son').html(menulistson)
        // 没有图片时隐藏顶部
        if (res.data[0].pic === '') {
          $('.adv_img').hide();
        } else {
          $('.adv_img img').attr('src', res.data[0].pic)
          $('.adv_img img').error(function(){
            $('.adv_img img').attr('src','../images/depic_main1@2x.png')
          })
        }
        // 链接类型,是否是外部 0否 1是
        $('.adv_img').attr('atype', res.data[0].type)
        let externalUrl = ''
        if (res.data[0].goodsUrl !== '' && res.data[0].goodsUrl !== null) {
          if (res.data[0].goodsUrl.substr(0, 4).toLowerCase() != 'http') {
            externalUrl = 'https://' + res.data[0].goodsUrl
          } else {
            externalUrl = res.data[0].goodsUrl
          }
        }
        $('.adv_img').attr('externalUrl', externalUrl)
        $('.adv_img').addClass('opacity');
        $('.adv_img').attr('layoutName',res.data[0].typeName)

        $('.menutitle').html(
          `${
          res.data[0].children[0].typeName
          }<img src="../images/general_xiala.png"/>`
        )
        $('.menutitle').addClass('opacity');
        queryData.categoryId = res.data[0].children[0].id
        getGoodsByTypeId(queryData)
      }
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

// 获取类别商品
function getGoodsByTypeId(querydata) {
  var param = {
    url: 'get/shop/order/getGoodsByTypeId',
    type: '',
    data: querydata
  }
  ajaxJS(
    param,
    res => {
      let arr = ''
      if (res.data !== null) {
        totalpages = res.data.pages
      } else {
        totalpages = 0;
      }


      if (res.data !== null && res.data.list !== null) {
        for (let i in res.data.list) {
          arr += `
                <li class="opacity">
                    <a href="./shop_detail.html?id=${res.data.list[i].id}">
                        <div class="imgs">
                            <img  class="lazy" data-original="${
            res.data.list[i].goodsImageUrl
            }" alt="">
                        </div>
                        <div class="detail">
                            <div class="title">${
            res.data.list[i].goodsName
            }</div>
                            <div class="introduce">${
            res.data.list[i].introduce
            }</div>
                            <div class="oldPrice">¥ ${
            res.data.list[i].originalPrice
            }</div>
                            <div class="more">
                                <div class="price">¥ ${
            res.data.list[i].showPrice
            }</div>
                                <div class="discount">${
            res.data.list[i].integralAmount === 0 ||
              res.data.list[i].integralAmount === null
              ? ''
              : '+积分:'+res.data.list[i].integralAmount 
            }</div>
                                <div class="add" goodsId='${
            res.data.list[i].id
            }'><img  src="../images/main_add.png" alt=""></div>
                            </div>
                        </div>
                    </a>
                </li>
                `
        }
      } else {
        arr += '<div class="nogoods">该分类下暂无商品</div>'
      }
      if (querydata.page === 1) {
        $('.commodity ul').html(arr)
      } else {
        $('.commodity ul').append(arr)
      }

      Imglazy();
      tianscrolsuccFun();
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

const Imglazy = () => {
  $("img.lazy").lazyload({
    placeholder: "../images/shop_nopic.png", //用图片提前占位
    // placeholder,值为某一图片路径.此图片用来占据将要加载的图片的位置,待图片加载时,占位图则会隐藏
    effect: "fadeIn", // 载入使用何种效果
    // effect(特效),值有show(直接显示),fadeIn(淡入),slideDown(下拉)等,常用fadeIn
    threshold: 20, // 提前开始加载
    // threshold,值为数字,代表页面高度.如设置为200,表示滚动条在离目标位置还有200的高度时就开始加载图片,可以做到不让用户察觉
    // event: 'sporty',  // 事件触发时才加载
    // event,值有click(点击),mouseover(鼠标划过),sporty(运动的),foobar(…).可以实现鼠标莫过或点击图片才开始加载,后两个值未测试…
    container: $(".content >div"),  // 对某容器中的图片实现效果
    // container,值为某容器.lazyload默认在拉动浏览器滚动条时生效,这个参数可以让你在拉动某DIV的滚动条时依次加载其中的图片
    failurelimit: 20,// 图片排序混乱时
    // failurelimit,值为数字.lazyload默认在找到第一张不在可见区域里的图片时则不再继续加载,但当HTML容器混乱的时候可能出现可见区域内图片并没加载出来的情况,failurelimit意在加载N张可见区域外的图片,以避免出现这个问题.
    skip_invisible: false,
  });
}
