let balancelist = ''
let addinfo = ''
let proinfo = ''
let orderSumType = '' //1 购物车下单  2、立即购买
let addressid = '' //若指定地址 就用指定的地址 否则用默认地址
let postType = [] //快递方式list
let proPostType = '' //快递方式
let freight_type0 = '' //快递费
let thisorderAllpm = 0 //该订单总的快递费
var submiting = false;

$(function() {
  if(!isWechat){
    // 顶部高度计算
    $('.navigation').css({
      height: ((90 + statusBarHeight) / 75).toFixed(4) + 'rem',
      'padding-top': (statusBarHeight / 75).toFixed(4) + 'rem'
    })
    $('.order_content').css({
      'padding-top': ((90 + statusBarHeight) / 75).toFixed(4) + 'rem'
    })
  }
  $('.navigation').css('visibility','visible');
  $('.order_content').css('visibility','visible');

  orderSumType = getUrl(location.href).orderSumType
  addressid = getUrl(location.href).addressid

  if (orderSumType === '2') {
    // 商品详情立即购买过来
    proinfo = JSON.parse(sessionStorage.proInfo)
    Promise.all([buynowInfo(proinfo), listAddressInfo()])
      .then(function() {
        $('.address').css('visibility','visible');
        $('.shopprolist .shop_pro').each(function() {
          if (
            $(this)
              .find('.pass_way')
              .attr('deliverymethod') === '0'
          ) {
            postMoneyCount(
              $(this)
                .find('.pass_way')
                .attr('shopproc'),
              $(this).find('.pass_way')
            )
          } else {
            $(this)
              .find('.pass_way')
              .attr('postagecount', 0)
          }
        })
        setTimeout(() => {
          shopcarMoneysum()
        }, 300)
      })
      .catch(() => {
        $('.address').css('visibility','visible');
        shopcarMoneysum()
      })
  } else {
    // 购物车过来
    balancelist = getUrl(location.href).balancelist.split(',')
    // 获取地址列表，购物车列表，判定配送方式是否显示，快递费计算,计算总金额
    Promise.all([listAddressInfo(), shopcarlistGet()])
      .then(function() {
        $('.address').css('visibility','visible');
        $('.shopprolist .shop_pro').each(function() {
          if ($(this).find('.goodsMan').length === 0) {
            $(this).remove()
          } else {
            if (
              $(this)
                .find('.pass_way')
                .attr('deliverymethod') === '0'
            ) {
              postMoneyCount(
                $(this)
                  .find('.pass_way')
                  .attr('shopproc'),
                $(this).find('.pass_way')
              )
            } else {
              $(this)
                .find('.pass_way')
                .attr('postagecount', 0)
            }
          }
        })
        setTimeout(() => {
          $('.shopprolist .shop_pro').each(function() {
            if ($(this).find('.goodsMan').length === 0) {
              $(this).remove()
            }
          })
          shopcarMoneysum()
        }, 300)
      })
      .catch(() => {
        $('.address').css('visibility','visible');
        setTimeout(() => {
          $('.shopprolist .shop_pro').each(function() {
            if ($(this).find('.goodsMan').length === 0) {
              $(this).remove()
            }
          })
          shopcarMoneysum()
        }, 300)
      })
  }

  // 配送方式
  $('.shopprolist').delegate('.pass_way', 'click', function(el) {
    if ($(this).attr('deliverymethod') === '3') {
      shipMethod($(this),$(this).attr('delmetsel'),$(this).attr('postagecount'))
    }
  })
  $('body').delegate('.shipselC .row', 'click', function() {
    $('.checkseled').removeClass('checkseled')
    $(this)
      .find('.ifcheck')
      .addClass('checkseled')
  })

  // 收货地址修改
  $('.address a').click(function() {
    location.href =
      './address_list.html?balancelist=' +
      getUrl(location.href).balancelist +
      '&orderSumType=' +
      orderSumType
  })
})

// 配送方式
const shipMethod = (el, valsel, postPrice) => {
  console.log('弹框出现')
  if (addinfo === '') {
    layer.open({
      content: '请先选择收货地址！',
      skin: 'msg',
      time: 2 //2秒后自动关闭
    })
  } else {
    layer.open({
      type: 1,
      content: `
            <div class='shipmetC'>
                <div class='title'>配送方式</div>
                <div class='shipselC'>
                    <label class='row'><div>快递</div><div class='ifcheck checksel ${
                      valsel === '0' ? 'checkseled' : ''
                    }'  value='0'><input type='radio' name='shiptype' value='0' ${
        valsel === '0' ? 'checked' : ''
      }/></div></label>
                    <label class='row'><div>自提</div><div class='ifcheck checksel ${
                      valsel === '1' ? 'checkseled' : ''
                    }'  value='1'><input type='radio' name='shiptype' value='1' ${
        valsel === '1' ? 'checked' : ''
      }/></div></label>
                </div>
                <div class='shipSubC'>
                    <a>确认</a>
                </div>
            </div>
            `,
      anim: 'up',
      style:
        'position:fixed; bottom:0; left:0; width: 100%; padding:0.266667rem 0; border:none;'
    })
    $('.layui-m-layercont').addClass('layernormal')
    $('.shipSubC').click(function() {
      if ($('.shipselC .checkseled').length > 0) {
        proPostType = $('.shipselC .checkseled').attr('value')
        el.attr('delmetsel', proPostType)
        el.find('.way').html(
          `${proPostType === '0' ? '快递' : '自提'}<img src="../images/general_next.png" alt="">`
        )
        layer.closeAll()
        if (proPostType === '0') {
          postMoneyCount( el.attr('shopproc'), el, 1)
          $('.address').show();
          el.siblings('.getshop').hide();
          el.siblings('.timepicker').hide();
        } else {
          el.attr('cansel','')
          let ifCanBuy = true;
          $('.shopprolist .shop_pro').each(function(){
            if($(this).find('.pass_way').attr('cansel') === 'no'){
              ifCanBuy = false;
            }
          })
          if(ifCanBuy){
            $('.submit .submit_btn').css({
              background: '#009943'
            })
            $('.submit .submit_btn').attr('onclick', 'OrderSub()')
          }
          
          shopcarMoneysum()
          // 如果只有一件商品 且是自提或到店消费的  收货地址隐藏
          if($('.shopprolist .shop_pro').length === 1){
            $('.address').hide();
          }
          el.siblings('.getshop').show();
          el.siblings('.timepicker').show();
        }
      }
    })
  }
}

