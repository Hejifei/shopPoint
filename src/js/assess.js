let orderNo = '';
let orderType = getUrl(location.href).orderType;
$(function() {
  if(!isWechat){
    $('.navigation').css({
      height: ((90 + statusBarHeight) / 75).toFixed(4) + 'rem',
      'padding-top': (statusBarHeight / 75).toFixed(4) + 'rem'
    })
    $('.order_content').css({
      'padding-top': ((90 + statusBarHeight) / 75).toFixed(4) + 'rem'
    })
  }
  $('.navigation').css('visibility','visible');

  orderNo = getUrl(location.href).orderNo
  getOrderDetail()

  // 好评差评选择
  $('.prolist').delegate('.assessline a', 'click', function() {
    $(this)
      .parent('.assessline')
      .find('.assessactive')
      .removeClass('assessactive')
    $(this).addClass('assessactive')
  })
  // 发表评价
  $('.assessSubC a').click(function() {
    $('.required').each(function() {
      if ($(this).val().trim() === '') {
        tiansLayer({
          title:'提示',
          content:'请输入商品评论！',
          btn: ['我知道了'],
          yes: function() {
            // 提示框关闭公共方法
            tiansLayerClose();
          }
        })
        throw ''
      }
    })
    $('.required').each(function() {
      if ($(this).val().trim().length > 100) {
        tiansLayer({
          title:'提示',
          content:'商品评论不超过100个字！',
          btn: ['我知道了'],
          yes: function() {
            // 提示框关闭公共方法
            tiansLayerClose();
          }
        })
        throw ''
      }
    })
    $('.assessline').each(function() {
      if (!$(this).find('.assessactive').length > 0) {
        tiansLayer({
          title:'提示',
          content:'请选择评价！',
          btn: ['我知道了'],
          yes: function() {
            // 提示框关闭公共方法
            tiansLayerClose();
          }
        })
        throw ''
      }
    })

    let commentlist = []
    $('.prolist .prolist_son').each(function() {
      commentlist.push({
        subOrderNo: $(this)
          .find('textarea')
          .attr('subOrderNo'),
        level: $(this)
          .find('.assessactive')
          .attr('level'),
        evaluate: $(this)
          .find('textarea')
          .val().trim(),
        productName: $(this)
          .find('textarea')
          .attr('productName'),
        orderNo: orderNo,
        goodsId: $(this)
          .find('textarea')
          .attr('goodsId'),
        goodsName: $(this)
          .find('textarea')
          .attr('goodsName')
      })
    })
    var param = {
      url: 'get/shop/order/comment',
      type: '',
      data: commentlist
    }
    ajaxJS(
      param,
      res => {
        if (res.code === '0') {
          // 埋点商城_商品评价
          for (let i in commentlist) {
            productevaluateTracker(
              '',
              '',
              '',
              '',
              commentlist[i].goodsId,
              commentlist[i].goodsName,
              commentlist[i].level === '1' ? 1 : 5
            )
          }
          tiansLayer({
            title:'提示',
            content:'你已经成功评价商品，记得追评哦！',
            btn: ['返回'],
            yes: function() {
              // 提示框关闭公共方法
              tiansLayerClose();
              location.href = `./order_detail.html?orderNo=${orderNo}${orderType === '5' ? '&orderType=5' : ''}`
            }
          })
        } else {
          layer.open({
            content: res.msg,
            skin: 'msg',
            time: 2 //2秒后自动关闭
          })
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
  })
  
  
})

const getOrderDetail = () => {
  var param = {
    url: 'get/shop/order/getOrderDetail',
    type: '',
    data: {
      orderNo: orderNo
    }
  }
  if (orderType !== undefined) {
    param.data.ordertype = 5
    param.data.subOrderNo = getUrl(location.href).subOrderNo
    param.url = 'get/shop/order/getAfterServiceOrderDetail'
  }
  ajaxJS(
    param,
    res => {
      let assessarr = ''
      for (let i in res.data.product) {
        assessarr += `
            <div class="prolist_son">
                <a class="commodity" href="./shop_detail.html?id=${
                  res.data.product[i].goodsId
                }">
                    <div class="img"><img src="${
                      res.data.product[i].goodsImageUrl === ''
                        ? '../images/shop_nopic.png'
                        : res.data.product[i].goodsImageUrl
                    }" alt=""></div>
                    <div class="detail">
                        <div class="title">${
                          res.data.product[i].goodsName
                        }</div>
                        <div class="describe">${
                          res.data.product[i].productName
                        }</div>
                        <div class="prices">
                            <div><span class="price">¥ ${
                              res.data.product[i].currentPrice
                            }</span>
                            ${
                              res.data.product[i].integral === 0
                                ? ''
                                : '<span class="score">+' +
                                  res.data.product[i].integral +
                                  '积分</span>'
                            }
                            <strike class="oldPrice">¥ ${
                              res.data.product[i].originalPrice
                            }</strike></div>
                            <span class="num"><span>x</span><span>${
                              res.data.product[i].number
                            }</span></span>
                        </div>
                    </div>
                </a>
                <textarea 
                    subOrderNo='${res.data.product[i].subOrderNo}'
                    productName='${res.data.product[i].productName}'
                    goodsId='${res.data.product[i].goodsId}'
                    goodsName='${res.data.product[i].goodsName}'
                    class="required evaluate" placeholder="聊一聊这次购买的感受吧"></textarea>
                <div class="assessline">
                    <a style="border: 1px solid #009943" level='0'><img src="../images/shop_hp.png"/>赏好评</a>
                    <a style="border: 1px solid #009943" level='1'><img src="../images/shop_cp.png"/>给差评</a>
                </div>
            </div>
            `
      }
      $('.prolist').html(assessarr)
      // Imglazy();
      $('textarea').focus(function(){
        document.getElementsByTagName('body')[0].scrollTop = 0
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

// 懒加载设置
const Imglazy = () => {
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
  })
}

var winHeight = $(window).height() //获取当前页面高度
$(window).resize(function() {
  var thisHeight = $(this).height()
  if (winHeight - thisHeight > 50) {
    //当软键盘弹出，在这里面操作
    $('.assessSubC').hide()
  } else {
    //当软键盘收起，在此处操作
    $('.assessSubC').show()
  }
})
