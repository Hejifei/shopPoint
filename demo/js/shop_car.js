'use strict';

// $.init()
var totalpages = 1;
var loading = false;
var arrChecked = [];

$(function () {
	if (!isWechat) {
		// 顶部高度计算
		$('.navigation').css({
			height: ((90 + statusBarHeight) / 75).toFixed(4) + 'rem',
			'padding-top': (statusBarHeight / 75).toFixed(4) + 'rem'
		});
		$('.shop_box ').css({
			'padding-top': ((90 + statusBarHeight) / 75).toFixed(4) + 'rem'
		});
	}
	$('.navigation').css('visibility', 'visible');

	var isPageHide = false;
	// 兼容ios返回不刷新的问题
	window.addEventListener('pageshow', function () {
		if (isPageHide) {
			window.location.reload();
		}
	});
	window.addEventListener('pagehide', function () {
		isPageHide = true;
	});

	if (localStorage.token !== undefined && localStorage.scMemId !== undefined) {

		// 下拉刷新成功事件
		var reloadinit = function reloadinit() {
			shopcarlistGet();
			goodspreferGet();
		};
		// 下拉刷新、上拉加载初始化方法


		tianscrollinit(reloadinit, '');
		// 获取购物车数据
		shopcarlistGet();
		// 获取推荐商品
		goodspreferGet();
	} else {
		if (isWechat) {
			location.href = h5loginurl;
		} else if (isAndroid) {
			window.android.mustLogin();
		} else {
			// ios
			window.webkit.messageHandlers.mustLogin.postMessage(null);
		}
		throw '';
	}

	// 店铺勾选
	$('.shop_content').delegate('.shopSel', 'click', function () {
		if ($(this).hasClass('checkseled')) {
			$(this).removeClass('checkseled');
			// 取消该店的所有商品选中
			$(this).parents('.item').find('.checksel').removeClass('checkseled');
			$(this).parents('.item').find('.checksel input').prop('checked', false);
			$(this).parents('.item').find('.item_content').each(function () {
				var indexEle = arrChecked.indexOf($(this).find('.item_select input').attr('cartid'));
				arrChecked.splice(indexEle, 1);
			});
		} else {
			$(this).addClass('checkseled');
			// 该店的所有商品选中
			$(this).parents('.item').find('.checksel').addClass('checkseled');
			$(this).parents('.item').find('.checksel input').prop('checked', true);
			$(this).parents('.item').find('.item_content').each(function () {
				if (arrChecked.indexOf($(this).find('.item_select input').attr('cartid')) === -1) {
					arrChecked.push($(this).find('.item_select input').attr('cartid'));
				}
			});
		}
		checkshopsAllsel();
		// 购物车金额计算
		shopcarMoneysum();
	});
	//商品勾选
	$('.shop_content').delegate('.checksel', 'click', function () {
		var ele = $(this).find('input').attr('cartid');
		if ($(this).hasClass('checkseled')) {
			$(this).find('input').prop('checked', false);
			$(this).removeClass('checkseled');
			if (ele !== undefined) {
				var indexEle = arrChecked.indexOf(ele);
				arrChecked.splice(indexEle, 1);
			}
		} else {
			$(this).find('input').prop('checked', true);
			$(this).addClass('checkseled');
			if (ele !== undefined && arrChecked.indexOf(ele) === -1) {
				arrChecked.push(ele);
			}
		}
		// 判定店铺是否勾选
		var ifAllsel = true;
		$(this).parents('.item').find('.item_content').each(function () {
			if ($(this).find('.checksel').length !== 0 && !$(this).find('.checksel input').prop('checked')) {
				ifAllsel = $(this).find('.checksel input').prop('checked');
			}
		});
		// 若子节点全部选中，则勾选店铺
		if (ifAllsel) {
			$(this).parents('.item').find('.item_top .checksel').addClass('checkseled');
			$(this).parents('.item').find('.item_top .checksel input').prop('checked', true);
		} else {
			$(this).parents('.item').find('.item_top .checksel').removeClass('checkseled');
			$(this).parents('.item').find('.item_top .checksel input').prop('checked', false);
		}
		// 购物车金额计算
		shopcarMoneysum();
		// 判定顶部的全选是否勾选
		checkshopsAllsel();
	});
	// 全选
	$('.all_select .checksel').click(function () {
		if ($(this).hasClass('checkseled')) {
			$(this).removeClass('checkseled');
			$('.shop_content').find('input').each(function () {
				$(this).prop('checked', false);
			});
			$('.shop_content').find('.checksel').each(function () {
				$(this).removeClass('checkseled');
			});
			arrChecked = [];
		} else {
			$(this).addClass('checkseled');
			$('.shop_content').find('input').each(function () {
				$(this).prop('checked', true);
				if (arrChecked.indexOf($(this).attr('cartid')) === -1 && $(this).attr('cartid') !== undefined) {
					arrChecked.push($(this).attr('cartid'));
				}
			});
			$('.shop_content').find('.checksel').each(function () {
				$(this).addClass('checkseled');
			});
		}
		// 购物车金额计算
		shopcarMoneysum();
	});
	// 数量添加
	$('.shop_content').delegate('.numchange', 'click', function (event) {
		var num = Number($(this).siblings('.select_num').text());
		var productstock = Number($(this).siblings('.select_num').attr('productstock'));
		if ($(this).hasClass('add')) {
			if (num <= productstock - 1) {
				num++;
				GoodsInCartChange($(this).siblings('.select_num').attr('cartId'), num);
			} else if (num >= productstock) {
				layer.open({
					content: '商品库存不足，无法购买！',
					skin: 'msg',
					time: 2 //2秒后自动关闭
				});
			}
		} else if ($(this).hasClass('min')) {
			if (num > 0) {
				num--;
				GoodsInCartChange($(this).siblings('.select_num').attr('cartId'), num);
				if (num === 0) {
					$(this).parents('.item_content').remove();
					shopremove();
				}
			}
		}
		$(this).siblings('.select_num').text(num);
		// 下拉刷新，判定店铺下的商品是否全选，若商品全选则店铺被勾选
		checkshopsel();
		// 判定是否全选
		checkshopsAllsel();
		// 购物车金额计算
		shopcarMoneysum();
		// 阻止a标签的事件冒泡
		return false;
	});

	// 为你推荐 加入购物车
	$('.home_content_content').delegate('.add', 'click', function (ev) {
		ev.preventDefault();
		if (localStorage.token === undefined || localStorage.scMemId === undefined) {
			if (isWechat) {
				location.href = h5loginurl;
			} else if (isAndroid) {
				window.android.mustLogin();
			} else {
				// ios
				window.webkit.messageHandlers.mustLogin.postMessage(null);
			}
			throw '';
		}
		// 加入购物车
		addtoShopCar($(this).attr('goodsid'));
	});

	// 为你推荐默认隐藏 然后再加载
	setTimeout(function () {
		$('.home_content_title').css('visibility', 'visible');
	}, 300);
	// 定时下拉加载文字及小狮子页面加载一秒钟后显示
	setTimeout(function () {
		$('.top-tip').show();
	}, 1000);
});

