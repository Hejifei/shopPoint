let shopId = '';
$(function(){
    if(!isWechat){
        // 顶部高度计算
        $('.navigation').css({
            'height':((90+statusBarHeight)/75).toFixed(4)+'rem',
            'padding-top':((statusBarHeight)/75).toFixed(4)+'rem',
        })
        $('.shopinfo').css({
            'padding-top':((90+statusBarHeight)/75).toFixed(4)+'rem',
        })
    }
    $('.navigation').css('visibility','visible');
    shopId = getUrl(location.href).shopId;
    shopInfoGet();
})


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

const shopInfoGet = ()=>{
    var param = {
        url: "get/shop/goods/getShopInfo",
        type: "",
        data: {
            shopId:shopId
        }
    };
    ajaxJS(param, res => {
        $('.navigation span').text(res.data.shopName)
        if(res.data.introduce !== null && res.data.introduce !== ''){
            $('.shopinfo').html(res.data.introduce);
        }else{
            $('.shopinfo').html(`<img src="../images/general_none1.png" />`);
        }
        $('.shopinfo').addClass('opacity');
        $('.shopinfo a').click(function(e){
            sessionStorage.setItem('newurl', $(this).attr('href'))
			sessionStorage.setItem('newurlname', $(this).text())
			location.href = './shopnweUrl.html'
            if ( e && e.preventDefault ){
                e.preventDefault(); 
            }else {
                window.event.returnValue = false; 
            }   
        })
        $(document).attr("title",res.data.shopName);
    }, error => {
        layer.open({
            content: error.msg
            , skin: 'msg'
            , time: 2 //2秒后自动关闭
        })
    })
}