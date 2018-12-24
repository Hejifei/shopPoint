'use strict';

var orderNo = '';
var orderType = getUrl(location.href).orderType;
$(function () {
    if (!isWechat) {
        // 顶部高度计算
        $('.navigation').css({
            'height': ((90 + statusBarHeight) / 75).toFixed(4) + 'rem',
            'padding-top': (statusBarHeight / 75).toFixed(4) + 'rem'
        });
        $('.order_content').css({
            'padding-top': ((90 + statusBarHeight) / 75).toFixed(4) + 'rem'
        });
    }
    $('.navigation').css('visibility', 'visible');

    orderNo = getUrl(location.href).orderNo;
    getOrderDetail();

    // 发表评价
    $(".assessSubC a").click(function () {
        $('.required').each(function () {
            if ($(this).val().trim() === '') {
                tiansLayer({
                    title: '提示',
                    content: '请输入商品追评！',
                    btn: ['我知道了'],
                    yes: function yes() {
                        // 提示框关闭公共方法
                        tiansLayerClose();
                    }
                });
                throw "";
            }
        });
        $('.required').each(function () {
            if ($(this).val().trim().length > 100) {
                tiansLayer({
                    title: '提示',
                    content: '商品追评不超过100个字！',
                    btn: ['我知道了'],
                    yes: function yes() {
                        // 提示框关闭公共方法
                        tiansLayerClose();
                    }
                });
                throw '';
            }
        });
        var commentlist = [];
        $('.prolist .prolist_son').each(function () {
            commentlist.push({
                commentId: $(this).find('textarea').attr('commentId'),
                evaluate: $(this).find('textarea').val().trim(),
                goodsId: $(this).find('textarea').attr('goodsId'),
                goodsName: $(this).find('textarea').attr('goodsName')
            });
        });
        var param = {
            url: "get/shop/order/addComments",
            type: "",
            data: commentlist
        };
        ajaxJS(param, function (res) {
            if (res.code === '0') {
                // 埋点商城_商品评价
                for (var i in commentlist) {
                    productevaluateappendTracker('', '', '', '', commentlist[i].goodsId, commentlist[i].goodsName, commentlist[i].evaluate);
                }
                tiansLayer({
                    title: '提示',
                    content: '你已经成功追评价商品！',
                    btn: ['返回'],
                    yes: function yes() {
                        // 提示框关闭公共方法
                        tiansLayerClose();
                        location.href = './order_detail.html?orderNo=' + orderNo + (orderType === '5' ? '&orderType=5' : '');
                    }
                });
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
    });
});

var getOrderDetail = function getOrderDetail() {
    var param = {
        url: "get/shop/order/getOrderDetail",
        type: "",
        data: {
            orderNo: orderNo
        }
    };
    if (orderType !== undefined) {
        param.data.ordertype = 5;
        param.data.subOrderNo = getUrl(location.href).subOrderNo;
        param.url = 'get/shop/order/getAfterServiceOrderDetail';
    }
    ajaxJS(param, function (res) {
        var assessarr = '';
        for (var i in res.data.product) {
            assessarr += '\n            <div class="prolist_son">\n                <a class="commodity" href="./shop_detail.html?id=' + res.data.product[i].goodsId + '">\n                    <div class="img"><img src="' + (res.data.product[i].goodsImageUrl === '' ? '../images/shop_nopic.png' : res.data.product[i].goodsImageUrl) + '" alt=""></div>\n                    <div class="detail">\n                        <div class="title">' + res.data.product[i].goodsName + '</div>\n                        <div class="describe">' + res.data.product[i].productName + '</div>\n                    </div>\n                </a>\n                <textarea \n                    commentId=\'' + res.data.product[i].commentId + '\'\n                    subOrderNo=\'' + res.data.product[i].subOrderNo + '\'\n                    productName=\'' + res.data.product[i].productName + '\'\n                    goodsId=\'' + res.data.product[i].goodsId + '\'\n                    goodsName=\'' + res.data.product[i].goodsName + '\'\n                    class="required evaluate" placeholder="\u8FDB\u4E00\u6B65\u804A\u4E00\u804A\u8FD9\u6B21\u8D2D\u4E70\u7684\u611F\u53D7\u5427"></textarea>\n            </div>\n            ';
        }
        $('.prolist').html(assessarr);
        // Imglazy();
        $('textarea').focus(function () {
            document.getElementsByTagName('body')[0].scrollTop = 0;
        });
    }, function (error) {
        layer.open({
            content: error.msg,
            skin: 'msg',
            time: 2 //2秒后自动关闭
        });
    });
};

//获取地址栏参数
var getUrl = function getUrl(url) {
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
};

// 懒加载设置
var Imglazy = function Imglazy() {
    $("img.lazy").lazyload({
        placeholder: "../images/shop_nopic.png", //用图片提前占位
        // placeholder,值为某一图片路径.此图片用来占据将要加载的图片的位置,待图片加载时,占位图则会隐藏
        effect: "fadeIn", // 载入使用何种效果
        // effect(特效),值有show(直接显示),fadeIn(淡入),slideDown(下拉)等,常用fadeIn
        threshold: 200, // 提前开始加载
        // threshold,值为数字,代表页面高度.如设置为200,表示滚动条在离目标位置还有200的高度时就开始加载图片,可以做到不让用户察觉
        event: 'sporty', // 事件触发时才加载
        // event,值有click(点击),mouseover(鼠标划过),sporty(运动的),foobar(…).可以实现鼠标莫过或点击图片才开始加载,后两个值未测试…
        container: $("body"), // 对某容器中的图片实现效果
        // container,值为某容器.lazyload默认在拉动浏览器滚动条时生效,这个参数可以让你在拉动某DIV的滚动条时依次加载其中的图片
        failurelimit: 10 // 图片排序混乱时
        // failurelimit,值为数字.lazyload默认在找到第一张不在可见区域里的图片时则不再继续加载,但当HTML容器混乱的时候可能出现可见区域内图片并没加载出来的情况,failurelimit意在加载N张可见区域外的图片,以避免出现这个问题.
    });
};

var winHeight = $(window).height(); //获取当前页面高度
$(window).resize(function () {
    var thisHeight = $(this).height();
    if (winHeight - thisHeight > 50) {
        //当软键盘弹出，在这里面操作
        $('.assessSubC').hide();
    } else {
        //当软键盘收起，在此处操作
        $('.assessSubC').show();
    }
});