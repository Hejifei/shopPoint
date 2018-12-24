'use strict';

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
    $('.order_content').css('visibility', 'visible');

    var redundId = getUrl(location.href).redundId;
    var subOrderNo = getUrl(location.href).subOrderNo;
    var orderNo = getUrl(location.href).orderNo;

    $(".assessSubC a").click(function () {
        $('.required').each(function () {
            if ($(this).val() === '') {
                layer.open({
                    content: $(this).siblings('label').text() + '不能为空！',
                    btn: '我知道了'
                });
                throw "";
            }
        });

        var param = {
            url: "get/shop/order/commitBuyerLogisticsInfo",
            type: "",
            data: {
                redundId: redundId,
                subOrderNo: subOrderNo,
                logisticsNo: $('.logisticsNo').val(),
                logisticsCompany: $('.logisticsCompany').val()
            }
        };
        ajaxJS(param, function (res) {
            layer.closeAll();
            if (res.code === '0') {
                location.href = './order_detail.html?orderNo=' + orderNo + '&orderType=5&subOrderNo=' + subOrderNo;
            }
            layer.open({
                content: res.msg,
                skin: 'msg',
                time: 2 //2秒后自动关闭
            });
        }, function (error) {
            layer.open({
                content: error.msg,
                skin: 'msg',
                time: 2 //2秒后自动关闭
            });
        });
    });
});

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