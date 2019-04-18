(function () {
    var TYPE = {
        ALARM: 0,
        SYSTEM: 1
    };
    var NUMBER_REG = /^\+?[1-9][0-9]*$/;
    var isNumber = function (number) {
        return NUMBER_REG.test(number);
    };
    var isEmpty = function (str) {
        str = str || '';
        str = str.replace(/^\s+|\s+$/g,'');
        return str.length === 0;
    };
    window.isEmpty = isEmpty;
    window.isNumber = isNumber;

    var request = function (url, callback) {
        $.ajax({
            url: url,
            type: 'GET',
            dataType: 'json',
            success: function (res) {
                if (callback) {
                    callback(res);
                }
            }
        });
    };
    var ingnorMessage = function (callback) {
        request('/site/ignore-message?message_type=1');
        request('/site/ignore-message?message_type=0');
        callback();
    };
    var getUnreadMessage = function (callback) {
        request('/site/unread-message', callback);
    };
    var getHistoryMessage = function (callback) {
        request('/site/query-history-message', callback);
    };
    var showMessagePanel = function (id) {
        $('.message-panel').removeClass('cur-message-panel');
        $('#' + id).addClass('cur-message-panel');
    };
    var renderMessagePanel = function (data, id) {
        var length = data.length;
        var html = '';
        for (var i = 0; i < length; i ++) {
            var temp = data[i];
            if (temp['message_type'] === TYPE.SYSTEM) {
                // system message
                html += '<li>';
                html += '<div class="message-list-index"></div>';
                html += '<div class="message-list-content"><a href="/site/message?type=1">' + temp['message_title'] + '</a></div>';
                html += '</li>';
            } else {
                // alarm message
                html += '<li class="error-message">';
                html += '<div class="message-list-index"></div>';
                html += '<div class="message-list-content"><a href="/site/message?type=0">预警：' + temp['message_title'] + '</a></div>';
                html += '</li>';
            }
        }
        $('#' + id + ' #message-list').html(html);
    };
    $('.message-panel').on('click', 'li a', function (e) {
        $(e.target).addClass('active');
    });
    getUnreadMessage(function (res) {
        var alarm = res['unread_alarm_message'];
        var system = res['unread_system_message'];
        var count = alarm.length + system.length;
        if (count !== 0) {
            $('.unread-num').html(count).show();
            renderMessagePanel(alarm.concat(system), 'new-message-panel');
            showMessagePanel('new-message-panel');
        } else {
            showMessagePanel('no-message-panel');
        }
        if (system.length !== 0) {
            $('#system-message-nav .unread-status').html(system.length).show();
        }
        if (alarm.length !== 0) {
            $('#alarm-message-nav .unread-status').html(alarm.length).show();
        }
    });
    getHistoryMessage(function (res) {
        renderMessagePanel(res, 'history-message-panel');
    });
    $('#ignore-btn').click(function () {
        ingnorMessage(function (res) {
            //todo clear message panel
            showMessagePanel('no-message-panel');
            $('.message-panel').hide();
            $('.unread-num').html(0).hide();
        });
    });
    $('#message-panel-header span').click(function () {
        showMessagePanel('no-message-panel')
    });
    $('#history-entry').click(function () {
        showMessagePanel('history-message-panel');
    });

    var showConfirm = function (text, confirmCb, cancelCb, confirmTitle, cancelTitle) {
        var html = '<div style="position:fixed;top:0px;left:0px;'
                    + 'right:0px;bottom:0px;background: rgba(0, 0, 0, 0.4);'
                    + 'z-index: 99;'
                    + '"></div>';
        var boxHtml = '<div style="position:absolute;left:50%;top: 200px;'
                    + 'width:500px;min-height:260px;margin-left:-250px;border-radius:3px;'
                    + 'background-color:#fff;'
                    + '"></div>';
        var headerHtml = '<div style="float:left;height:36px;width:100%;color:#fff;background:#d6ab6d;border-radius:2px 2px 0px 0px;">'
                    + '<div style="float:left;width:25px;height:18px;margin-left:10px;'
                    + 'margin-top:9px;background:url(/static/title-logo.png);'
                    + 'background-size:25px 19px;"></div>'
                    + '<div style="float:left;font-size:15px;margin-left:10px;height:36px;line-height:36px;">百度P2P CDN</div>'
                    + '</div>';
        var closeBtnHtml = '<div style="float:right;width:36px;height:36px;'
                    + 'background:url(/static/close.png) no-repeat center center;'
                    + 'border-radius: 0px 3px 0px 0px;cursor:pointer;"></div>';
        // var contentHtml = '<div style="width:100%;height:150px;line-height:150px;'
        //             + 'text-align:center;font-size:18px;color:#565656;">' + text + '</div>';
        var contentHtml = '<div style="width:100%;min-height:150px;line-height: 30px;padding-top: 80px;'
                    + 'padding-left: 10px;padding-right: 10px;text-align:center;font-size:18px;color:#565656;word-break:break-all;">' + text + '</div>';

        var btnHtml = '<div style="float:left;width:260px;height:40px;margin-left:120px;margin-top:20px;margin-bottom:10px;">'
                    + '</div>';
        confirmTitle = confirmTitle || '确定';
        var confirmBtn = $('<div class="btn positive-btn" style="width:118px;'
                    + 'height:40px;line-height:40px;">' + confirmTitle + '</div>');
        cancelTitle = cancelTitle || '取消';
        var cancelBtn = $('<div class="btn negative-btn" style="width:118px;height:40px;line-height:40px;margin-left:15px;">' + cancelTitle + '</div>');
        var layer = $(html);
        var panel = $(boxHtml);
        var closeBtn = $(closeBtnHtml);
        var header = $(headerHtml).append(closeBtn);
        var btns = $(btnHtml);
        btns.append(confirmBtn).append(cancelBtn);
        panel.append(header).append(contentHtml).append(btns);
        layer.append(panel);
        $(document.body).append(layer);
        closeBtn.click(function () {
            layer.hide();
        });
        cancelBtn.click(function () {
            if (cancelCb) {
                cancelCb();
            }
            layer.hide();
        });
        confirmBtn.click(function () {
            if (confirmCb) {
                confirmCb();
            }
            layer.hide();
        });
    };
    $('#logout-entry').click(function () {
        showConfirm('确定要退出百度P2P CDN吗？', function () {
            window.location.href = '/site/logout';
        });
    });
    window.showConfirm = showConfirm;

    var loginPanel = passport.pop.init({
        tangram: true,
        cache:true,
        apiOpt:{
            product:'dcdn',
            staticPage: window.location.protocol + '//baijin.baidu.com/static/v3Jump.html',
            memberPass: true,
            u: window.location.protocol + '//baijin.baidu.com/site/account'
        },
        forgetLink:'http://baidu.com/?1', //忘记密码
        registerLink:'https://passport.baidu.com/v2/?reg&tt=1450160082723&gid=AB1908A-4E46-4619-BE9F-C2955D5EAAF4&tpl=dcdn&u=http%3A%2F%2Fbaijin.baidu.com%2Fsite%2Faccount',
        onSubmitStart:function(form){}
    });

    $('.login-entry').click(function () {
        loginPanel.show();
    });
    $('#apply-btn, .apply-btn').click(function () {
        if (hasLogin) {
            window.location.href = '/site/center#!/machine-list';
        } else {
            loginPanel.show();
        }
    });
    $('#all-btn').click(function () {
        if (hasLogin) { 
            if (isFillPersonInfo) {
                window.location.href = '/attachment/download-public-client';
            } else {
                showConfirm('请先完善个人信息', function () {
                    window.location.href = '/site/center#!/info';
                });
            }
            
        } else {
            loginPanel.show();
        }
    });
    
}());