// 勾选商品时，判定店铺是否全选
function checkshopsel() {
	$('.shop_content .item').each(function () {
		var isshopnowselsll = true;
		$(this).find('.item_content').each(function () {
			if (!$(this).find('.checksel input').prop('checked')) {
				isshopnowselsll = false;
			}
		});
		if (isshopnowselsll) {
			$(this).find('.item_top .checksel').addClass('checkseled');
			$(this).find('.item_top .checksel input').prop('checked', true);
		}
	});
}
// 是否选中底部全选
function checkshopsAllsel() {
	// 判定顶部的全选是否勾选
	var ifShopAllsel = true;
	$('.shop_content').find('.item_top .shopSel input').each(function () {
		if (!$(this).prop('checked')) {
			ifShopAllsel = $(this).prop('checked');
		}
	});
	// 若所有店铺全部选中，则勾选底部全选
	if (ifShopAllsel) {
		$('.all_select .checksel').addClass('checkseled');
	} else {
		$('.all_select .checksel').removeClass('checkseled');
	}
}

// 购物车列表
var shopcarlistGet = function shopcarlistGet() {
	var param = {
		url: 'get/shop/order/listShopCart',
		type: '',
		data: {
			memId: memidGet()
		}
	};
	ajaxJS(param, function (res) {
		var arrlist = '';
		if (res.data.length > 0) {
			for (var i in res.data) {
				// 对下架商品排序在最后
				res.data[i].product.sort(function (a, b) {
					a.undercarriage = a.undercarriage === undefined ? 0 : a.undercarriage;
					b.undercarriage = b.undercarriage === undefined ? 0 : b.undercarriage;
					return a.undercarriage - b.undercarriage;
				});
				arrlist += '\n                <div class="item opacity">\n                    <div class="item_top">\n                        <div class="shopSel checksel"><input type="checkbox"/></div>\n                        <a href=\'./shop.html?shopId=' + res.data[i].shopId + '\'><span>' + res.data[i].shopName + '</span><img src="../images/general_next.png" alt=""></a>\n                    </div>\n                ';
				for (var j in res.data[i].product) {
					arrlist += '\n                    <div class="item_content">\n\t\t\t\t\t\t<div class="item_select checksel ' + (arrChecked.indexOf(String(res.data[i].product[j].cartId)) !== -1 ? 'checkseled' : '') + '" >\n\t\t\t\t\t\t<input type="checkbox" cartId=\'' + res.data[i].product[j].cartId + '\'\n\t\t\t\t\t\t\t' + (arrChecked.indexOf(String(res.data[i].product[j].cartId)) !== -1 ? 'checked' : '') + '\n\t\t\t\t\t\t undercarriage=\'' + res.data[i].product[j].undercarriage + '\' /></div>\n                        <a class="row" href="shop_detail.html?id=' + res.data[i].product[j].goodsId + '">\n                            <div class="item_img">\n                                <img class="lazy" data-original="' + res.data[i].product[j].goodsImageUrl + '">\n                            </div>\n                            <div class="item_detail">\n                                <div class="title">' + res.data[i].product[j].goodsName + '</div>\n                                <div class="specification">' + res.data[i].product[j].productName + '</div>\n                                <div class="option">\n                                    ' + (res.data[i].product[j].undercarriage === 1 ? '<div class="paice">￥' + res.data[i].product[j].amount + '</div>' : '') + '\n                                    ' + (res.data[i].product[j].integralAmount !== null && res.data[i].product[j].integralAmount !== '0.00' && res.data[i].product[j].integralAmount !== '0' && res.data[i].product[j].undercarriage === 1 ? '<div class="record">+积分:' + parseInt(res.data[i].product[j].integralAmount) + '</div>' : '') + '\n                                    ' + (res.data[i].product[j].undercarriage === 1 ? '' : '<div class="paice"><div class="nogoods">已售罄</div></div>') + '\n                                    <div class="add ' + (res.data[i].product[j].undercarriage === 1 ? '' : 'hide') + '">\n                                        <div class="numchange ' + (res.data[i].product[j].undercarriage === 1 ? 'min' : 'nochange') + '">\n                                            <img src="' + (res.data[i].product[j].undercarriage === 1 ? '../images/shop_min.png' : '../images/shop_min_g.png') + '" alt="">\n                                        </div>\n                                        <div class="select_num" \n                                            productId=\'' + res.data[i].product[j].productId + '\'\n                                            productStock=\'' + res.data[i].product[j].productStock + '\' \n                                            cartId=\'' + res.data[i].product[j].cartId + '\' \n                                            price=\'' + res.data[i].product[j].amount + '\' \n                                            integralAmount=\'' + (res.data[i].product[j].integralAmount === null || res.data[i].product[j].integralAmount === undefined ? '0' : parseInt(res.data[i].product[j].integralAmount)) + '\' >' + (res.data[i].product[j].undercarriage === 1 ? res.data[i].product[j].number : 0) + '</div>\n                                        <div class="numchange ' + (res.data[i].product[j].undercarriage === 1 ? 'add' : 'nochange') + '">\n                                            <img src="' + (res.data[i].product[j].undercarriage === 1 ? '../images/shop_plus.png' : '../images/shop_plus_g.png') + '" alt="">\n                                        </div>\n                                    </div>\n                                </div>\n                            </div>\n                        </a>\n                    </div>\n                    ';
				}
				arrlist += '</div>';
			}
		} else {
			arrlist += '<div class="shopcarnone">\u8D2D\u7269\u8F66\u6682\u65E0\u5546\u54C1\uFF0C\u5FEB\u53BB\u6DFB\u52A0\u5427\uFF01</div>';
		}

		$('.shop_content').html(arrlist);
		$('.nomore').show();

		$('.shop_content .item').each(function () {
			if ($(this).find('.item_content').length === 0) {
				$(this).remove();
			}
		});
		tianscrolsuccFun();
		shopcarMoneysum();
		Imglazy();

		// 下拉刷新，判定店铺下的商品是否全选，若商品全选则店铺被勾选
		checkshopsel();
		// 判定是否全选
		checkshopsAllsel();
		// 购物车金额计算
		shopcarMoneysum();
		setTimeout(function () {
			$('.homeModel').hide();
		}, 1000);
	}, function (error) {
		layer.open({
			content: error.msg,
			skin: 'msg',
			time: 2 //2秒后自动关闭
		});
	});
};

