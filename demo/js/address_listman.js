'use strict';

$(function () {
    if (!isWechat) {
        // 顶部高度计算
        $('.navigation').css({
            'height': ((90 + statusBarHeight) / 75).toFixed(4) + 'rem',
            'padding-top': (statusBarHeight / 75).toFixed(4) + 'rem'
        });
        $('.address_box').css({
            'padding-top': ((90 + statusBarHeight) / 75).toFixed(4) + 'rem'
        });
    }
    $('.navigation').css('visibility', 'visible');

    listAddressInfo();

    // 默认地址选择
    $('.addressList').delegate('.checksel', 'click', function () {
        if ($(this).hasClass('checkseled')) {
            $(this).removeClass('checkseled');
            $(this).find('input').prop('checked', false);
        } else {
            $(this).addClass('checkseled');
            $(this).find('input').prop('checked', true);
        }
    });
    // 删除
    $('.bottomBtn').click(function () {
        var deletList = [];
        $('.addressList .checksel').each(function () {
            if ($(this).find('input').is(':checked')) {
                deletList.push($(this).attr('addressId'));
            }
        });
        if (deletList.length === 0) {
            layer.open({
                content: '请选择要删除的地址!',
                skin: 'msg',
                time: 2 //2秒后自动关闭
            });
            throw '';
        }
        tiansLayer({
            title: '提示',
            content: '是否确认删除？',
            btn: ['确认', '取消'],
            yes: function yes() {
                // 提示框关闭公共方法
                tiansLayerClose();
                var param = {
                    url: "get/shop/user/deleteAddress",
                    type: "",
                    data: {
                        ids: deletList
                    }
                };
                ajaxJS(param, function (res) {
                    listAddressInfo();
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
            }
        });
    });
});

// 收货地址列表
function listAddressInfo() {
    var param = {
        url: "get/shop/user/listAddressInfo",
        type: "",
        data: {
            memId: memidGet()
        }
    };
    ajaxJS(param, function (res) {
        // addresslist = res.data;
        if (res.data.length > 0) {
            var addlist = '';
            for (var i in res.data) {
                addlist += '\n                <div class="addleft checksel opacity" addressId=\'' + res.data[i].addressId + '\'>\n                    <input type="checkbox" name=\'adddelsel\' addressId=\'' + res.data[i].addressId + '\'/>\n                    <div class="d-flex flex-space-betweeen">\n                        <div class="flex-name">\n                            <div class="max-width-150">' + res.data[i].consignee + '</div>\n                            ' + (res.data[i].defaultStatus == 1 ? '<div class="normal">默认</div>' : '') + '\n                        </div>\n                        <div>' + res.data[i].phone + '</div>\n                    </div>                       \n                    <div class="addline">' + res.data[i].area + ' ' + res.data[i].detailAddress + '</div>                  \n                </div>\n                ';
            }
            $('.addressList').html(addlist);
        } else {
            $('.addressList').html('<div class="noaddress opacity">你还没有收货地址，快去添加收货地址吧！</div>');
        }
    }, function (error) {
        layer.open({
            content: error.msg,
            skin: 'msg',
            time: 2 //2秒后自动关闭
        });
    });
}