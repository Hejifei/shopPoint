let orderNo = '';
let suborderno = '';
$(function(){
    if(!isWechat){
        // 顶部高度计算
        $('.navigation').css({
            'height':((90+statusBarHeight)/75).toFixed(4)+'rem',
            'padding-top':((statusBarHeight)/75).toFixed(4)+'rem',
        })
        $('.order_content').css({
            'padding-top':((90+statusBarHeight)/75).toFixed(4)+'rem',
        })
    }
    $('.navigation').css('visibility','visible');
    $('.order_content').css('visibility','visible');

    orderNo = getUrl(location.href).orderNo;
    suborderno = getUrl(location.href).suborderno;
    getOrderDetail();


    // 售后类型选择
    $('.deawback_typeC .dt_line').click(function(){
        location.href = `./drawback_detail.html?orderNo=${orderNo}&&suborderno=${suborderno}&&refundType=${$(this).attr('refundType')}`;
    })
})

const getOrderDetail = ()=>{
    var param = {
        url: "get/shop/order/getOrderDetail",
        type: "",
        data: {
            orderNo:orderNo
        }
    };
    ajaxJS(param, res => {
        let assessarr= '';
        for(let i in res.data.product){
            if(res.data.product[i].subOrderNo === suborderno){
                assessarr +=`
                <div class="prolist_son">
                    <a class="commodity" href="./shop_detail.html?id=${res.data.product[i].goodsId}">
                        <div class="img"><img src="${res.data.product[i].goodsImageUrl === '' ? '../images/shop_nopic.png' : res.data.product[i].goodsImageUrl}" alt=""></div>
                        <div class="detail">
                            <div class="title">${res.data.product[i].goodsName}</div>
                            <div class="describe">${res.data.product[i].productName}</div>
                        </div>
                    </a>
                </div>
                `;
            }
        }
        $('.prolist').html(assessarr);
        // Imglazy();
        $('.deawback_typeC').css('visibility','visible');
    }, error => {
        layer.open({
            content: error.msg
            , skin: 'msg'
            , time: 2 //2秒后自动关闭
        })
    })
}

//获取地址栏参数
const getUrl = function (url) {
    url = !url ? location.search : url;
    var temp = {};
    if (url.indexOf("?") != -1) {
        var params = url.substr(url.indexOf("?") + 1).split("&");
        for (var i = 0; i < params.length; i++) {
            var param = params[i].split("=");
            temp[param[0]] = param[1];
        }
        return temp;
    } else {
        return false;
    }
}

// 懒加载设置
const Imglazy =()=>{
    $("img.lazy").lazyload({
        placeholder : "../images/shop_nopic.png", //用图片提前占位
        // placeholder,值为某一图片路径.此图片用来占据将要加载的图片的位置,待图片加载时,占位图则会隐藏
        effect: "fadeIn", // 载入使用何种效果
        // effect(特效),值有show(直接显示),fadeIn(淡入),slideDown(下拉)等,常用fadeIn
        threshold: 200, // 提前开始加载
        // threshold,值为数字,代表页面高度.如设置为200,表示滚动条在离目标位置还有200的高度时就开始加载图片,可以做到不让用户察觉
        event: 'sporty',  // 事件触发时才加载
        // event,值有click(点击),mouseover(鼠标划过),sporty(运动的),foobar(…).可以实现鼠标莫过或点击图片才开始加载,后两个值未测试…
        container: $("body"),  // 对某容器中的图片实现效果
        // container,值为某容器.lazyload默认在拉动浏览器滚动条时生效,这个参数可以让你在拉动某DIV的滚动条时依次加载其中的图片
        failurelimit : 10 // 图片排序混乱时
        // failurelimit,值为数字.lazyload默认在找到第一张不在可见区域里的图片时则不再继续加载,但当HTML容器混乱的时候可能出现可见区域内图片并没加载出来的情况,failurelimit意在加载N张可见区域外的图片,以避免出现这个问题.
    });
}