var Imglazy = function Imglazy() {
	$('img.lazy').lazyload({
		placeholder: '../images/shop_nopic.png', //用图片提前占位
		// placeholder,值为某一图片路径.此图片用来占据将要加载的图片的位置,待图片加载时,占位图则会隐藏
		effect: 'fadeIn', // 载入使用何种效果
		// effect(特效),值有show(直接显示),fadeIn(淡入),slideDown(下拉)等,常用fadeIn
		threshold: 20, // 提前开始加载
		// threshold,值为数字,代表页面高度.如设置为200,表示滚动条在离目标位置还有200的高度时就开始加载图片,可以做到不让用户察觉
		// event: 'sporty',  // 事件触发时才加载
		// event,值有click(点击),mouseover(鼠标划过),sporty(运动的),foobar(…).可以实现鼠标莫过或点击图片才开始加载,后两个值未测试…
		container: $('.content >div'), // 对某容器中的图片实现效果
		// container,值为某容器.lazyload默认在拉动浏览器滚动条时生效,这个参数可以让你在拉动某DIV的滚动条时依次加载其中的图片
		failurelimit: 20, // 图片排序混乱时
		// failurelimit,值为数字.lazyload默认在找到第一张不在可见区域里的图片时则不再继续加载,但当HTML容器混乱的时候可能出现可见区域内图片并没加载出来的情况,failurelimit意在加载N张可见区域外的图片,以避免出现这个问题.
		skip_invisible: false
	});
};

