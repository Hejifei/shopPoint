$(function(){
    if(!isWechat){
        // 顶部高度计算
        $('.pencen_top').css({
            'height':((398+statusBarHeight)/75).toFixed(4)+'rem',
            'padding-top':((statusBarHeight)/75).toFixed(4)+'rem',
        })
    }
    $('.pencen_top').css('visibility','visible');
    $('.person_box').css('visibility','visible');
    $('.adsaddhref').attr('href','./address_add.html?htmlfont='+$('html').css('font-size'))

    MemInfoGet();
    statusNumberGet();
})

// 个人中心会员相关信息
const MemInfoGet = ()=>{
    var param = {
        url: "get/shop/user/getMemInfo",
        type: "",
        data: {
            memId:memidGet(),
        }
    };
    ajaxJS(param, res => {
        $('.pc_headimg').attr('src',res.data.headImage === null ? '../images/personal_dehead.png' : res.data.headImage);
        $('.pc_headimg').addClass('opacity')
        $('.penc_infoDti .nickname').html(`<i class="opacity">${res.data.nickName === null ? '赢粉会员' : res.data.nickName}</i>${res.data.gradeLevel === null ? '' : '<span class="opacity">'+res.data.gradeLevel+'</span>'}`);
        $('.penc_infoDti .scrolline').text(`成长值:${res.data.growthvValue}`);
        $('.penc_infoDti .scrolline').addClass('opacity')
        // Imglazy();
    }, error => {
        layer.open({
            content: error.msg
            , skin: 'msg'
            , time: 2 //2秒后自动关闭
        })
    })
}

// 会员订单状态数量
const statusNumberGet = ()=>{
    var param = {
        url: "get/shop/order/statusNumber",
        type: "",
        data: {
            memId:memidGet(),
        }
    };
    ajaxJS(param, res => {
        if(res.data !== null){
            for(let i in res.data){
                switch (res.data[i].status) {
                    case 0:
                        // 待支付
                        if(res.data[i].number > 0){
                            $('.type0a').addClass('menu_active');
                        }
                        break;
                    case 1:
                        // 待发货
                        if(res.data[i].number > 0){
                            $('.type1a').addClass('menu_active');
                        }
                        break;
                    case 2:
                        // 待收货
                        if(res.data[i].number > 0){
                            $('.type2a').addClass('menu_active');
                        }
                        break;
                    case 3:
                        // 待收货
                        if(res.data[i].number > 0){
                            $('.type2a').addClass('menu_active');
                        }
                        break;
                    case 4:
                        // 待评价
                        if(res.data[i].number > 0){
                            $('.type4a').addClass('menu_active');
                        }
                        break;
                    case 5:
                        // 售后
                        if(res.data[i].number > 0){
                            $('.type5a').addClass('menu_active');
                        }
                        break;
                    default:
                        break;
                }
            }
        }
    }, error => {
        layer.open({
            content: error.msg
            , skin: 'msg'
            , time: 2 //2秒后自动关闭
        })
    })
}

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