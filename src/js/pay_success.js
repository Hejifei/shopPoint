

$(function(){
    if(sessionStorage.paytype === '9'){
        if ((!isWechat) && isAndroid) {
            window.android.isShowSubTitle(false)
        } else if((!isWechat) && isiOS) {
            window.webkit.messageHandlers.isShowSubTitle.postMessage(false)
        }
    }
    if(!isWechat){
        $('.payC_body').css({
            'padding-top':((133+statusBarHeight)/75).toFixed(4)+'rem',
        })
    }
    $('.payC_body').css('visibility','visible');
    let payinfo =JSON.parse(sessionStorage.payinfo);
    let paymoney = JSON.parse(sessionStorage.payMoney);
    $('.payMoney').text(paymoney.totalAmount);
    $('.payScore').text(paymoney.totalIntegral);
    $('.payName').text(payinfo.goodsname);
    $('.payNo').text(payinfo.orderNo);
    if(payinfo.deliveryList.indexOf('0') === -1){
        $('.pay_btnC a').attr('href','./order_all.html?type=2')
    } 
})