// 加入购物车
var addtoShopCar = function addtoShopCar(goodsId) {
	var param = {
		url: 'get/shop/order/addToShoppingCart',
		type: '',
		data: {
			memId: memidGet(),
			number: 1,
			goodsId: goodsId
		}
	};
	ajaxJS(param, function (res) {
		layer.open({
			content: res.msg,
			skin: 'msg',
			time: 2 //2秒后自动关闭
		});
		shopcarlistGet();
	}, function (error) {
		layer.open({
			content: error.msg,
			skin: 'msg',
			time: 2 //2秒后自动关闭
		});
	});
};

// 购物车添加数量
var GoodsInCartChange = function GoodsInCartChange(cartId, num) {
	var param = {
		url: 'get/shop/order/addGoodsInCart',
		type: '',
		data: {
			cartId: cartId,
			number: num
		}
	};
	ajaxJS(param, function (res) {}, function (error) {
		layer.open({
			content: error.msg,
			skin: 'msg',
			time: 2 //2秒后自动关闭
		});
	});
};

// 为你推荐列表获取
var goodspreferGet = function goodspreferGet() {
	var param = {
		url: 'get/shop/goods/preferencesGoods',
		type: '',
		data: {
			memId: memidGet()
		}
	};
	ajaxJS(param, function (res) {
		var arrlist = '';
		if (res.data.length > 0) {
			arrlist += '<ul>';
			for (var i in res.data) {
				arrlist += '\n                <li class="opacity">\n                    <a href="shop_detail.html?id=' + res.data[i].goodsId + '">\n                        <div class="img">\n\t\t\t\t\t\t\t<div><img class="lazy" data-original="' + res.data[i].imageUrl + '" alt=""></div>\n                        </div>\n                        <div class="detail">\n                            <div class="title">' + res.data[i].goodsName + '</div>\n                            <div class="more">\n                                <div class="price">\xA5 ' + res.data[i].showPrice + '</div>\n                                ' + (res.data[i].integralPrice === 0 ? '' : '<div class="score">+积分:' + res.data[i].integralPrice + '</div>') + '\n                                <div class="add" goodsid=\'' + res.data[i].goodsId + '\'><img src="../images/main_add.png" alt=""></div>\n                            </div>\n                        </div>\n                    </a>\n                </li>\n                ';
			}
			arrlist += '</ul>';
		} else {
			arrlist += '<div class="shopregistnone">\u6682\u65E0\u63A8\u8350\u5546\u54C1\uFF01</div>';
		}
		$('.home_content_content').html(arrlist);
		Imglazy();
		// 下拉刷新成功回调
		// tianscrolsuccFun()
		setTimeout(function () {
			$('.homeModel').hide();
		}, 1000);
	}, function (error) {
		layer.open({
			content: error.msg,
			skin: 'msg',
			time: 2 //2秒后自动关闭
		});
		setTimeout(function () {
			$('.homeModel').hide();
		}, 1000);
	});
};