// 获取地址
function listAddressInfo() {
  return new Promise(function(resolve, reject) {
    var param = {
      url: 'get/shop/user/listAddressInfo',
      type: '',
      data: {
        memId: memidGet()
      }
    }
    ajaxJS(
      param,
      res => {
        if (res.code === '0') {
          let addlist = ''
          if (res.data.length > 0) {
            for (let i in res.data) {
              if (
                Number(addressid) !== undefined &&
                Number(addressid) === res.data[i].addressId
              ) {
                // 若指定地址 用指定地址
                addinfo = res.data[i]
                addlist += `
                                <div class="detail">
                                    <div class="person">
                                        <div class="name">收货人:${
                                          res.data[i].consignee
                                        }</div>
                                        <div class="phone">${
                                          res.data[i].phone
                                        }</div>
                                    </div>
                                    <div class="address_detail">
                                        <div>收货地址:${res.data[i].area} ${
                  res.data[i].detailAddress
                }</div>
                                        <div class="img"><img src="../images/general_next.png" alt=""></div>
                                    </div>
                                </div>
                            `
              } else if (
                addressid === undefined &&
                res.data[i].defaultStatus === 1
              ) {
                // 否则默认地址
                addinfo = res.data[i]
                addlist += `
                            <div class="detail">
                                <div class="person">
                                    <div class="name">收货人:${
                                      res.data[i].consignee
                                    }</div>
                                    <div class="phone">${
                                      res.data[i].phone
                                    }</div>
                                </div>
                                <div class="address_detail">
                                    <div>收货地址:${res.data[i].area} ${
                  res.data[i].detailAddress
                }</div>
                                    <div class="img"><img src="../images/general_next.png" alt=""></div>
                                </div>
                            </div>
                            `
              }
            }
          }
          if (addlist === '') {
            addlist = `
                    <div class="detail">
                        <div class="address_detail noaddress">
                            <div>请添加收货地址</div>
                            <div class="img"><img src="../images/general_next.png" alt=""></div>
                        </div>
                    </div>
                    `
          }
          $('.address a').append(addlist)
          // console.log(addinfo)
          // console.log(res.data.length > 0 , addinfo !== '')
          if (res.data.length > 0 && addinfo !== '') {
            resolve()
          } else {
            reject()
          }
        }
        $('.address').css('visibility','visible');
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
}

// 获取地址栏参数
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

// 来自购物车列表
const shopcarlistGet = () => {
  return new Promise(function(resolve, reject) {
    var param = {
      url: 'get/shop/order/listShopCart',
      type: '',
      data: {
        memId: memidGet()
      }
    }
    ajaxJS(
      param,
      res => {
        let resEdit = res.data
        let newResdata = []
        if (resEdit.length > 0) {
          // deliveryMethod 0 快递 1 自提 2 到店消费 3 快递+自提
          for (let i in resEdit) {
            let shopdelivery = [[], [], [], []]
            // console.log(resEdit[i].product)
            for (let j in resEdit[i].product) {
              if (resEdit[i].product[j].goodsType === 1) {
                resEdit[i].product[j].deliveryMethod = '2'
              } else {
                resEdit[i].product[j].deliveryMethod =
                  resEdit[i].product[j].deliveryMethod === '0,1'
                    ? '3'
                    : resEdit[i].product[j].deliveryMethod
              }
              let newlist = shopdelivery[resEdit[i].product[j].deliveryMethod]
              newlist.push(resEdit[i].product[j])
            }
            for (let k in shopdelivery) {
              if (shopdelivery[k].length !== 0) {
                let newshop = cloneObj(resEdit[i])
                newshop.product = shopdelivery[k]
                newResdata.push(newshop)
              }
            }
          }
        }
        res.data = newResdata
        let arrlist = ''
        let shoplist = []
        if (res.data.length > 0) {
          // console.log(res.data)
          for (let i in res.data) {
            // console.log(res.data[i])
            let shopproC = []
            arrlist += `<div class="shop_pro">`
           
            if(res.data[i].product[0].deliveryMethod === '1' || res.data[i].product[0].deliveryMethod === '3'){
              // 除快递外 其他配送方式都要添加自提地址
              arrlist += `
                <div class="getshop getshop_${i}">
                  <h3>您的订单需要到指定门店自提</h3>
                  <div class="shopName">自提门店:${res.data[i].shopName}</div>
                  <div class="shopAdd">门店地址:${res.data[i].shopAddress}</div>
                </div>`
            }else if(res.data[i].product[0].deliveryMethod === '2'){
              // 除快递外 其他配送方式都要添加自提地址
              arrlist += `
                <div class="getshop">
                  <h3>您的订单需要到指定门店消费</h3>
                  <div class="shopName">门店名称:${res.data[i].shopName}</div>
                  <div class="shopAdd">门店地址:${res.data[i].shopAddress}</div>
                </div>`
            }
            arrlist += `
                        <div class="shop" shopId='${
                          res.data[i].shopId
                        }' shopName='${
              res.data[i].shopName
            }'><a href="./shop.html?shopId=${
              res.data[i].shopId
            }"><img src="../images/shop_store.png" alt="">
            <span>${res.data[i].shopName}</span></a></div>
                    `
            for (let j in res.data[i].product) {
              if (
                balancelist.indexOf(String(res.data[i].product[j].cartId)) !==
                -1
              ) {
                shopproC.push({
                  productId: res.data[i].product[j].productId,
                  number: res.data[i].product[j].number,
                  goodsId: res.data[i].product[j].goodsId,
                  shopId: res.data[i].shopId
                })
                // 收集商品类型进行分析
                postType.push(res.data[i].product[j].goodsType)
                shoplist.push(res.data[i].shopId)
                arrlist += `
                            <div class="goodsMan">
                                <div class="commodity">
                                    <div class="img"><img class="lazy" data-original="${res.data[i].product[j].goodsImageUrl}"></div>
                                    <div class="detail">
                                        <div class="title">${
                                          res.data[i].product[j].goodsName
                                        }</div>
                                        <div class="describe">${
                                          res.data[i].product[j].productName
                                        }</div>
                                        <div class="prices">
                                            <div>
                                                <span class="price">¥ ${
                                                  res.data[i].product[j].amount
                                                }</span>
                                                ${
                                                  res.data[i].product[j]
                                                    .integralAmount !== null &&
                                                  res.data[i].product[j]
                                                    .integralAmount !==
                                                    '0.00' &&
                                                  res.data[i].product[j]
                                                    .integralAmount !== 0
                                                    ? '<span class="score">+积分:' +
                                                      parseInt(
                                                        res.data[i].product[j]
                                                          .integralAmount
                                                      ) +
                                                      '</span>'
                                                    : ''
                                                }
                                            </div>
                                            <span class="num">x${
                                              res.data[i].product[j].number
                                            }</span>
                                        </div>
                                    </div>
                                </div>
                                <!--购买数量-->
                                <div class="number_item">
                                    <div class="buy_num_item">购买数量</div>
                                    <div class="add">
                                        <div class="numchange min"><img src="../images/shop_min_g.png" alt=""></div>
                                        <div class="select_num" 
                                            cartId='${
                                              res.data[i].product[j].cartId
                                            }'
                                            shopId='${res.data[i].shopId}'
                                            productId='${
                                              res.data[i].product[j].productId
                                            }'
                                            goodsId='${
                                              res.data[i].product[j].goodsId
                                            }'
                                            goodsName='${
                                              res.data[i].product[j].goodsName
                                            }'
                                            goodsImageUrl='${
                                              res.data[i].product[j]
                                                .goodsImageUrl
                                            }'
                                            productName='${
                                              res.data[i].product[j].productName
                                            }'
                                            goodsType='${
                                              res.data[i].product[j].goodsType
                                            }'
                                            originalPrice='${
                                              res.data[i].product[j]
                                                .originalAmount
                                            }'
                                            cartId='${
                                              res.data[i].product[j].cartId
                                            }' 
                                            price='${
                                              res.data[i].product[j].amount
                                            }' 
                                            ${res.data[i].product[j].sharerId ? ("sharerId='"+res.data[i].product[j].sharerId+"'") : ''}
                                            integralAmount='${
                                              res.data[i].product[j]
                                                .integralAmount === null ||
                                              res.data[i].product[j]
                                                .integralAmount === '0.00'
                                                ? '0'
                                                : parseInt(
                                                    res.data[i].product[j]
                                                      .integralAmount
                                                  )
                                            }' >${
                  res.data[i].product[j].number
                }</div>
                                        <div class="numchange"><img src="../images/shop_plus_g.png" alt=""></div>
                                    </div>
                                </div> 
                            </div>
                            `
              }
            }
            let deliveryTxt = ''
            // deliveryMethod 0 快递 1 自提 2 到店消费 3 快递+自提
            switch (res.data[i].product[0].deliveryMethod) {
              case '0':
                deliveryTxt = '快递'
                break
              case '1':
                deliveryTxt = '自提'
                break
              case '2':
                deliveryTxt = '到店消费'
                break
              case '3':
                deliveryTxt = '请选择'
                break
              default:
                break
            }
            arrlist += `
                    <a class="pass_way" deliveryMethod='${
                      res.data[i].product[0].deliveryMethod
                    }' delmetSel='' shopproC='${JSON.stringify(shopproC)}' >
                        <div class="title">配送方式</div>
                        <div class="way">${deliveryTxt}${
              res.data[i].product[0].deliveryMethod === '3'
                ? '<img src="../images/general_next.png">'
                : ''
            }</div>
                    </a>`
            if(res.data[i].product[0].deliveryMethod !== '0'){
              arrlist += `<div class="timepicker timepicker_${i}">
                            <div class="timeSelL">预约时间</div>
                            <div class="timeSelR">
                              <div  readonly="readonly" class="timeStart timeStart_${i}" placeholder="预约开始时间">
                                <span>预约开始时间</span>
                              </div>
                              至
                              <div  readonly="readonly" class="timeEnd timeEnd_${i}" placeholder="预约结束时间">
                                <span>预约结束时间</span>
                              </div>
                            </div>
                        </div>`
            }
            arrlist += `<div class="amount_total">
                        <div>共<span class="pronumAll"></span>件商品&nbsp;&nbsp;<span class="spanxj">小计</span>:<span class="price"></span></div>
                    </div>
                    `
            arrlist += `</div>`
            setTimeout(() => {
              // 日期选择绑定
              var calendarStart = new datePicker()
              calendarStart.init({
                trigger: `.timeStart_${i}` /*按钮选择器，用于触发弹出插件*/ ,
                type: 'datetime' /*模式：date日期；datetime日期时间；time时间；ym年月；*/ ,
                minDate: today() /*最小日期*/ ,
                maxDate: '' /*最大日期*/ ,
                onSubmit: function () {
                  var theSelectData = calendarStart.value
                  if(time2unix(nowtime()) - time2unix($(`.timeStart_${i}`).val()) > 0){
                    layer.open({
                      content: '请选择有效的预约时间！',
                      skin: 'msg',
                      time: 2 //2秒后自动关闭
                    })
                    $(`.timeStart_${i}`).val('')
                  }else if($(`.timeEnd_${i}`).val() !== '' && (time2unix($(`.timeEnd_${i}`).val()) -time2unix($(`.timeStart_${i}`).val()) < 0)){
                    layer.open({
                      content: '预约的开始时间必须早于结束时间！',
                      skin: 'msg',
                      time: 2 //2秒后自动关闭
                    })
                    $(`.timeStart_${i}`).val('')
                  }else {
                    $(`.timeStart_${i}`).text($(`.timeStart_${i}`).val())
                  }
                },
                onClose: function () {
                  /*取消时触发事件*/
                }
              })
              var calendarEnd = new datePicker()
              calendarEnd.init({
                trigger: `.timeEnd_${i}` /*按钮选择器，用于触发弹出插件*/ ,
                type: 'datetime' /*模式：date日期；datetime日期时间；time时间；ym年月；*/ ,
                minDate: today() /*最小日期*/ ,
                maxDate: '' /*最大日期*/ ,
                onSubmit: function () {
                  if(time2unix(nowtime()) - time2unix($(`.timeEnd_${i}`).val()) > 0){
                    layer.open({
                      content: '请选择有效的预约时间！',
                      skin: 'msg',
                      time: 2 //2秒后自动关闭
                    })
                    $(`.timeEnd_${i}`).val('')
                  }else if($(`.timeStart_${i}`).val() !== '' && (time2unix($(`.timeEnd_${i}`).val()) - time2unix($(`.timeStart_${i}`).val()) < 0)){
                    layer.open({
                      content: '预约的结束时间必须晚于开始时间！',
                      skin: 'msg',
                      time: 2 //2秒后自动关闭
                    })
                    $(`.timeEnd_${i}`).val('')
                  }else{
                    $(`.timeEnd_${i}`).text($(`.timeEnd_${i}`).val())
                  }
                },
                onClose: function () {
                  /*取消时触发事件*/
                }
              })
              if(res.data[i].product[0].deliveryMethod === '3'){
                $(`.timepicker_${i}`).hide()
                $(`.getshop_${i}`).hide()
              }
            }, 200);
          }
          
        } else {
          arrlist += `<div class="shopcarnone">购物车暂无商品，快去添加吧！</div>`
        }
        $('.shopprolist').html(arrlist)
        $('.shop_pro').each(function() {
          if (
            shoplist.indexOf(
              Number(
                $(this)
                  .find('.shop')
                  .attr('shopId')
              )
            ) === -1
          ) {
            $(this).remove()
          }
        })
        Imglazy();
        // postTypeshow();
        resolve()
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
}

// 来自商品立即购买
const buynowInfo = proinfo => {
  return new Promise(function(resolve, reject) {
    let arrlist = '<div class="shop_pro">'
    let shopproC = []
    let deliveryTxt = ''
    // console.log(proinfo)
    proinfo.deliveryMethod =
      proinfo.deliveryMethod === '0,1' ? '3' : proinfo.deliveryMethod
    // deliveryMethod 0 快递 1 自提 2 到店消费 3 快递+自提
    switch (proinfo.deliveryMethod) {
      case '0':
        deliveryTxt = '快递'
        break
      case '1':
        deliveryTxt = '自提'
        break
      case '2':
        deliveryTxt = '到店消费'
        break
      case '3':
        deliveryTxt = '请选择'
        break
      default:
        break
    }
    if(proinfo.deliveryMethod === '1' || proinfo.deliveryMethod === '3'){
      // 除快递外 其他配送方式都要添加自提地址
      arrlist += `
        <div class="getshop">
          <h3>您的订单需要到指定门店自提</h3>
          <div class="shopName">自提门店:${proinfo.shopName}</div>
          <div class="shopAdd">门店地址:${proinfo.shopAddres}</div>
        </div>`
    }else if(proinfo.deliveryMethod === '2'){
      // 除快递外 其他配送方式都要添加自提地址
      arrlist += `
        <div class="getshop">
          <h3>您的订单需要到指定门店消费</h3>
          <div class="shopName">门店名称:${proinfo.shopName}</div>
          <div class="shopAdd">门店地址:${proinfo.shopAddres}</div>
        </div>`
    }
    shopproC.push({
      productId: proinfo.productId,
      number: proinfo.number,
      goodsId: proinfo.goodsId,
      shopId: proinfo.shopId
    })
    arrlist += `
            
                <div class="shop" shopId='${proinfo.shopId}' shopName='${
      proinfo.shopName
    }'><a href="./shop.html?shopId=${proinfo.shopId}"><img src="${
      proinfo.shopLogo
    }" alt=""><span>${proinfo.shopName}</span></a></div>
                <div class="goodsMan">
                    <div class="commodity">
                        <div class="img"><img class="lazy" data-original="${proinfo.goodsImageUrl}"></div>
                        <div class="detail">
                            <div class="title">${proinfo.goodsName}</div>
                            <div class="describe">${proinfo.productName}</div>
                            <div class="prices">
                                <div>
                                    <span class="price">¥ ${
                                      proinfo.showPrice
                                    }</span>
                                    ${
                                      proinfo.intetral !== null &&
                                      proinfo.intetral !== '0.00' &&
                                      proinfo.intetral !== 0
                                        ? '<span class="score">+积分:' +
                                          proinfo.intetral +
                                          '</span>'
                                        : ''
                                    }
                                </div>
                                <span class="num">x${proinfo.number}</span>
                            </div>
                        </div>
                    </div>
                    <!--购买数量-->
                    <div class="number_item">
                        <div class="buy_num_item">购买数量</div>
                        <div class="add">
                            <div class="numchange min"><img src="../images/shop_min.png" alt=""></div>
                            <div class="select_num" 
                                shopId='${proinfo.shopId}'
                                productId='${proinfo.productId}'
                                goodsId='${proinfo.goodsId}'
                                goodsName='${proinfo.goodsName}'
                                goodsImageUrl='${proinfo.goodsImageUrl}'
                                productName='${proinfo.productName}'
                                goodsType='${proinfo.goodsType}'
                                originalPrice='${proinfo.originalPrice}'
                                price='${proinfo.showPrice}' 
                                ${proinfo.sharerId ? ("sharerId='"+proinfo.sharerId+"'") : ''}
                                integralAmount='${
                                  proinfo.intetral === null ||
                                  proinfo.intetral === '0.00'
                                    ? '0'
                                    : proinfo.intetral
                                }' >${proinfo.number}</div>
                            <div class="numchange"><img src="../images/shop_plus.png" alt=""></div>
                        </div>
                    </div> 
                </div>
                <a class="pass_way" deliveryMethod='${
                  proinfo.deliveryMethod
                }' delmetSel='' shopproC='${JSON.stringify(shopproC)}'>
                    <div class="title">配送方式</div>
                    <div class="way">
                    ${deliveryTxt}
                    ${
                      proinfo.deliveryMethod === '3'
                        ? '<img src="../images/general_next.png" alt="">'
                        : ''
                    }
                    </div>
                </a>`
    if(proinfo.deliveryMethod !== '0'){
      arrlist += `<div class="timepicker">
                    <div class="timeSelL">预约时间</div>
                    <div class="timeSelR">
                      <div  readonly="readonly" class="timeStart" placeholder="预约开始时间">
                        <span>预约开始时间</span>
                      </div>
                      至
                      <div  readonly="readonly" class="timeEnd" placeholder="预约结束时间">
                        <span>预约结束时间</span>
                      </div>
                    </div>
                </div>`
    }
    arrlist += `<div class="amount_total">
                    <div>共<span class="pronumAll"></span>件商品&nbsp;&nbsp;<span class="spanxj">小计</span>:<span class="price"></span></div>
                </div>
            </div>
        `
    $('.shopprolist').html(arrlist)
    if(proinfo.deliveryMethod === '3'){
      $('.getshop').hide();
      $('.timepicker').hide();
    }
    if(proinfo.deliveryMethod === '1' || proinfo.deliveryMethod === '2'){
      $('.address').hide();
    }
    
    
    postType.push(proinfo.goodsType)
    resolve()
    Imglazy();

    var calendarStart = new datePicker()
    calendarStart.init({
      trigger: '.timeStart' /*按钮选择器，用于触发弹出插件*/ ,
      type: 'datetime' /*模式：date日期；datetime日期时间；time时间；ym年月；*/ ,
      minDate: today() /*最小日期*/ ,
      maxDate: '' /*最大日期*/ ,
      onSubmit: function () {
        var theSelectData = calendarStart.value
        if(time2unix(nowtime()) - time2unix($(`.timeStart`).val()) > 0){
          layer.open({
            content: '请选择有效的预约时间！',
            skin: 'msg',
            time: 2 //2秒后自动关闭
          })
          $(`.timeStart`).val('')
        }else if($(`.timeEnd`).val() !== '' && (time2unix($(`.timeEnd`).val()) - time2unix($(`.timeStart`).val()) < 0)){
          layer.open({
            content: '预约的开始时间必须早于结束时间！',
            skin: 'msg',
            time: 2 //2秒后自动关闭
          })
          $(`.timeStart`).val('')
        }else{
          $(`.timeStart`).text($(`.timeStart`).val())
        }
      },
      onClose: function () {
        /*取消时触发事件*/
      }
    })
    var calendarEnd = new datePicker()
    calendarEnd.init({
      trigger: '.timeEnd' /*按钮选择器，用于触发弹出插件*/ ,
      type: 'datetime' /*模式：date日期；datetime日期时间；time时间；ym年月；*/ ,
      minDate: today() /*最小日期*/ ,
      maxDate: '' /*最大日期*/ ,
      onSubmit: function () {
        if(time2unix(nowtime()) - time2unix($(`.timeEnd`).val()) > 0){
          layer.open({
            content: '请选择有效的预约时间！',
            skin: 'msg',
            time: 2 //2秒后自动关闭
          })
          $(`.timeEnd`).val('')
        }else if($(`.timeStart`).val() !== '' && (time2unix($(`.timeEnd`).val()) - time2unix($(`.timeStart`).val()) < 0)){
          layer.open({
            content: '预约的结束时间必须晚于开始时间！',
            skin: 'msg',
            time: 2 //2秒后自动关闭
          })
          $(`.timeEnd`).val('')
        }else{
          $(`.timeEnd`).text($(`.timeEnd`).val())
        }
      },
      onClose: function () {
        /*取消时触发事件*/
      }
    })
  })
}

// 对象克隆
var cloneObj = function(obj) {
  var str,
    newobj = obj.constructor === Array ? [] : {}
  if (typeof obj !== 'object') {
    return
  } else if (window.JSON) {
    ;(str = JSON.stringify(obj)), //序列化对象
      (newobj = JSON.parse(str)) //还原
  } else {
    for (var i in obj) {
      newobj[i] = typeof obj[i] === 'object' ? cloneObj(obj[i]) : obj[i]
    }
  }
  return newobj
}

// 购物车金额计算公共方法
const shopcarMoneysum = () => {
  let allmoney = 0
  let allscore = 0
  let pronumAll = 0
  // deliveryMethod 0 快递 1 自提 2 到店消费 3 快递+自提
  let moneyifpost = 0
  // deliveryMethod  为 3时，是否选择了快递
  let iftype3selp = false
  let allpostMoney = 0
  $('.shopprolist .shop_pro').each(function() {
    let onemoney = 0
    let onescore = 0
    let onepronum = 0
    let moneyiftypeunsel = ''
    let ordPostMoney = 0
    $(this)
      .find('.goodsMan')
      .each(function() {
        var select_num = $(this).find('.select_num')
        onepronum += Number(select_num.text())
        onemoney += Number(select_num.attr('price')) * Number(select_num.text())
        onescore +=
          Number(select_num.attr('integralAmount')) * Number(select_num.text())
      })
    let deliveryMet = $(this)
      .find('.pass_way')
      .attr('deliverymethod')

    // 0 快递 1 自提
    if (deliveryMet === '3') {
      ordPostMoney += 0
    } else {
      ordPostMoney += Number(
        $(this)
          .find('.pass_way')
          .attr('postagecount') === undefined
          ? 0
          : $(this)
              .find('.pass_way')
              .attr('postagecount')
      )
    }
    allpostMoney += ordPostMoney
    // 选择快递方式下方显示是否包含邮费
    if (
      deliveryMet === '3' &&
      $(this)
        .find('.pass_way')
        .attr('delmetSel') === ''
    ) {
      moneyiftypeunsel = '(不含运费)'
    } else if (
      deliveryMet === '3' &&
      $(this)
        .find('.pass_way')
        .attr('delmetSel') === '0'
    ) {
      // 配送方式选择自提
      moneyiftypeunsel = '(不含运费)'
      iftype3selp = true
      allpostMoney = thisorderAllpm
    }
    if (
      deliveryMet === '0' ||
      (deliveryMet === '3' &&
        $(this)
          .find('.pass_way')
          .attr('delmetSel') === '0')
    ) {
      moneyifpost++
    }
    $(this)
      .find('.amount_total .pronumAll')
      .text(onepronum)
    if (moneyiftypeunsel !== '') {
      $(this)
        .find('.amount_total .spanxj')
        .text('小计' + moneyiftypeunsel)
    } else if (
      deliveryMet === '3' &&
      $(this)
        .find('.pass_way')
        .attr('delmetSel') === '1'
    ) {
      $(this)
        .find('.amount_total .spanxj')
        .text('小计')
    }
    $(this)
      .find('.amount_total .price')
      .text(
        `￥${(onemoney + ordPostMoney).toFixed(2)} ${
          onescore > 0 ? '+' + onescore.toFixed(0) + '分' : ''
        }`
      )
    allmoney += onemoney
    allscore += onescore
    pronumAll += onepronum
  })
  if (moneyifpost > 0) {
    $('.submit .title').text('合计金额(含运费):')
  } else {
    $('.submit .title').text('合计金额:')
  }
  if (iftype3selp) {
    allpostMoney = Number(thisorderAllpm)
  }
  $('.number_all').text(
    `￥${(allmoney + allpostMoney).toFixed(2)} ${
      allscore > 0 ? '+' + allscore.toFixed(0) + '分' : ''
    }`
  )
  $('.number_all').attr('allmoney', (allmoney + allpostMoney).toFixed(2))
  $('.number_all').attr('allscore', allscore.toFixed(0))
  exchangeIntegral(allmoney + allpostMoney)
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
      // container: $(".submit_box"),  // 对某容器中的图片实现效果
      // container,值为某容器.lazyload默认在拉动浏览器滚动条时生效,这个参数可以让你在拉动某DIV的滚动条时依次加载其中的图片
      failurelimit : 20 ,// 图片排序混乱时
      // failurelimit,值为数字.lazyload默认在找到第一张不在可见区域里的图片时则不再继续加载,但当HTML容器混乱的时候可能出现可见区域内图片并没加载出来的情况,failurelimit意在加载N张可见区域外的图片,以避免出现这个问题.
      skip_invisible : false,
  });
}

// 计算可获得积分数
const exchangeIntegral = (amount) => {
  var param = {
    url: 'get/shop/order/exchangeIntegral',
    type: '',
    data: {
      amount
    }
  }
  ajaxJS(
    param,
    res => {
      // console.log(res)
      $('.IntegralGet span').text(res.data+'积分')
      $('.IntegralGet').show()
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

// 购物车添加数量
const GoodsInCartChange = (cartId, num) => {
  var param = {
    url: 'get/shop/order/addGoodsInCart',
    type: '',
    data: {
      cartId: cartId,
      number: num
    }
  }
  ajaxJS(
    param,
    res => {},
    error => {
      layer.open({
        content: error.msg,
        skin: 'msg',
        time: 2 //2秒后自动关闭
      })
    }
  )
}

// 快递费计算
const postMoneyCount = (postval, el, type) => {
  return new Promise(function(resolve, reject) {
    let product = []
    // 若type=1 则为配送方式选择为快递
    if (type === 1) {
      $('.shopprolist .shop_pro').each(function() {
        let delvMtd = $(this)
          .find('.pass_way')
          .attr('deliverymethod')
        if (
          delvMtd === '0' ||
          (delvMtd === '3' &&
            $(this)
              .find('.pass_way')
              .attr('delmetsel') === '0')
        ) {
          let postdata = JSON.parse(
            $(this)
              .find('.pass_way')
              .attr('shopproc')
          )
          for (let i in postdata) {
            let proson = new Object()
            proson.productId = postdata[i].productId
            proson.goodsId = postdata[i].goodsId
            proson.number = postdata[i].number
            proson.shopId = postdata[i].shopId
            product.push(proson)
          }
        }
      })
    } else {
      let postdata = JSON.parse(postval)
      for (let i in postdata) {
        let proson = new Object()
        proson.productId = postdata[i].productId
        proson.goodsId = postdata[i].goodsId
        proson.number = postdata[i].number
        proson.shopId = postdata[i].shopId
        product.push(proson)
      }
    }

    var param = {
      url: 'get/shop/order/countPostage',
      type: '',
      data: {
        product: product,
        addressId: addressid || addinfo.addressId
      }
    }
    ajaxJS(
      param,
      res => {
        el.attr('cansel', '')
        if (res.code === '0') {
          if (type === 1) {
            thisorderAllpm = res.data
          } else {
            el.attr('postagecount', res.data)
            if (el.attr('deliverymethod') === '0') {
              el.find('.way').text('快递:' + res.data)
            }
          }
        } else {
          layer.open({
            content: res.msg,
            skin: 'msg',
            time: 2 //2秒后自动关闭
          })
        }
        resolve()
        setTimeout(function() {
          shopcarMoneysum()
        }, 200)
      },
      error => {
        layer.open({
          content: error.msg,
          skin: 'msg',
          time: 2 //2秒后自动关闭
        })
        if (error.code === '30012') {
          el.attr('cansel', 'no')
          // 若不支持配送，置灰提交按钮
          $('.submit .submit_btn').css({
            background: 'grey'
          })
          $('.submit .submit_btn').attr('onclick', 'javascript:return false')
        }
      }
    )
  })
}

//订单提交
const OrderSub = () => {
  if (submiting === true) {
    layer.open({
      content: '请勿重复提交！',
      skin: 'msg',
      time: 2 //2秒后自动关闭
    })
    throw ''
  }
  $('.shopprolist .shop_pro').each(function() {
    // 之前下单只有快递的才要选择收货地址，现在所有配送方式都要选择收货地址
    if (
        ($(this).find('.pass_way').attr('deliverymethod') === '0' ||
        $(this).find('.pass_way').attr('deliverymethod') === '3') &&
      addinfo === ''
    ) {
      layer.open({
        content: '下单前请先选择收货地址！',
        skin: 'msg',
        time: 2 //2秒后自动关闭
      })
      throw ''
    } else if (
      $(this)
        .find('.pass_way')
        .attr('deliverymethod') === '3' &&
      $(this)
        .find('.pass_way')
        .attr('delmetsel') === ''
    ) {
      layer.open({
        content: '请选择配送方式！',
        skin: 'msg',
        time: 2 //2秒后自动关闭
      })
      throw ''
    }
  })
  // 遍历店铺
  let shopOrder = []
  $('.shopprolist .shop_pro').each(function() {
    // 遍历店铺信息
    let oneshopOrd = new Object()
    oneshopOrd.shopId = $(this)
      .find('.shop')
      .attr('shopid')
    oneshopOrd.shopName = $(this)
      .find('.shop')
      .attr('shopname')
    oneshopOrd.number = 0
    oneshopOrd.product = []
    //配送方式
    oneshopOrd.type =
      $(this)
        .find('.pass_way')
        .attr('deliverymethod') === '3'
        ? $(this)
            .find('.pass_way')
            .attr('delmetsel')
        : $(this)
            .find('.pass_way')
            .attr('deliverymethod')
    // 遍历商品信息
    $(this)
      .find('.goodsMan')
      .each(function() {
        let proson = new Object()
        proson.goodsId = $(this)
          .find('.select_num')
          .attr('goodsid')
        proson.goodsName = $(this)
          .find('.select_num')
          .attr('goodsname')
        proson.goodsImageUrl = $(this)
          .find('.select_num')
          .attr('goodsimageurl')
        proson.productId = $(this)
          .find('.select_num')
          .attr('productid')
        proson.productName = $(this)
          .find('.select_num')
          .attr('productname')
        proson.number = $(this)
          .find('.select_num')
          .text()
        oneshopOrd.number += Number(
          $(this)
            .find('.select_num')
            .text()
        )
        proson.originalPrice = $(this)
          .find('.select_num')
          .attr('originalprice')
        proson.showPrice = $(this)
          .find('.select_num')
          .attr('price')
        if($(this).find('.select_num').attr('sharerid') !== undefined){
          let pronum = parseInt($(this).find('.select_num').text())
          let sharerId = []

          if(pronum === 1 || getUrl(location.href).orderSumType === '1'){
            proson.sharerId = $(this).find('.select_num').attr('sharerid')
          }else{
            for(let i = 0;i<pronum ; i++){
              sharerId.push($(this).find('.select_num').attr('sharerid'))
            }
            proson.sharerId = String(sharerId)
          }
        }
        proson.intetral = $(this)
          .find('.select_num')
          .attr('integralamount')
        
        if(oneshopOrd.type === '1' || oneshopOrd.type === '2'){
          let timeSelC = $(this).siblings('.timepicker')
          if( timeSelC.find('.timeStart').val() === '' || timeSelC.find('.timeEnd').val() === '' ){
            layer.open({
              content: '请选择有效的预约时间！',
              skin: 'msg',
              time: 2 //2秒后自动关闭
            })
            throw ''
          }else{
            
            proson.appointmentTime = timeSelC.find('.timeStart').val() + ' ~ ' + timeSelC.find('.timeEnd').val()
          }
        }
        
        oneshopOrd.product.push(proson)
      })
    
    oneshopOrd.freight =
      $(this)
        .find('.pass_way')
        .attr('deliverymethod') === '3'
        ? $(this)
            .find('.pass_way')
            .attr('delmetsel') === '0'
          ? $(this)
              .find('.pass_way')
              .attr('postagecount')
          : 0
        : $(this)
            .find('.pass_way')
            .attr('postagecount')
    shopOrder.push(oneshopOrd)
  })
  let allmoney = Number($('.number_all').attr('allmoney'))
  let allscore = Number($('.number_all').attr('allscore'))
  let namelist = []
  $('.goodsMan').each(function() {
    namelist.push(
      $(this)
        .find('.detail .title')
        .text()
    )
  })
  let cartList = []
  $('.shopprolist .shop_pro').each(function() {
    $(this)
      .find('.select_num')
      .each(function() {
        if ($(this).attr('cartid') !== undefined) {
          cartList.push($(this).attr('cartid'))
        }
      })
  })
  let newshoporders = []
  for (let i in shopOrder) {
    let typehave = newshoporders.filter(
      obj =>
        obj.shopId === shopOrder[i].shopId && obj.type === shopOrder[i].type
    )
    if (typehave.length === 0) {
      newshoporders.push(shopOrder[i])
    } else {
      let listoldval = cloneObj(typehave[0])

      listoldval.freight = (
        Number(listoldval.freight) + Number(shopOrder[i].freight)
      ).toFixed(2)
      for (let m in shopOrder[i].product) {
        listoldval.product.push(shopOrder[i].product[m])
      }
      newshoporders.splice(newshoporders.indexOf(typehave[0]), 1, listoldval)
    }
  }
  let deliveryList = [];
  for(let i in newshoporders){
    deliveryList.push(newshoporders[i].type);
  }
  var param = {
    url: 'get/shop/order/commitOrder',
    type: '',
    data: {
      addressInfo: {
        memId: memidGet(),
        addressId: addinfo.addressId,
        consignee: addinfo.consignee,
        phone: addinfo.phone,
        area: addinfo.area,
        detailAddress: addinfo.detailAddress,
        defaultStatus: addinfo.defaultStatus
      },
      totalAmount: allmoney.toFixed(2), //总金额
      totalIntegral: allscore.toFixed(0), //总积分
      memId: memidGet(),
      shopOrder: newshoporders,
      cartList: cartList
    }
  }
  submiting = true;
  setTimeout(() => {
    submiting = false;
  }, 3000);
  ajaxJS(
    param,
    res => {
      submiting = false;
      if (res.code === '0') {
        let payinfo = res.data;
        payinfo.limitTime = res.data.expireTime
        payinfo.goodsname = String(namelist)
        payinfo.deliveryList = deliveryList;
        sessionStorage.payinfo = JSON.stringify(payinfo)
        // 埋点点击提交订单
        ordersubmitTracker()
        setTimeout(() => {
          location.href = './pay_confirm.html'
        }, 300)
      } else {
        tiansLayer({
          title:'提示',
          content: res.msg,
          btn: ['我知道了'],
          yes: function() {
            // 提示框关闭公共方法
            tiansLayerClose();
          }
        })
      }
    },
    error => {
      submiting = false;
      layer.open({
        content: error.msg,
        skin: 'msg',
        time: 2 //2秒后自动关闭
      })
    }
  )
}

function today() {
  var date = new Date()
  var year = date.getFullYear()
  var month = date.getMonth() + 1 < 10 ? `0${date.getMonth()+1}` : date.getMonth() + 1
  var day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
  return `${year}-${month}-${day}`
}

function nowtime() {
  var date = new Date()
  var year = date.getFullYear()
  var month = date.getMonth() + 1 < 10 ? `0${date.getMonth()+1}` : date.getMonth() + 1
  var day = date.getDate() < 10 ? `0${date.getDate()}` : date.getDate()
  var hour = date.getHours() < 10 ? `0${date.getHours()}` : date.getHours()
  var minutes = date.getMinutes() < 10 ? `0${date.getMinutes()}` : date.getMinutes() 
  return `${year}-${month}-${day} ${hour}:${minutes}`
}

function time2unix(timeVal) {
  timeVal = timeVal.replace(/-/g,"/");
  return Number(Date.parse(new Date(timeVal)))
}




