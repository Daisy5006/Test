var loginTabs = document.getElementById("loginTabs");//选项卡 登录
var loginCountTabs = document.getElementById("loginCountTabs");//选项卡 登录

var login = document.getElementsByClassName('login')[0];//登录块
var usernameLogin = document.getElementById('username-login');//登录名
var pwdLogin = document.getElementById('pwd-login');//登录密码
var btnLogin = document.getElementById('btn-login');//登录提交按钮

var loginCount = document.getElementsByClassName('login-count')[0];//账号登录块
var btnLoginCount = document.getElementById('btn-login-count');//注册提交按钮

function init(){
    var search=location.search.slice(1).split('& ');
    var len = search.length;
    for(i=0;i<len;i++){
        if(search[i]=='url=login'){
            loginCountTabs.click();
        }
    }
}
btnLogin.onclick=function(e){
    e.preventDefault();
    var userStr=usernameLogin.value;
    var pwdStr=pwdLogin.value;
    var str='name='+userStr+'&password='+pwdStr;
        ajax('POST','http://vip.chanke.xyz/mi/login',cbs,str,true);
}
init();

