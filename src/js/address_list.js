let addresslist = '';
$(function(){
    if(!isWechat){
        // 顶部高度计算
        $('.navigation').css({
            'height':((90+statusBarHeight)/75).toFixed(4)+'rem',
            'padding-top':((statusBarHeight)/75).toFixed(4)+'rem',
        })
        $('.address_box').css({
            'padding-top':((90+statusBarHeight)/75).toFixed(4)+'rem',
        })
    }
    $('.navigation').css('visibility','visible');

    // 默认地址选择
    $('.addressList').delegate('.ifcheck','click',function(){
        $('.checkseled').removeClass('checkseled');
        $(this).addClass('checkseled');
        $(this).find('input').prop('checked',true);
        let addsel = Number($(this).find('input').attr('addressId'));
        let addresInfo = addresslist.filter((val)=>{
            if(val.addressId === addsel){
               return val;
            }
        })
        if(addresInfo[0].defaultStatus === 1){
            // 如果已经是默认地址，保持不变
        }else{
            Add_defaultset(addsel)
        }
        // 阻止a标签的事件冒泡
        return false;
    })

    // 地址修改
    $('.addressList').delegate('.addright','click',function(){
        localStorage.setItem('balancelist',getUrl(location.href).balancelist);
        localStorage.setItem('orderSumType',getUrl(location.href).orderSumType);
        let addsel = Number($(this).attr('addressId'));
        let addresInfo = addresslist.filter((val)=>{
            if(val.addressId === addsel){
               return val;
            }
        })
        localStorage.setItem('adsEdit',JSON.stringify(addresInfo[0]));
        if(getUrl(location.href).balancelist !== undefined && getUrl(location.href).orderSumType !== undefined){
            location.href='./address_add.html?addressId='+addsel+'&balancelist='+getUrl(location.href).balancelist+'&orderSumType='+getUrl(location.href).orderSumType+'&htmlfont='+$('html').css('font-size');
        }else{
            location.href='./address_add.html?addressId='+addsel+'&htmlfont='+$('html').css('font-size');
        }
        
        // 阻止a标签的事件冒泡
        return false;
    })

    
    listAddressInfo();
    

    // 如果是选择收货地址
    let orderSumType = getUrl(location.href).orderSumType;
    if(orderSumType !== undefined){
        let balancelist = (getUrl(location.href).balancelist).split(',');
        $('.addressList').delegate('.row','click',function(){
            location.href = './order_submit.html?balancelist='+balancelist+'&orderSumType='+orderSumType+'&addressid='+$(this).attr('addressid');
        })
        $('.bottomBtn a').attr('href','./address_add.html?balancelist='+balancelist+'&orderSumType='+orderSumType);
    }else{
        $('.bottomBtn a').attr('href','./address_add.html');
    }


    // 修改新增地址链接添加字体大小 兼容安卓
    if(getUrl(location.href).balancelist !== undefined && getUrl(location.href).orderSumType !== undefined){
        $('.bottomBtn a').attr('href','./address_add.html?htmlfont='+$('html').css('font-size')+'&balancelist='+getUrl(location.href).balancelist+'&orderSumType='+getUrl(location.href).orderSumType)
    }else{
        $('.bottomBtn a').attr('href','./address_add.html?htmlfont='+$('html').css('font-size'))
    }
    

    var isPageHide = false
    // 兼容ios返回不刷新的问题
    window.addEventListener('pageshow', function() {
        if (isPageHide) {
        window.location.reload()
        }
    })
    window.addEventListener('pagehide', function() {
        isPageHide = true
    })
})

function goback(){
    if(getUrl(location.href).orderSumType !== undefined){
        // 若选择地址 则返回按钮 返回之前页面
        window.history.go(-1)
    }else{
        window.location.href = './person_center.html';

    }
}

// 收货地址列表
function listAddressInfo(){
    var param = {
        url: "get/shop/user/listAddressInfo",
        type: "",
        data: {
            memId:memidGet(),
        }
    };
    ajaxJS(param, res => {
        addresslist = res.data;
        if(res.data.length > 0){
            $('.navright').show();
            let addlist = '';
            for(let i in res.data){
                addlist += `
                <li class="row opacity" addressId='${res.data[i].addressId}'>
                    <div class="addleft">
                        <div class="d-flex flex-space-betweeen">
                            <div class="flex-name">
                                <div class="max-width-150">${res.data[i].consignee}</div>
                                ${res.data[i].defaultStatus == 1 ? '<div class="normal">默认</div>' : ''}
                            </div>
                            <div>${res.data[i].phone}</div>
                        </div>                       
                        <div class="addline">${res.data[i].area} ${res.data[i].detailAddress}</div>
                        <label class="ifcheck checksel ${res.data[i].defaultStatus==1?'checkseled':''}">设为默认<input type="radio" ${res.data[i].defaultStatus===1?'checked':''}  name="addsel" addressId='${res.data[i].addressId}' /></label>
                    </div>
                    <a addressId='${res.data[i].addressId}' class="addright"><img src="../images/personal_edit.png"/></a>
                </li>
                `
            }
            $('.addressList ul').html(addlist);
        }else{
            $('.navright').hide();
            $('.addressList ul').html('<div class="noaddress opacity">你还没有收货地址，快去添加收货地址吧！</div>');
        }
    }, error => {
        layer.open({
            content: error.msg
            , skin: 'msg'
            , time: 2 //2秒后自动关闭
        })
    })
}

const Add_defaultset = (addressId)=>{
    var param = {
        url: "get/shop/user/setDefaultAddress",
        type: "",
        data: {
            addressId:addressId
        }
    };
    
    ajaxJS(param, res => {
        listAddressInfo();
        tiansLayer({
            title:'提示',
            content: res.msg,
            btn: ['我知道了'],
            yes: function() {
              // 提示框关闭公共方法
              tiansLayerClose();
            }
        });
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