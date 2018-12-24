

// (jquery)封装Promise对象和ajax过程
// var interfaceUrl = "http://172.16.0.9:8080/tiens-console/"; // 王杰的电脑

// var interfaceUrl = 'http://172.16.0.241:8095/tiens-console/';//赢粉宝接口api测试环境
// var interfaceUrl = 'http://172.16.0.70:8081/tiens-console/';//俞强
// var interfaceUrl = 'http://172.16.0.6:8080/';//吴逸峰

// 测试环境
var interfaceUrl = 'https://h5.tiens.com:8080/tiens-console/';//接口api测试环境
var fileuploadUrl = 'https://picture.tiens.com/picture-console/common/fileUpload'//图片上传地址测试环境
var h5pswurl = 'https://picture.tiens.com';//钱包测试环境
var businessId = 'jfsc201808270001'
// 民生银行 h5 密码控件 测试环境密码控件对应密钥及签名
var RSA_PUBLIC_KEY = "30818702818100B9800F6965ECCDD3621E2DF1974FEDF8B8BFCD5ECF58155DCB279CAA8F8838480B6DFC973752CC678C2A291A799927C08CCD7CB31218DB8B3A5A675C4E83B997F7D0479C3692DD53D52B52C61ECEE4708B1C0F2199001DD298A52BBF5750EDED9F03CA05B19E295D84CFB1798E084458E972A506F6629C4B22509713B9C72F5F020103";
var RSA_PUBLIC_KEY_SIG = "0821AFBC831EA062B9BEC0F0D10EAC5CB53FF6D608DFF1783C24BB6A6A1E650EA6F98ED29DEAC94D436A122AB40514A6985E4130C2115562A9DE0896F612E85ACB9DA5CB49A30BF2653E9CA542BE4B287B5EB37CBD97B045ECD1621E90E542FBA8F394CDA8E752F7AE0F2C83F589F46B3F2121F4D010090FB898514DCB8A5F90";

// // 生产环境
// var interfaceUrl = 'https://wallet.pointswin.com/tiens-console/';//接口api生产环境
// var fileuploadUrl = 'https://photo.pointswin.com/picture-console/common/fileUpload'//图片上传地址生产环境
// var h5pswurl = 'https://wallet.pointswin.com';//钱包生产环境
// var businessId = 'pointsmall001'
// // 民生银行 h5 密码控件 正式环境 密码空间对应密钥及签名
// var RSA_PUBLIC_KEY = "308187028181009BF03D2FC10218A09FED2D4CFB5121E840DAF4CC0F75B06D5944C45AA0A90DBBBEE5392415F0C2BD4492C7DEF7F23ABDD31777495CF585B97D0904B355041EE440E72A4927EB71711E699635908F3A76C5456C64E0D24B1AF3E0E7311E12C880EB6EA42E2A5A2AE77A2581EBD7C3618B44E97DF9EB555EE3098AD2EC5A889001020103"
// var RSA_PUBLIC_KEY_SIG = "94BBFE900BD1E081C28C5A315C66B661B191570AB985EB9B0280DE0C490756AF242769EB671287B429E5C397FEC0DA2A8ED1287B3DA84BF8548EE15365AAD671CBC5CD148433CAC55CDBB4E7A285C43DC926197BA0E7EEBA18482E5F283337D0F080BBF43B583D00219F2450862517548BF7033927961FDD4ABB2A3C6DA39061"


