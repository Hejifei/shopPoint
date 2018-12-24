let goodsid ='';
let queryData = {
    goodsId:goodsid,
    page:1,
    pageSize:10,
    commentType:0,
}


$(function(){
    // 下拉刷新成功事件
	function reloadinit(){
		queryData.page = 1;
        CommentsGet(queryData)
	}
	// 上拉加载成功事件
	const pullloadfun = ()=>{
        if(queryData.page <= (totalpages-1)){
            queryData.page++;
            CommentsGet(queryData);
        }
	}
	// 下拉刷新、上拉加载初始化方法
	tianscrollinit(reloadinit,pullloadfun)

    if(!isWechat){
        // 顶部高度计算
        $('.navigation').css({
            'height':((90+statusBarHeight)/75).toFixed(4)+'rem',
            'padding-top':((statusBarHeight)/75).toFixed(4)+'rem',
        })
        $('.common_classify').css({
            'top':((90+statusBarHeight)/75).toFixed(4)+'rem',
        })
        $('.comment_box').css({
            'padding-top':((190+statusBarHeight)/75).toFixed(4)+'rem',
        })
    }
    $('.navigation').css('visibility', 'visible')
    $('.comment_box').css('visibility', 'visible')
    
    goodsid = getUrl(location.href).goodsid;
    queryData.goodsId = goodsid;
    CommentsGet(queryData);
    $('.common_classify ul li').click(function(){
        $('.active').removeClass('active');
        $(this).addClass('active');
        queryData = {
            goodsId:goodsid,
            page:1,
            pageSize:10,
            commentType:$(this).attr('commentType'),
        };
        CommentsGet(queryData);
    })
    
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

// 获取评价列表
const CommentsGet = (dataquery)=>{
    var param = {
        url: "get/shop/goods/listAllComments",
        type: "",
        data: dataquery
    };
    ajaxJS(param, res => {
        $('.common_classify ul li:eq(0) .number').text(res.data.allComment);
        $('.common_classify ul li:eq(1) .number').text(res.data.goodComment);
        $('.common_classify ul li:eq(2) .number').text(res.data.badCommnet);
        $('.common_classify ul li:eq(3) .number').text(res.data.chaseComment);
        
        let arrlist = '';
        if(res.data.commentInfo !== null){
            totalpages = res.data.commentInfo.pages;
            for(let i in res.data.commentInfo.list){

                // 评价第一次
                arrlist +=`
                <div class="common_item">
                    <div class="common">
                        <div class="user_info">
                            <div class="head_img">
                                <img src="${res.data.commentInfo.list[i].memImage === null ? '../images/personal_dehead.png' : res.data.commentInfo.list[i].memImage}" alt="">
                            </div>
                            <div class="nike">
                                <span>${res.data.commentInfo.list[i].memAccount}</span>
                            </div>
                            <div class="rank">
                                <span>${(res.data.commentInfo.list[i].memGradeLevel).substr(0,1)}</span>
                            </div>
                            <div class="date">${Format(res.data.commentInfo.list[i].createTime)}</div>
                            <div class="like">
                                <img src="${ res.data.commentInfo.list[i].commentLevel === 0 ? '../images/shop_hp.png' : '../images/shop_cp.png'}" alt="">
                            </div>
                        </div>
                        <div class="common_conent">${res.data.commentInfo.list[i].commentEvaluate}</div>
                    </div>`
                // <!-- 追评 -->
                if(res.data.commentInfo.list[i].commentType === 1){
                    arrlist +=`
                    <div class="back">
                        <div class="back_title">
                            <span>用户${res.data.commentInfo.list[i].superaddition}天后追评</span>
                        </div>
                        <div class="back_conent">${res.data.commentInfo.list[i].chaseCommentEvaluate}</div>
                    </div>`
                } 
                if(res.data.commentInfo.list[i].reply !== null){
                    arrlist +=`
                    <div class="back">
                        <div class="back_title">
                            <span>商家回复</span>
                        </div>
                        <div class="back_conent">${res.data.commentInfo.list[i].reply}</div>
                    </div>`
                } 
                
                arrlist +=`</div>`
            }
        }else{
            arrlist +=`<div class='noassess'>暂无评价，快去购买评价吧！</div>`;
        }

        if(dataquery.page === 1){
            // 如果是第一页清空div
            $('.common_content').html(arrlist);
        }else{
            $('.common_content').append(arrlist);
        }
        // Imglazy()
        // 下拉刷新成功回调
        tianscrolsuccFun();
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

const Format = function (timestamp ) {
    var date = new Date(timestamp);//时间戳为10位需*1000，时间戳为13位的话不需乘1000
    let Y = date.getFullYear();
    let M = date.getMonth()+1 ;
    let D = date.getDate();
    let h = date.getHours();
    let m = date.getMinutes();
    let s = date.getSeconds();
    return Y+'-'+size2(M)+'-'+size2(D)+ ' '+size2(h)+':'+size2(m)+':'+size2(s);
}

const size2 = (val)=>{
    if(val < 10){
        return '0'+val;
    }else{
        return val;
    }

}