(function () {

    var state = {
        curPage: 0,
        totalPage: 0,
        dayNum: 7,
        type: '0',
        unitMap: {
            '1': '收入(元)',
            '0': '速度'
        }
    };
    var layer = $('#layer');
    var closeBtn = $('.close');
    closeBtn.click(function () {
        layer.hide();
    });
    var crystRemain = permission ? '<p class="tip-title">可转出余额</p>\
                        <p class="tip-content">已经结算（税后）且还没有兑换且可以转出的金额。</p>\
                        <p class="tip-title">账户总余额</p>\
                        <p class="tip-content">已经结算（税后）且还没有兑换的金额。</p>\
                        <p class="tip-title">月比较</p>\
                        <p class="tip-content">比较上两个自然月结算金额的环比变化情况</p>\
                        <p class="tip-title">历史总余额</p>\
                        <p class="tip-content">历史累计全部结算（税后）的金额，包括已兑换的金额（税后）</p>' :
                        '<p class="tip-title">账户余额</p>\
                        <p class="tip-content">已经结算（税后）且还没有兑换的金额。</p>\
                        <p class="tip-title">月比较</p>\
                        <p class="tip-content">比较上两个自然月结算金额的环比变化情况</p>\
                        <p class="tip-title">历史总余额</p>\
                        <p class="tip-content">历史累计全部结算（税后）的金额，包括已兑换的金额（税后）</p>';

    var tipMap = {
        'cryst-income': '<p class="tip-title">收入(税前)</p>\
                        <p class="tip-content">该收入仅为过滤前的收入数据，并非您的实际收入金额，\
                        最终结算金额以月结（每月最后一个工作日）转到您账户内的实际金额为准。</p>\
                        <p class="tip-title">今日、昨日产出</p>\
                        <p class="tip-content">分别为今日、昨日产出的收入金额（含税）。</p>\
                        <p class="tip-title">历史总产出</p>\
                        <p class="tip-content">历史累计全部产出收入总金额（含税），包括已转出收入金额（含税）。</p>',
        'cryst-available': '<p class="tip-title">可用收益</p>\
                        <p class="tip-content">您账户现有的收益数，不包括已结算或兑换的收益数。</p>\
                        <p class="tip-title">今日、昨日产出</p>\
                        <p class="tip-content">分别为今日、昨日的所有机器的收益总产量。</p>\
                        <p class="tip-title">历史总产出</p>\
                         <p class="tip-content">历史累计全部产出的收益数，包括已结算或兑换的收益数。</p>',
        
        'cryst-remain': '<p class="tip-title">可转出余额</p>\
                        <p class="tip-content">已经结算（税后）且还没有兑换且可以转出的金额。</p>\
                        <p class="tip-title">账户总余额</p>\
                        <p class="tip-content">已经结算（税后）且还没有兑换的金额。</p>\
                        <p class="tip-title">月比较</p>\
                        <p class="tip-content">比较上两个自然月结算金额的环比变化情况</p>\
                        <p class="tip-title">历史总余额</p>\
                        <p class="tip-content">历史累计全部结算（税后）的金额，包括已兑换的金额（税后）</p>'
        
    };

    $('.item-title span').hover(function (e) {
        var target = $(e.target);
        var id = target.attr('id');
        var scrollTop = $(document.body).scrollTop();
        var scrollLeft = $(document.body).scrollLeft();
        var tip = $('.tip');
        tip.html(tipMap[id]);
        tip.css('left', (e.clientX + scrollLeft + 200 > 1000 ? e.clientX + scrollLeft - 195 : e.clientX + scrollLeft + 5) + 'px');
        tip.css('top', e.clientY + scrollTop + 5 + 'px');
        tip.show();
    }, function (e) {
        $('.tip').hide();
    });

    var accountNav = $('#account-detail-nav li');
    accountNav.on('click', function (e) {
        accountNav.removeClass('selected');
        $(e.target).addClass('selected');
        if ($(e.target).attr('id') === 'income-nav') {
            selectorItem.removeClass('outcome');
            selectorItem.addClass('income');
            state.type = '1';
            getAccountDetail(state.type, state.dayNum, function (data) {
                drawChart($('#chart')[0], data, state.type, state.unitMap[state.type]);
            });
        } else {
            selectorItem.removeClass('income');
            selectorItem.addClass('outcome');
            state.type = '0';
            getAccountDetail(state.type, state.dayNum, function (data) {
                drawChart($('#chart')[0], data, state.type, state.unitMap[state.type]);
            });
        }
    });
    var selectorItem = $('.selector-item');
    selectorItem.on('click', function (e) {
        selectorItem.removeClass('selected');
        $(e.target).addClass('selected');
        state.dayNum = $(e.target).attr('data-day');
        getAccountDetail(state.type, state.dayNum, function (data) {
            drawChart($('#chart')[0], data, state.type, state.unitMap[state.type]);
        });
    });
    var getAccountDetail = function (type, day, callback) {
        $.ajax({
            url: '/site/cryst-out-put',
            type: 'GET',
            data: {
                type: type,
                day: day
            },
            dataType: 'json',
            success: function (res) {
                if (res.success) {
                    callback(res.data);
                } else {
                }
            }
        });
    };

    /***** table jump event *****/
    var tableNav = $('#table-nav');
    var navStatus = $('#nav-status');
    var jumpBtn = $('#table-nav button');
    var jumpInput = $('#table-nav input');
    var initNavState = function (length) {
        state.totalPage = Math.ceil(length / 15);
        state.curPage = state.totalPage === 0 ? 0 : 1;
        updateNavState();
        tableNav.find('#last-page').hide();
        tableNav.find('#next-page').show();
    };
    var updateNavState = function () {
        navStatus.html(state.curPage + '/' + state.totalPage);
    };
    tableNav.on('click', '#last-page', function () {
        if (state.curPage > 1) {
            state.curPage --;
            updateNavState();
            renderTable(detailList.slice(15 * (state.curPage - 1), 15 * state.curPage));
            tableNav.find('#next-page').show();
            if (state.curPage === 1) {
                tableNav.find('#last-page').hide();
            }
        }
    });
    tableNav.on('click', '#next-page', function () {
        if (state.curPage < state.totalPage) {
            state.curPage ++;
            updateNavState();
            tableNav.find('#last-page').show();
            if (state.curPage === state.totalPage) {
                tableNav.find('#next-page').hide();
            }
            renderTable(detailList.slice(15 * (state.curPage - 1), 15 * state.curPage));
        }
    });
    jumpBtn.on('click', function () {
        if (isNumber(jumpInput.val())) {
            var page = +jumpInput.val();
            if (page <= state.totalPage && page > 0 && isNumber(page)) {
                state.curPage = page;
                updateNavState();
                renderTable(detailList.slice(15 * (state.curPage - 1), 15 * state.curPage));
                if (state.curPage === 1) {
                    tableNav.find('#last-page').hide();
                    tableNav.find('#next-page').show();
                } else if (state.curPage === state.totalPage) {
                    tableNav.find('#last-page').show();
                    tableNav.find('#next-page').hide();
                } else {
                    tableNav.find('#last-page').show();
                    tableNav.find('#next-page').show();
                }
            }
        }
    });
    /***** draw chart *****/
    var transferOutcomeList = function (list) {
        list = list || [];
        var length = list.length;
        for (var i = 0; i < length; i ++) {
            list[i]['shortDate'] = list[i]['date'].substring(5);
        }
    };

    var drawChart = function (container, data, type, unit) {
        if (data.length === 0) {
            $(container).html('<div style="width:100%;height: 300px;line-height:300px;text-align:center;">暂无数据</div>');
        } else {
            transferOutcomeList(data);
            var color = {
                '1': {
                    line: '#e66e5c',
                    area: 'rgba(230, 110, 92, 0.2)',
                    name: '收益收入'
                },
                '0': {
                    line: '#24b37e',
                    area: 'rgba(36, 179, 126, 0.2)',
                    name: '收益产出'
                }
            };
            var xaxisList = [];
            var valueList = [];
            var length = data.length;
            for (var i = 0; i < length; i ++) {
                var temp = data[i];
                xaxisList.push(temp['shortDate']);
                if (unit === '收益(分)') {
                    valueList.push(temp['cryst_num']);
                } else {
                    valueList.push(temp['cryst_num']/100);
                }
            }
            var option = {
                tooltip: {
                    trigger: 'item',
                    formatter: function (item) {
                        return '<p style="font-size:12px;padding:8px;padding-top:4px;padding-bottom:0px;">' + item['name'] + '</p>'
                            + '<p style="font-size:12px;padding:8px;padding-bottom:4px;padding-top:0px;">' + color[type]['name'] + '：' + (type === '1' ? item['data'].toFixed(2) : item['data'].toFixed(0)) + '</p>';
                    }
                },
                xAxis: [{
                    name: '时间',
                    type: 'category',
                    data: xaxisList
                }],
                yAxis: [{
                    name: unit,
                    type: 'value',
                    axisLabel: {
                        formatter: '{value}'
                    }
                }],
                series: [{
                    type: 'line',
                    symbol: 'emptyCircle',
                    symbolSize: 3,
                    data: valueList,
                    itemStyle: {
                        normal: {
                            areaStyle: {
                                type: 'default',
                                color: color[type]['area']
                            },
                            lineStyle: {
                                color: color[type]['line']
                            },
                            color: color[type]['line']
                        }
                    }
                }]
            };
            var chart = echarts.init(container);
            chart.setOption(option);
        }
    };
    drawChart($('#chart')[0], outcomeList, '0', '收益(分)');
    /***** render table *****/
    var dateToString = function (date) {
        return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    };

    var renderTable = function (data) {
        data = data || [];
        var length = data.length;
        var html = '';
        for (var i = 0; i < length; i ++) {
            var temp = data[i];
            html += '<tr>';
            html += '<td>' + dateToString(new Date(temp['date_timestamp'] * 1000)) + '</td>';
            html += '<td>' + temp['consume_gold'] + '分</td>';
            html += '<td>' + temp['exchanged_cryst'] + '分</td>';
            html += '<td>￥' + Math.round(temp['pre_tax_amount']*100)/10000 + '</td>';
            html += '<td>￥' + Math.round(temp['individual_tax']*100)/10000 + '</td>';
            html += '<td>￥' + Math.round(temp['after_tax_amount']*100)/10000 + '</td>';
            html += '</tr>';
        }
        if (length === 0) {
            html = '<tr><td colspan="6">暂无数据</td></tr>';
        }
        $('table tbody').html(html);
    };
    renderTable(detailList);
    var length = detailList.length;
    initNavState(length);

    $('#transfer-btn').on('click', function () {
        if (permission) {
            window.location.href = '/site/transfer';
        } else {
            layer.show();
        }
    });

    $('.transfer-info-link').on('click', function () {
        if (permission) {
            window.location.href = '/site/transfer?info=true';
        } else {
            layer.show();
        }
    });

    var showConfirmInfo = function (text, confirmCb, cancelCb, confirmTitle, cancelTitle) {
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
                    + '<div style="float:left;font-size:15px;margin-left:10px;height:36px;line-height:36px;">百度金矿</div>'
                    + '</div>';
        var closeBtnHtml = '<div style="float:right;width:36px;height:36px;'
                    + 'background:url(/static/close.png) no-repeat center center;'
                    + 'border-radius: 0px 3px 0px 0px;cursor:pointer;"></div>';
        // var contentHtml = '<div style="width:100%;height:150px;line-height:150px;'
        //             + 'text-align:center;font-size:18px;color:#565656;">' + text + '</div>';
        var contentHtml = '<div style="width:100%;min-height:150px;line-height: 30px;padding-top: 80px;'
                    + 'padding-left: 10px;padding-right: 10px;text-align:center;font-size:18px;color:#565656;word-break:break-all;">' + text + '</div>';

        var btnHtml = '<div style="float:left;width:260px;height:40px;margin-left:191px;margin-top:20px;margin-bottom:10px;">'
                    + '</div>';
        confirmTitle = confirmTitle || '确定';
        var confirmBtn = $('<div class="btn positive-btn" style="width:118px;'
                    + 'height:40px;line-height:40px;">' + confirmTitle + '</div>');
        cancelTitle = cancelTitle || '取消';
        var cancelBtn = $('<div class="btn negative-btn" style="display:none;width:118px;height:40px;line-height:40px;margin-left:15px;">' + cancelTitle + '</div>');
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

    $('.user-author').on('click', function() {
        if (status === '-1') {
            // 未提交
            showProtocolLayer();
        } else if (status === '0') {
            // 待审核
            showConfirmInfo("信息提交成功，请等待审核结果，谢谢您的配合");
        } else if (status === '2') {
            // 审核失败
            showConfirm("审核不通过：" + comment, function () {
                showAuthorizationLayer();
            }, function() {}, "重新提交");
        }

    });

    // authorization
    var MAX_FILE_SIZE = 2 * 1024 * 1024;
    var ID_REG = /^((1[1-5])|(2[1-3])|(3[1-7])|(4[1-6])|(5[0-4])|(6[1-5])|71|(8[12])|91)\d{4}((19\d{2}(0[13-9]|1[012])(0[1-9]|[12]\d|30))|(19\d{2}(0[13578]|1[02])31)|(19\d{2}02(0[1-9]|1\d|2[0-8]))|(19([13579][26]|[2468][048]|0[48])0229))\d{3}(\d|X|x)?$/;
    var CHINESE_REG = /^[\u4e00-\u9fa5]{2,}$/;

    var hasFileReader = false;
    if (window.FileReader) {
        var hasFileReader = true;
    }
    var resetUploadForm = function (form) {
        form.reset();
        $('.add img').attr('src', '/static/add-upload.png')
            .attr('width', '50px')
            .attr('height', '50px');
        $('#author-file-input').val('');
        $('#upload-author span').html('上传授权书');
    };
    var getResizeRatio = function (img, height, width) {
        var oldWidth = img.width;
        var oldHeight = img.height;
        height = height || 50;
        width = width || 80;
        if ((oldHeight / oldWidth) > (height / width)) {
            return height / oldHeight;
        } else {
            return -1 * width / oldWidth;
        }
    };
    var errorPanel = $('.authorization-error-panel');
    var showFormError = function (text) {
        errorPanel.html(text);
    };
    var getImageSizeInIE = function (field) {
        var fso = new ActiveXObject("Scripting.FileSystemObject");
        var filepath = field.value;
        var file = fso.getFile(filepath);
        return file.size;
    };

    var authorizationLayer = $('#authorization-layer');
    var closeBtn = $('#header-close');
    var cancelBtn = $('#authorization-btn-group .negative-btn');
    var confirmBtn = $('#authorization-btn-group .positive-btn');
    closeBtn.click(function () {
        authorizationLayer.hide();
    });
    cancelBtn.click(function () {
        authorizationLayer.hide();
    });
    var uploadInput = $('.upload-input');
    var authorUploadInput = $('#author-file-input');
    var uploadPreviewElemMap = {
        'idFront': $('#id-front').find('img'),
        'idBack': $('#id-back').find('img'),
        'idHold': $('#id-hold').find('img')
    };
    var uploadHoverMap = {
        'idFront': $('#id-front .upload-hover'),
        'idBack': $('#id-back .upload-hover'),
        'idHold': $('#id-hold .upload-hover')
    };
    var uploadNameMap = {
        'idFront': '身份证正面照片',
        'idBack': '身份证反面图片',
        'idHold': '本人手持身份证照片'
    };
    var uploadCache = {
        'idFront': null,
        'idBack': null,
        'idHold': null
    };
    uploadInput.on('change', function (e) {
        // clear error msg
        errorPanel.html('');
        var input = this;
        var inputName = input.name;
        var previewElem = uploadPreviewElemMap[inputName];
        var validateResult = validateUploadField(this, hasFileReader, uploadNameMap[inputName], MAX_FILE_SIZE);
        if (validateResult.status !== 1) {
            if (validateResult.status !== -2) {
                previewElem.attr('src', '/static/add-upload.png')
                    .css('width', '50px').css('height', '50px');
            }
            if (validateResult.status !== 0) {
                showFormError(validateResult.msg);
            }
            uploadHoverMap[inputName].html('上传');
            return;
        }

        uploadHoverMap[inputName].html('修改');

        uploadCache[inputName] = input.value;
        if (!hasFileReader) {
            previewElem.attr('src', input.value);
        } else {
            if (input.files && input.files[0]) {
                var file = input.files[0];
                var reader = new FileReader();
                reader.onload = function (e) {
                    previewElem.attr('src', e.target.result);
                }
                var _URL = window.URL || window.webkitURL;
                var img = new Image();
                img.onload = function () {
                    var ratio = getResizeRatio(img);
                    if (ratio >= 0) {
                        previewElem.attr('width', img.width * ratio + 'px');
                    } else {
                        previewElem.attr('height', img.height * -1 * ratio + 'px');
                    }
                    reader.readAsDataURL(file);
                };
                img.src = _URL.createObjectURL(file);
            }
        }
    });
    authorUploadInput.on('change', function (e) {
        // clear error msg
        errorPanel.html('');
        var input = this;
        var validateResult = validateUploadField(input, hasFileReader, '授权书', MAX_FILE_SIZE);
        if (validateResult.status !== 1) {
            if (validateResult.status !== -2) {
                $('#upload-author span').html('上传授权书');
            }
            if (validateResult.status !== 0) {
                showFormError(validateResult.msg);
            }
            return;
        }
        if (hasFileReader) {
            if (input.files && input.files[0]) {
                $('#upload-author span').html(input.files[0].name);
            }
        } else {
            $('#upload-author span').html(input.value.split('\\').slice(-1));
        }
    });

    var validateUploadField = function (field, hasFileReader, errorMsg, maxSize) {
        if (hasFileReader) {
            var files = field.files;
            if (files.length === 0) {
                return {
                    status: 0,
                    msg: '请上传' + errorMsg
                };
            } else if (files[0].type.indexOf('image') === -1) {
                return {
                    status: -1,
                    msg: errorMsg + '必须为图片格式文件'
                };
            } else if (files[0].size > maxSize) {
                return {
                    status: -2,
                    msg: errorMsg + '大小不能超过2M'
                };
            } else {
                return {
                    status: 1,
                    msg: 'success'
                };
            }
        } else {
            var validFileExtensions = ['jpg', 'jpeg', 'bmp', 'gif', 'png'];
            var uploadFileName = field.value;
            if (uploadFileName.length === 0) {
                return {
                    status: 0,
                    msg: '请上传' + errorMsg
                };
            } else if (validFileExtensions.indexOf(uploadFileName.split('.').slice(-1)[0].toLowerCase()) === -1) {
                return {
                    status: -1,
                    msg: errorMsg + '必须为图片格式文件'
                };
            } else {
                return {
                    status: 1,
                    msg: 'success'
                };
            }
        }
    };
    var authorizationForm = $('#authorization-form');
    confirmBtn.click(function () {
        var userName = authorizationForm[0].userName.value;
        var address = authorizationForm[0].address.value;
        var idCard = authorizationForm[0].idCardNum.value;

        if (isEmpty(userName)) {
            showFormError('请输入姓名');
            return;
        } else if (!CHINESE_REG.test(userName)) {
            showFormError('姓名必须是大于两个字的中文');
            return;
        }

        if (isEmpty(address)) {
            showFormError('请输入现居地');
            return;
        } else if (!CHINESE_REG.test(userName)) {
            showFormError('现居地必须是大于两个字的中文');
            return;
        }

        if (isEmpty(idCard)) {
            showFormError('请输入身份证号码');
            return;
        } else if (!ID_REG.test(idCard)){
            showFormError('请输入正确的身份证号码');
            return;
        }
        var hasUploadError = false;
        $.each(uploadInput, function (index, input) {
            console.log(input);
            var validateResult = validateUploadField(input, hasFileReader, uploadNameMap[input.name], MAX_FILE_SIZE);
            console.log(validateResult);
            if (validateResult.status !== 1) {
                showFormError(validateResult.msg);
                hasUploadError = true;
                return false;
            }
        });
        if (hasUploadError) {
            return;
        }

        if (userType === 2) {
            var validateResult = validateUploadField(authorUploadInput[0], hasFileReader, '授权书', MAX_FILE_SIZE);
            if (validateResult.status !== 1) {
                showFormError(validateResult.msg);
                return;
            }
        }
        confirmBtn.attr('disabled', true).html('提交中...');
        if (hasFileReader) {
            // clear error msg
            errorPanel.html('');
            // upload the form
            $.ajax({
                url: '/attachment/save',
                type: 'post',
                data: new FormData(authorizationForm[0]),
                dataType: 'json',
                processData: false,
                contentType: false,
                success: function (res) {
                    confirmBtn.removeAttr('disabled').html('提交');
                    if (res.success) {
                        resetUploadForm(authorizationForm[0]);
                        authorizationLayer.hide();
                        showConfirmInfo('提交成功', function () {
                            window.location.href = '/site/account';
                        });
                    } else {
                        showFormError(res.msg);
                    }
                }
            });
        } else {
            var iframeName = 'iframe' + new Date().getTime();
            var iframe = $('<iframe name="' + iframeName + '" style="display:none;"></iframe>');
            $('body').append(iframe);
            authorizationForm.attr('target', iframeName);
            iframe.one('load', function () {
                confirmBtn.removeAttr('disabled').html('提交');
                var res = $.parseJSON(iframe.contents().find('body').text());
                if (res.success) {
                    resetUploadForm(authorizationForm[0]);
                    authorizationLayer.hide();
                    showConfirmInfo('提交成功', function () {
                        window.location.href = '/site/account';
                    });
                } else {
                    showFormError(res.msg);
                }
                iframe.remove();
                authorizationForm.removeAttr('target');
                resetUploadForm(authorizationForm[0]);
            });
            authorizationForm.submit();
        }
    });

    var showAuthorizationLayer = function () {
        if (userType !== 2) {
            $('#author-label, #upload-author').hide();
        }
		errorPanel.html('');
        authorizationLayer.show();
    };
    window.showAuthorizationLayer = showAuthorizationLayer;

    var protocolLayer = $('#protocol-layer');
    var protocolCloseBtn = $('#protocol-header-close');
    var protocolCancelBtn = $('#protocol-btn-group .negative-btn');
    var protocolConfirmBtn = $('#protocol-btn-group .positive-btn');

    protocolCloseBtn.click(function () {
        protocolLayer.hide();
    });
    protocolCancelBtn.click(function () {
        protocolLayer.hide();
    });
    protocolConfirmBtn.click(function () {
        protocolLayer.hide();
        showAuthorizationLayer();
    });
    var showProtocolLayer = function () {
        protocolLayer.show();
    }
}());