var h5loginurl = h5pswurl+'/tiens-h5/html/login.html'; //积分h5登录页面
var token = UrlParm.parm('token') || localStorage.getItem('token') || '';
var timeNow, nonce
const ajaxJS = function (param, success, failed) {
  // 若没有token或没有用户id直接跳登录
  // alert(localStorage.token === undefined && localStorage.scMemId === undefined)
  // if(localStorage.token === undefined && localStorage.scMemId === undefined){
  //   let u = navigator.userAgent
  //   let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1
  //   let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
  //   if (isAndroid || isiOS) {
  //     if(isAndroid){
  //       window.android.mustLogin();
  //     }else{
  //         // ios
  //         window.webkit.messageHandlers.mustLogin.postMessage(null);
  //     }
  //     return
  //   } else {
  //     setTimeout(function () {
  //       window.location.href = 'login.html'
  //     }, 500)
  //   }
  //   throw '';
  // }
  // timeNow = dateTimeFormate($.ajax({ async: false }).getResponseHeader("Date"))
  timeNow = new Date().getTime()
  nonce = generateMixed(10);
  var data = param.data;
  // $.ajaxSetup({
  //   statusCode: {
  //     // 404: function () {
  //     //     parent.location.href = "nothing.html"
  //     // },
  //     // 500: function () {
  //     //     parent.location.href = "nothing.html"
  //     // }
  //   }
  // })

  // return new Promise(function (resolve, reject) {
    $.ajax({
      url: interfaceUrl + param.url,
      type: param.type || 'post',
      data: JSON.stringify(data),
      contentType: 'application/json',
      dataType: 'json',
      // async:false,
      xhrFields: { withCredentials: true },
      beforeSend: function (request) {
        request.setRequestHeader('X-Token', token)
        request.setRequestHeader('timestamp', timeNow)
        request.setRequestHeader('nonce', nonce)
        request.setRequestHeader('X-Signe', addMd5(data, timeNow, nonce))
        request.setRequestHeader('X-Language', localStorage.getItem('language') == 'en' ? '2' : '1')
      },
      success: function (d) {
        if (d.code == '0') {
          success(d)
        } else if (d.code == '30011') {
          if (failed) {
            failed(d)
          } else {
            layer.closeAll()
            layer.open({
              content: d.msg
              , skin: 'msg'
              , time: 2 //2秒后自动关闭
            })
          }
        } else if (d.code == '30003') {
          layer.open({
            content: d.msg
            , skin: 'msg'
            , time: 2 //2秒后自动关闭
          })
        } else if (d.code == '20001'|| d.code == '30001') {
          if (failed) {
            failed(d)
          } else {
            layer.open({
              content: d.msg
              , skin: 'msg'
              , time: 2 //2秒后自动关闭
            })
          }

        } else if (d.code == '30002' ) {
          layer.open({
            content: d.msg
            , skin: 'msg'
            , time: 2 //2秒后自动关闭
          })
          localStorage.removeItem('token');
          localStorage.removeItem('scMemId');
          let u = navigator.userAgent
          let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1
          let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
          if(isWechat){
            setTimeout(function () {
              window.location.href = h5loginurl
            }, 1000)
          }if (isAndroid || isiOS) {
            if(isAndroid){
              window.android.mustLogin();
            }else{
                // ios
                window.webkit.messageHandlers.mustLogin.postMessage(null);
            }
            return
          } else {
            setTimeout(function () {
              window.location.href = h5loginurl
            }, 500)
          }
        }else{
          if (failed) {
            failed(d)
          } else {
            layer.open({
              content: d.msg
              , skin: 'msg'
              , time: 2 //2秒后自动关闭
            })
          }
        }
      },
      error: function(err) {
        layer.open({
          content: '网络已断开，请检查网络设置'
          , skin: 'msg'
          , time: 2 //2秒后自动关闭
        })
        // console.log(err)
      }
    })
  // })
  function addMd5(data, timeNow, nonce) {
    var key = '_TIANSHI#9q6w3e#!';
    return md5(md5(JSON.stringify(data) + timeNow + nonce) + key)
  }
}

const ajaxJSNew = function (param, success, failed) {
  timeNow = new Date().getTime()
  nonce = generateMixed(10);
  var data = param.data;
  // return new Promise(function (resolve, reject) {
    $.ajax({
      url: interfaceUrl + param.url,
      type: param.type || 'post',
      data: JSON.stringify(data),
      contentType: 'application/json',
      dataType: 'json',
      // async: false,
      xhrFields: { withCredentials: true },
      beforeSend: function (request) {
        request.setRequestHeader('X-Token', token)
        request.setRequestHeader('timestamp', timeNow)
        request.setRequestHeader('nonce', nonce)
        request.setRequestHeader('X-Signe', addMd5(data, timeNow, nonce))
        request.setRequestHeader('X-Language', localStorage.getItem('language') == 'en' ? '2' : '1')
      },
      success: function (d) {
        if (d.code == '0') {
          success(d)
        } else if (d.code == '30011') {
          // layer.closeAll()
          layer.open({
            content: d.msg
            , skin: 'msg'
            , time: 2 //2秒后自动关闭
          })
        } else if (d.code == '30003') {
          layer.open({
            content: d.msg
            , skin: 'msg'
            , time: 2 //2秒后自动关闭
          })
        } else if (d.code == '20001'|| d.code == '30001') {
          if (failed) {
            failed(d)
          } else {
            layer.open({
              content: d.msg
              , skin: 'msg'
              , time: 2 //2秒后自动关闭
            })
          }

        } else if (d.code == '30002' ) {
          layer.open({
            content: d.msg
            , skin: 'msg'
            , time: 2 //2秒后自动关闭
          })
          localStorage.removeItem('token');
          localStorage.removeItem('scMemId');
          let u = navigator.userAgent
          let isAndroid = u.indexOf('Android') > -1 || u.indexOf('Adr') > -1
          let isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/)
          if(isWechat){
            setTimeout(function () {
              window.location.href = h5loginurl
            }, 1000)
          }if (isAndroid || isiOS) {
            if(isAndroid){
              window.android.mustLogin();
            }else{
                // ios
                window.webkit.messageHandlers.mustLogin.postMessage(null);
            }
            return
          } else {
            setTimeout(function () {
              window.location.href = h5loginurl
            }, 500)
          }
        }else{
          if (failed) {
            failed(d)
          } else {
            layer.open({
              content: d.msg
              , skin: 'msg'
              , time: 2 //2秒后自动关闭
            })
          }
        }
      },
      error: function(err) {
        layer.open({
          content: '网络已断开，请检查网络设置'
          , skin: 'msg'
          , time: 2 //2秒后自动关闭
        })
        // console.log(err)
      }
    })
  // })
  function addMd5(data, timeNow, nonce) {
    var key = '_TIANSHI#9q6w3e#!';
    return md5(md5(JSON.stringify(data) + timeNow + nonce) + key)
  }
}

function dateTimeFormate(date) {
  if (!date) {
    return
  } else {
    var d = new Date(date);
    return d.getTime()
  }
}

// 获取随机数
var chars = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

function generateMixed(n) {
  var res = "";
  for (var i = 0; i < n; i++) {
    var id = Math.ceil(Math.random() * 35);
    res += chars[id];
  }
  return res;
}