// 购物车金额计算公共方法
var shopcarMoneysum = function shopcarMoneysum() {
	var allmoney = 0;
	var allscore = 0;
	$('.shop_content .item_content .checksel input').each(function () {
		if ($(this).prop('checked')) {
			var select_num = $(this).parents('.item_content').find('.select_num');
			allmoney += Number(select_num.attr('price')) * Number(select_num.text());
			allscore += Number(select_num.attr('integralAmount')) * Number(select_num.text());
		}
	});

	$('.number_all').text('\uFFE5' + allmoney.toFixed(2) + '+' + allscore + '\u5206');
	$('.account .number').addClass('opacity');
};

// 去结算
var balance = function balance() {
	var balancelist = [];
	var validatelist = [];
	// undercarriage 1上架 2下架
	var ifundercarriage = 1;
	$('.shop_content .item_content .checksel input').each(function () {
		if ($(this).prop('checked') && $(this).attr('undercarriage') === '1') {
			balancelist.push($(this).attr('cartId'));
			validatelist.push({
				productId: $(this).parents('.item_content').find('.select_num').attr('productId'),
				number: $(this).parents('.item_content').find('.select_num').text()
			});
		} else if ($(this).prop('checked') && $(this).attr('undercarriage') === '2') {
			ifundercarriage = 2;
		}
	});
	// console.log(balancelist)
	if (balancelist.length === 0) {
		if (ifundercarriage === 2) {
			layer.open({
				content: '商品已售罄!',
				skin: 'msg',
				time: 2 //2秒后自动关闭
			});
		} else {
			layer.open({
				content: '请选择要结算的商品！',
				skin: 'msg',
				time: 2 //2秒后自动关闭
			});
		}
		throw '';
	}
	var param = {
		url: 'get/shop/order/validateStock',
		type: '',
		data: validatelist
	};
	ajaxJS(param, function (res) {
		if (res.code === '0') {
			//埋点点击结算
			clicksettlementTracker();
			setTimeout(function () {
				location.href = './order_submit.html?balancelist=' + balancelist + '&orderSumType=1';
			}, 200);
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
};

// 购物车删除
var shopcarDel = function shopcarDel() {
	var balancelist = [];
	$('.shop_content .item_content .checksel input').each(function () {
		if ($(this).prop('checked')) {
			balancelist.push($(this).attr('cartId'));
		}
	});
	if (balancelist.length === 0) {
		layer.open({
			content: '请选择要删除的商品！',
			skin: 'msg',
			time: 2 //2秒后自动关闭
		});
		throw '';
	}

	tiansLayer({
		title: '提示',
		content: '你确定要删除商品吗？',
		btn: ['删除', '取消'],
		yes: function yes() {
			// 提示框关闭公共方法
			tiansLayerClose();
			var param = {
				url: 'get/shop/order/deleteCart',
				type: '',
				data: {
					ids: balancelist
				}
			};
			ajaxJS(param, function (res) {
				if (res.code === '0') {
					$('.all_select .checksel').removeClass('checkseled');
					// 若删除成功，重新获取购物车列表
					shopcarlistGet();
					layer.open({
						content: res.msg,
						skin: 'msg',
						time: 2 //2秒后自动关闭
					});
				}
				// 下拉刷新成功回调
				// tianscrolsuccFun()
			}, function (error) {
				layer.open({
					content: error.msg,
					skin: 'msg',
					time: 2 //2秒后自动关闭
				});
			});
		}
	});
};

// 当店铺没有商品的时候 删除店铺
var shopremove = function shopremove() {
	$('.shop_content .item').each(function () {
		if ($(this).find('.item_content').length === 0) {
			$(this).remove();
		}
	});
};