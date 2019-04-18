(function () {
    var state = {
        curPage: 0,
        totalPage: 0,
        tableStatus: 'all',
        detailList: {
            all: detailList,
            online: null,
            offline: null
        },
        curChart: []
    };
    var BYTE = 1;
    var BYTES_PER_KB = 1000;
    var BYTES_PER_MB = BYTES_PER_KB * 1000;
    var BYTES_PER_GB = BYTES_PER_MB * 1000;

    var tipMap = {
        'machine-tip': '<p class="tip-title">机器数</p>\
                        <p class="tip-content">您账户最近一个月有在线状态的全部机器数量</p>',
        'speed-tip': '<p class="tip-title">总上传速度</p>\
                    <p class="tip-content">您账户全部机器当前实时上传的速度总和，包括当前在线和离线的机器速度。</p>',
        'outcome-tip': '<p class="tip-title">今日产出</p>\
                    <p class="tip-content">您账户全部机器今日产出的收益总量，包括已兑换的收益数。</p>\
                    <p class="tip-title">昨日产出</p>\
                    <p class="tip-content">您账户全部机器昨日产出的收益总量，包括已兑换的收益数。</p>\
                    <p class="tip-title">历史产出</p>\
                    <p class="tip-content">您账户全部机器历史产出的收益总量，包括已结算或兑换的收益数。</p>',
        'stone-tip': '<p class="tip-title">冻结收益产出</p>\
                    <p class="tip-content">您账户现有冻结收益总数，但不可用于提现。</p>'
    };

    var format = function(date,fmt) {
        var o = {
          "M+": date.getMonth()+1,
          "d+": date.getDate(),
          "h+": date.getHours(),
          "m+": date.getMinutes(),
          "s+": date.getSeconds(),
          "q+": Math.floor((date.getMonth()+3)/3),
          "S": date.getMilliseconds()
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("("+ k +")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
            }
        }
        return fmt;
    };

    $('.item-title span').hover(function (e) {
        var id = $(e.target).attr('id');
        var scrollTop = $(document.body).scrollTop();
        var scrollLeft = $(document.body).scrollLeft();
        var tip = $('.tip');
        tip.html(tipMap[id]);
        tip.css('left', e.clientX + scrollLeft + 5 + 'px');
        tip.css('top', e.clientY + scrollTop + 5 + 'px');
        tip.show();
    }, function (e) {
        $('.tip').hide();
    });

    var clone = function (source, target) {
        var arrayStr = '[object array]';
        var toStr = Object.prototype.toString;
        if (!target) {
            target = toStr.apply(source).toLowerCase() === arrayStr ? [] : {}
        }
        for (var key in source) {
            if (source.hasOwnProperty(key)) {
                if (typeof source[key] === 'object' && source[key] != null) {
                    target[key] = toStr.apply(source[key]).toLowerCase() === arrayStr ? [] : {};
                    this.clone(source[key], target[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
        return target;
    };

    var dateToString = function (date) {
        return date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate();
    };
    var renderTable = function (data) {
        var statusMap = {
            online: '在线',
            offline: '离线'
        };
        data = data || [];
        var html = '';
        var length = data.length;
        if (length === 0) {
            html = '<tr><td colspan="9" align="center">暂无数据</td></tr>';
        } else {
            var i = 1;
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    var temp = data[key];
                    if (temp['selected'] === 1) {
                        html += '<tr class="tr-selected">';
                    } else {
                        html += '<tr>';
                    }
                    if (temp['status'] === 'offline') {
                        html += '<td align="center" class="offline"><span>!</span>' + ((state.curPage - 1) * 15 + i) + '</td>';
                    } else {
                        html += '<td align="center">' + (((state.curPage - 1) * 15) + i) + '</td>';
                    }
                    html += '<td>' + temp['outer_ip_addr'] + '</td>';
                    html += '<td>' + temp['speed'] + '</td>';
                    html += '<td>' + temp['used_space'] + '</td>';
                    html += '<td>' + temp['today_output'] + '</td>';
                    html += '<td>' + temp['yesterday_output'] + '</td>';
                    html += '<td>' + temp['history_output'] + '</td>';
                    if (temp['status'] === 'offline') {
                        html += '<td style="color:#e95d65;">' + statusMap[temp['status']] + '</td>';
                    } else {
                        html += '<td>' + statusMap[temp['status']] + '</td>';
                    }
                    html += '<td>' + format(new Date(temp['update_time'] * 1000), 'yyyy-MM-dd hh:mm:ss') + '</td>';
                    // html += '<td style="position:relative;">\
                    //             <div style="float:left;">试用中</div>\
                    //             <span class="machine-tip-icon">?</span>\
                    //             <div class="machine-tip">\
                    //                 <p>推荐使用win7/10,win server 2008/2012系统，试用测试期间请保持全天挂机，请勿更换挂机设备</p>\
                    //             </div>\
                    //          </td>';
                    // if (temp['bind_odds'].length === 0) {
                    //     html += '<td><button class="bind_odds mining-bind-card" data-dcdn-id="' + temp['dcdn_id'] + '">绑券</button>' + '</td>';
                    // } else {
                    //     html += '<td>';
                    //     for (var cardkey in temp['bind_odds']) {
                    //         var card = temp['bind_odds'][cardkey];
                    //         html += '<img src="/views/image/';
                    //         html += card['type'] === 1 ? 'rocket.png"' : 'dashboard.png"';
                    //         html += ' class="mining-rocket" title="' + card['effect'];
                    //         html += card['type'] === 1 ? '倍加速中' : '倍兑换';
                    //         html += '">';
                    //     }
                    //     html += '</td>';
                    // }

                    html += '</tr>';
                    i ++;
                }
            }
        }
        $('#mining-detail table tbody').html(html);
    };
    var transferList = function (list, index) {
        var length = list.length;
        var result = [];
        for (var i = 0; i < length; i ++) {
            list[i]['index'] = i + 1;
            if (i < 4 || i === index) {
                list[i]['selected'] = 1;
                result.push(list[i]);
            } else {
                list[i]['selected'] = 0;
            }
        }
        return result;
    };
    var initNavState = function (length) {
        state.totalPage = Math.ceil(length / 15);
        state.curPage = state.totalPage === 0 ? 0 : 1;
        updateNavState();
        tableNav.find('#last-page').hide();
        tableNav.find('#next-page').show();
    };
    var detailNav = $('#mining-detail-nav li');
    detailNav.on('click', function (e) {
        detailNav.removeClass('selected');
        $(e.target).addClass('selected');
        var type = $(e.target).attr('data-type');
        if (e.target.tagName.toLowerCase() === 'span') {
            type = 'offline';
            $(e.target.parentNode).addClass('selected');
        }
        if (type === 'all') {
            state.detailList[type] = detailList;
        } else {
            if (state.detailList[type] == null) {
                var list = [];
                for (var key in detailList) {
                    if (detailList.hasOwnProperty(key)) {
                        var temp = detailList[key];
                        if (temp['status'] === type) {
                            list.push(temp);
                        }
                    }
                }
                state.detailList[type] = list;
            }
        }
        state.tableStatus = type;
        var length = state.detailList[type].length;
        initNavState(length);
        renderTable(state.detailList[type].slice(0, 15));
    });
    var tableNav = $('#table-nav');
    var navStatus = $('#nav-status');
    var jumpBtn = $('#table-nav button');
    var jumpInput = $('#table-nav input');
    var updateNavState = function () {
        navStatus.html(state.curPage + '/' + state.totalPage);
    };
    tableNav.on('click', '#last-page', function () {
        if (state.curPage > 1) {
            state.curPage --;
            updateNavState();
            renderTable(state.detailList[state.tableStatus].slice(15 * (state.curPage - 1), 15 * state.curPage));
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
            renderTable(state.detailList[state.tableStatus].slice(15 * (state.curPage - 1), 15 * state.curPage));
        }
    });
    jumpBtn.on('click', function () {
        if (isNumber(jumpInput.val())) {
            var page = +jumpInput.val();
            if (page <= state.totalPage && page > 0 && isNumber(page)) {
                state.curPage = page;
                updateNavState();
                renderTable(state.detailList[state.tableStatus].slice(15 * (state.curPage - 1), 15 * state.curPage));
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

    var getXaixTime = function () {
        var myDate = new Date();
        var now = myDate.getHours();
        var timeList = [];
        if (myDate.getMinutes() !== 0) {
            timeList.push(now + ':' + (myDate.getMinutes() < 10 ? ('0' + myDate.getMinutes()) : myDate.getMinutes()));
        }
        for (var i = 24; i > 0; i--) {
            timeList.push(Math.abs((now + i) % 24) + ":00");
        }

        return timeList.reverse();
    };
    var getUnit = function (list) {
        var $min = list[0];
        for (var i = 1; i < list.length; i++) {
            if(list[i] == 0) {
                continue;
            }
            if($min == 0) {
                $min = list[i];
                continue;
            }
            if($min > list[i]) {
                $min = list[i];
            }
        }
        if ($min < BYTES_PER_KB) {
            return ['B/s', BYTE];
        }
        if ($min < BYTES_PER_MB) {
            return ['KB/s', BYTES_PER_KB];
        }
        if ($min < BYTES_PER_GB) {
            return ['MB/s', BYTES_PER_MB];
        }
        return ['GB/s', BYTES_PER_GB];
    };

    var isAllZero = function (list) {
        list = list || [];
        var length = list.length;
        for (var i = 0; i < length; i ++) {
            if (list[i] !== 0) {
                return false;
            }
        }
        return true;
    }

    var drawUserChart = function (container, data, index) {
        if (data.length === 0) {
            $(container).html('<div style="width:100%;height: 300px;line-height:300px;text-align:center;">暂无数据</div>');
        } else {
            if (data.length > 5) {
                data = data.slice(0, 5);
            }
            var minSpeedList = data[data.length - 1];
            for (var i = data.length - 1; i >= 1; i --) {
                if (isAllZero(data[i])) {
                    minSpeedList = data[i - 1];
                }
            }
            var minUnitData = getUnit(minSpeedList['speed_detail']);
            var bytes = minUnitData[1];
            var unit = minUnitData[0];
            var legends = [];
            var series = [];
            var length = data.length;
            for (var i = 0; i < length; i ++) {
                legends.push('机器' + data[i]['index']);
                // clone speed list
                var list = clone(data[i]['speed_detail']);
                var listLen = list.length;
                for (var j = 0; j < listLen; j ++) {
                    list[j] = Math.round(list[j] / bytes * 100) / 100;
                }
                series.push({
                    type: 'line',
                    name: '机器' + (data[i]['index']),
                    symbol: 'circle',
                    showAllSymbol: true,
                    symbolSize: 2,
                    data: list
                });
            }
            var option = {
                legend: {
                    data: legends
                },
                tooltip: {
                    trigger: 'item',
                    formatter: function (item) {
                        return '<p style="font-size:12px;padding:8px;padding-top:4px;padding-bottom:0px;">' + item['seriesName'] + '</p>'
                            + '<p style="font-size:12px;padding:8px;padding-bottom:4px;padding-top:3px;">' + item['data'].toFixed(2) + unit + '</p>';
                    }
                },
                grid: {
                    borderWidth: 1,
                    borderColor: '#e0e0e0'
                },
                xAxis: [{
                    type: 'category',
                    boundaryGap: false,
                    data: getXaixTime()
                }],
                yAxis: [{
                    type: 'value',
                    axisLabel: {
                        formatter: '{value}' + unit
                    }
                }],
                series: series
            };
            var chart = echarts.init(container);
            chart.setOption(option);
        }
    };
    var isSmaller = function (global, user) {
        var globalAve = 0;
        var userAve = 0;
        var length = 0;
        for (var i = global.length - 1; i >= 0; i --) {
            if (global[i] !== 0) {
                length ++;
                globalAve += global[i];
            }
        }
        if (length === 0) {
            globalAve = 0;
        } else {
            globalAve = globalAve / length;
        }
        length = 0;
        for (var i = user.length - 1; i >= 0; i --) {
            if (user[i] !== 0) {
                length ++;
                userAve += user[i];
            }
        }
        if (length === 0) {
            userAve = 0;
        } else {
            userAve = userAve / length;
        }
        return userAve > globalAve;
    };
    var drawGlobalChart = function (container, global, user) {
        var big = isSmaller(global, user) ? user : global;
        var unitData = getUnit(big);
        var bytes = unitData[1];
        var unit = unitData[0];
        var globalLen = global.length;
        for (var i = 0; i < globalLen; i ++) {
            global[i] = Math.round(global[i] / bytes * 100) / 100;
        }
        var userLen = user.length;
        for (var i = 0; i < userLen; i ++) {
            user[i] = Math.round(user[i] / bytes * 100) / 100;
        }

        var option = {
            legend: {
                data: ['全局机器平均速度', '我的机器平均速度']
            },
            tooltip: {
                trigger: 'axis',
                formatter: function (items) {
                    var tooltip = '';
                    items = items || [];
                    items.forEach(function (item) {
                        tooltip += '<p style="font-size:12px;padding:8px;padding-top:4px;padding-bottom:0px;">' + item['seriesName'] + ' : ' + item['data'].toFixed(2) + unit + '</p>';
                    });
                    return tooltip;
                }
            },
            grid: {
                borderWidth: 1,
                borderColor: '#e0e0e0'
            },
            xAxis: [{
                type: 'category',
                boundaryGap: false,
                data: getXaixTime()
            }],
            yAxis: [{
                type: 'value',
                axisLabel: {
                    formatter: '{value}' + unit
                }
            }],
            series: [{
                type: 'line',
                name: '全局机器平均速度',
                symbol: 'circle',
                showAllSymbol: true,
                symbolSize: 1,
                data: global
            }, {
                type: 'line',
                name: '我的机器平均速度',
                symbol: 'circle',
                showAllSymbol: true,
                symbolSize: 2,
                data: user
            }]
        };
        var chart = echarts.init(container);
        chart.setOption(option);
    };
    // $('table').on('click', 'tr', function (e) {
    //     var target = $(this);

    //     target.addClass('tr-selected');
    //     var index = $('table tbody tr').index(target);
    //     index = index + (state.curPage - 1) * 15;
    //     // if offline, should add the length of online list to get the index
    //     if (state.tableStatus === 'offline') {
    //         index = index + state.detailList['online'].length;
    //     }
    //     if (index < 5) {
    //         var listToShow = transferList(state.detailList['all'], 4);
    //     } else {
    //         var listToShow = transferList(state.detailList['all'], index);
    //     }
    //     renderTable(state.detailList[state.tableStatus].slice((state.curPage - 1) * 15, state.curPage * 15));
    //     drawUserChart($('#machine-chart')[0], listToShow, index);
    // });
    // render table and pagination
    var length = detailList.length;
    initNavState(length);
    var listToShow = transferList(detailList, 4);
    renderTable(detailList.slice(0, 15));
    drawUserChart($('#machine-chart')[0], listToShow);
    var dateNow = new Date;
    if (dateNow.getMinutes() === 0) {
        globalSpeed.pop();
        userSpeed.pop();
    }
    drawGlobalChart($('#personal-chart')[0], globalSpeed, userSpeed);
    function transferSpeed (speed) {
        unit = 'B/s';
        if (speed < 1024) {
            speed = speed;
            unit = unit;
        } else if (speed < 1024 * 1024) {
            speed = speed / 1024;
            unit = 'KB/s';
        } else if (speed < 1024 * 1024 * 1024) {
            speed = speed / 1024 / 1024;
            unit = 'MB/s';
        } else {
            speed = speed / 1024 / 1024 / 1024;
            unit = 'GB/s';
        }
        return {
            speed: Math.round(speed, 2),
            unit: unit
        };
    };

    var format = function(date,fmt) {
        var o = {
          "M+": date.getMonth()+1,
          "d+": date.getDate(),
          "h+": date.getHours(),
          "m+": date.getMinutes(),
          "s+": date.getSeconds(),
          "q+": Math.floor((date.getMonth()+3)/3),
          "S": date.getMilliseconds()
        };
        if (/(y+)/.test(fmt)) {
            fmt = fmt.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
        }
        for (var k in o) {
            if (new RegExp("("+ k +")").test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
            }
        }
        return fmt;
    };

    var updateTotalSpeed = function () {
        $.ajax({
            url: '/site/show-instant-upload-speed',
            type: 'GET',
            dataType: 'json',
            success: function (res) {
                var result = transferSpeed(res['total_upload_speed']);
                $('#upload-speed .item-value').html(result['speed']);
                $('#upload-speed .item-unit').html(result['unit']);
                $('#mining-overview-date span').html(format(new Date(), 'yyyy-MM-dd hh:mm:ss'));
            }
        });
    };

    var showInputAlert = function (confirmCb) {
        var html = '<div style="position:fixed;top:0px;left:0px;'
                    + 'right:0px;bottom:0px;background: rgba(0, 0, 0, 0.4);'
                    + 'z-index: 99;'
                    + '"></div>';
        var boxHtml = '<div style="position:absolute;left:50%;top: 200px;'
                    + 'width:500px;height:260px;margin-left:-250px;border-radius:3px;'
                    + 'background-color:#fff;'
                    + '"></div>';
        var headerHtml = '<div style="float:left;height:36px;width:100%;color:#fff;background:#d6ab6d;border-radius:2px 2px 0px 0px;">'
                    + '<div style="float:left;width:25px;height:18px;margin-left:10px;'
                    + 'margin-top:9px;background:url(/static/title-logo.png);'
                    + 'background-size:25px 19px;"></div>'
                    + '<div style="float:left;font-size:14px;margin-left:10px;height:36px;line-height:36px;">百度P2P CDN</div>'
                    + '</div>';
        var closeBtnHtml = '<div style="float:right;width:36px;height:36px;'
                    + 'background:url(/static/close.png) no-repeat center center;'
                    + 'border-radius: 0px 3px 0px 0px;cursor:pointer;"></div>';
        var contentHtml = '<div style="width:100%;height:150px;padding: 0px 20px;padding-top:80px;'
                    + 'text-align:center;font-size:18px;color:#565656;">奖券序列号：<input type="text" id="oddsCard" '
                    + 'style="border: 1px solid #ccc;height: 2.142em;width: 14.857em;border-radius: 3px;margin-right: 0.714em"/></div>';
        var btnHtml = '<div style="width:100%;height:40px;margin-top:20px;">'
                    + '</div>';
        var confirmBtn = $('<div class="btn positive-btn" style="display:block;width:118px;'
                    + 'height:40px;line-height:40px;margin: 10px auto;">确定</div>');
        var layer = $(html);
        var panel = $(boxHtml);
        var closeBtn = $(closeBtnHtml);
        var header = $(headerHtml).append(closeBtn);
        var btns = $(btnHtml);
        btns.append(confirmBtn);
        panel.append(header).append(contentHtml).append(btns);
        layer.append(panel);
        $(document.body).append(layer);
        closeBtn.click(function () {
            layer.remove();
        });
        confirmBtn.click(function () {
            if (confirmCb) {
                var val = $('#oddsCard').val();
                confirmCb(val);
            }
            layer.remove();
        });
    };

    var showConfirm = function (text, confirmCb, cancelCb) {
        var html = '<div style="position:fixed;top:0px;left:0px;'
                    + 'right:0px;bottom:0px;background: rgba(0, 0, 0, 0.4);'
                    + 'z-index: 99;'
                    + '"></div>';
        var boxHtml = '<div style="position:absolute;left:50%;top: 200px;'
                    + 'width:500px;height:260px;margin-left:-250px;border-radius:3px;'
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
        var contentHtml = '<div style="width:100%;height:150px;line-height:150px;'
                    + 'text-align:center;font-size:18px;color:#565656;">' + text + '</div>';
        var btnHtml = '<div style="float:left;width:260px;height:40px;margin-left:120px;margin-top:20px;">'
                    + '</div>';
        var confirmBtn = $('<div class="btn positive-btn" style="width:118px;'
                    + 'height:40px;line-height:40px;">确定</div>');
        var cancelBtn = $('<div class="btn negative-btn" style="width:118px;height:40px;line-height:40px;margin-left:15px;">取消</div>');
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

    var bindOdds = function(dcdnId, oddsCardId) {
        // console.log(dcdnId);
        // console.log(oddsCardId);
        $.ajax({
            url: '/mining/bind-accelerate-card',
            type: 'POST',
            data: {
                dcdnId: dcdnId,
                cardSeriseNo: oddsCardId
            },
            dataType: 'json',
            success: function (res) {
                if (res.success) {
                    showConfirm("绑券成功");
                } else {
                    showConfirm(res.msg);
                }
            }
        });
    };

    $('#mining-detail table tbody').on('click', '.bind_odds', function (e) {
        var dcdnId = $(e.target).data('dcdn-id');
        showInputAlert(function(val) {
            // console.log(val);
            if(val.replace(/(^s*)|(s*$)/g, '').length == 0) {
                showConfirm('奖券序号不能为空');
                return;
            }
            bindOdds(dcdnId, val);
        });
    });
    // setInterval(function () {
    //     updateTotalSpeed();
    // }, 1000);
    // updateTotalSpeed()
}());
