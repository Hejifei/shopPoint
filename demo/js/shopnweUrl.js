'use strict';

$(function () {
    if (!isWechat) {
        // 顶部高度计算
        $('.navigation').css({
            'height': ((90 + statusBarHeight) / 75).toFixed(4) + 'rem',
            'padding-top': (statusBarHeight / 75).toFixed(4) + 'rem'
        });
        $('.shopinfo').css({
            'padding-top': ((90 + statusBarHeight) / 75).toFixed(4) + 'rem'
        });
        $('.newurl_ifr').css('height', "-webkit-calc(100vh - " + ((92 + statusBarHeight) / 75).toFixed(4) + "rem)");
    }
    $('.navigation').css('visibility', 'visible');
    $('.newurl_ifr').attr('src', sessionStorage.newurl);
    $('.navigation span').text(sessionStorage.newurlname == null || sessionStorage.newurlname == undefined || sessionStorage.newurlname == '' ? '天狮商城' : sessionStorage.newurlname);
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