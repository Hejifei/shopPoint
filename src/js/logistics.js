let orderNo = '';
let logisticsNo = '';
$(function(){
    $('.navigation').css({
        'height':((90+statusBarHeight)/75).toFixed(4)+'rem',
        'padding-top':((statusBarHeight)/75).toFixed(4)+'rem',
    })
    $('.log_box').css({
        'padding-top':((90+statusBarHeight)/75).toFixed(4)+'rem',
    })
    $('.navigation').css('visibility','visible');
    orderNo = getUrl(location.href).orderNo;
    logisticsNo = getUrl(location.href).logisticsNo;
    getLogisticsInfo();
})

const getLogisticsInfo = ()=>{
    var param = {
        url: "get/shop/order/getLogisticsInfo",
        type: "",
        data: {
            orderId:orderNo,
            logisticsNo:logisticsNo === undefined ? '' : logisticsNo,
        }
    };
    ajaxJS(param, res => {
        if(res.code==='0'){
            let logistlistarr = '';
            if(res.data !== null && res.data.length !== 0){
                for(let i in res.data){
                    logistlistarr +=`
                    <li class="item">
                        <div class="biao">
                            ${Number(i) === 0 ? '<img src="../images/quan.png" alt="">' : '<span class="graycircle"></span>'}
                        </div>
                        <div class="info ${Number(i) === 0 ? 'active' : ''}">
                            <div class="time">${res.data[i].date}</div>
                            <div class="message">${res.data[i].logisticsInfo}</div>
                        </div>
                    </li>
                    `
                }
            }else{
                logistlistarr ='<div class="norecord">暂无物流信息，敬请期待！</div>'
            }
            $('.items').html(logistlistarr)
        }else{
            layer.open({
                content: res.msg
                , skin: 'msg'
                , time: 2 //2秒后自动关闭
            })
        }
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