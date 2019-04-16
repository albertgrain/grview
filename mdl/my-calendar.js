function Calendar(inputId, varName) {
	this.RESTRICT_DATE_RANGE=false; 
    this.PREFIX = "CALENDAR_";
    this.SECURE_PAGE = "MSIE" == Browser.type ? "javascript:''" : "about:blank";
    this.WIDTH = 175;
    this.HEIGHT = 200;
    this.WEEKDAYS = {
        "Sunday": { en_abbr: "Sun.", abbr: "日", full: "星期日" },
        "Monday": { en_abbr: "Mon.", abbr: "一", full: "星期一" },
        "Tuesday": { en_abbr: "Tues.", abbr: "二", full: "星期二" },
        "Wednesday": { en_abbr: "Wed.", abbr: "三", full: "星期三" },
        "Thursday": { en_abbr: "Thur.", abbr: "四", full: "星期四" },
        "Friday": { en_abbr: "Fri.", abbr: "五", full: "星期五" },
        "Saturday": { en_abbr: "Sat.", abbr: "六", full: "星期六" }
    };
    this.MONTHS = [{ en: "january", text: "一", value: "01" }, { en: "february", text: "二", value: "02" }, { en: "march", text: "三", value: "03" }, { en: "april", text: "四", value: "04" }, { en: "may", text: "五", value: "05" }, { en: "june", text: "六", value: "06" }, { en: "july", text: "七", value: "07" }, { en: "august", text: "八", value: "08" }, { en: "september", text: "九", value: "09" }, { en: "october", text: "十", value: "10" }, { en: "november", text: "十一", value: "11" }, { en: "december", text: "十二", value: "12"}];
    this.config = { id: 0, size: 1, rows: 1, cols: 1, showToday: false, namespace: 'cal', range: { start: null, end: null, disabled: false }, bind: [], offsetX: 0, offsetY: 0, bindNext: true, format: '%y-%M-%d' };
    this.def_date = new Date();
    this.previous_list = null;
    this.isMultiple = false;
    this.index = 0;
    this.inputId = inputId;
    this.varName = varName;
};
Calendar.prototype = { init: function (cfg) {
    var conf = cfg || null;
    for (var key in conf) {
        if (conf.hasOwnProperty(key)) { this.config[key] = conf[key]; }
    }
    this.isMultiple = (this.config["size"] > 1);
    this.setCalendarCSS();
    this.bindCalendar();
}, getPosition: function (ref) {
    var _x = 0;
    var _y = 0;
    while (null != ref) {
        _x += ref.offsetLeft;
        _y += ref.offsetTop;
        ref = ref.offsetParent;
    }
    return { x: _x, y: _y };
}, createIframe: function () {
    var ifr = document.createElement("iframe");
    var cfg = this.config;
    var _id = this.PREFIX + "iframe_" + cfg.id;
    var _url = this.SECURE_PAGE;
    var attrs = { frameBorder: 0, vSpacing: 0, hSpacing: 0, marginWidth: 0, marginHeight: 0, scrolling: 'no', src: _url, id: _id };
    var _width = cfg.cols * this.WIDTH;
    var _height = cfg.rows * this.HEIGHT;
    for (var attr in attrs) {
        if (attrs.hasOwnProperty(attr)) {
            ifr.setAttribute(attr, attrs[attr]);
        }
    }
    ifr.style.cssText = "width:" + _width + "px; height:" + _height + "px; position:absolute; z-index:-1; left:0px; top:0px;";
    return ifr;
}, createPanel: function (refNode, offsetX, offsetY) {
    var cfg = this.config;
    var _id = this.PREFIX + "panel_" + cfg.id;
    var _calId = this.PREFIX + "calendar_" + cfg.id;
    var _width = cfg.cols * this.WIDTH;
    var _height = cfg.rows * this.HEIGHT;
    if (!cfg.showToday) {
        _height = cfg.rows * (this.HEIGHT - 25);
    }
    var panel = document.getElementById(_id);
    var ifr = null;
    var cal = null;
    var pos = null;
    var _this = this;
    pos = this.getPosition(refNode);
    if (null == panel) {
        cal = document.createElement("div");
        cal.setAttribute("id", _calId);
        panel = document.createElement("div");
        panel.setAttribute("id", _id);
        panel.style.cssText = "position:absolute; left:" + (pos.x + offsetX) + "px; top:" + (pos.y + offsetY) + "px; z-index:4000; width:" + _width + "px; height:" + _height + "px; display:none;";
        panel.className = "cal-panel";
        if (Browser.type == 'MSIE' || Browser.version == '6.0') {
            ifr = this.createIframe(); panel.appendChild(ifr);
        }
        panel.appendChild(cal);
        if (document.getElementById(this.varName) != null)
            document.getElementById(this.varName).appendChild(panel);
        else
            document.body.appendChild(panel);
        if (document.addEventListener) {
            panel.addEventListener("mouseup", function (event) {
                event.preventDefault(); event.stopPropagation();
            }, false);
        } else {
            panel.attachEvent("onmouseup", function () {
                window.event.returnValue = !(window.event.cancelBubble = true);
            });
        }
        cal.onmouseup = function (event) {
            var e = event || window.event;
            var obj = e.target || e.srcElement;
            var tagName = (obj.tagName).toLowerCase();
            var cls = (obj.className).toLowerCase();
            if ("span" != tagName || "code" != tagName || "cal-down" != cls) {
                _this.hidePreviousList();
            }
        };
    }
    panel.style.cssText = "position:absolute; left:" + (pos.x + offsetX) + "px; top:" + (pos.y + offsetY + 13) + "px; z-index:4000; width:" + _width + "px; height:" + _height + "px; display:none;";
    this.clearHistoryCalendar(_calId);
    return { "panel": panel, "calendar": cal };
}, clearHistoryCalendar: function (calId) {
    var cal = document.getElementById(calId);
    cal.innerHTML = "";
}, createTable: function (row, col) {
    var cfg = this.config;
    var _id = this.PREFIX + "table_" + cfg.id + "_" + row + "_" + col;
    var divId = this.PREFIX + "div_" + cfg.id + "_" + row + "_" + col;
    var div = document.createElement("div");
    var table = document.createElement("table");
    var tbody = document.createElement("tbody");
    var attrs = { id: _id, border: 0, cellpadding: 0, cellspacing: 0 };
    div.className = "cal-calendar-p";
    table.className = "cal-calendar";
    tbody.className = "cal-body";
    div.setAttribute("id", divId);
    for (var attr in attrs) {
        if (attrs.hasOwnProperty(attr)) { table.setAttribute(attr, attrs[attr]); }
    }
    table.appendChild(tbody);
    div.appendChild(table);
    return { t: table, b: tbody, p: div };
}, changeCalendar: function (row, col, format, interval, offset) {
    var cfg = this.config;
    var _id = this.PREFIX + "panel_" + cfg.id;
    var month_id = this.PREFIX + "month_" + cfg.id + "_" + row + "_" + col;
    var year_id = this.PREFIX + "year_" + cfg.id + "_" + row + "_" + col;
    var panel = document.getElementById(_id);
    var month = document.getElementById(month_id);
    var year = document.getElementById(year_id);
    var date = new Date();
    var dtStr = year.innerHTML + "-" + month.getAttribute("month") + "-01";
    date = date.parseDate(dtStr, format);
    if (offset != 0) {
        date = date.dateAdd(interval, offset);
    }
    this.clearHistoryCalendar(this.PREFIX + "calendar_" + cfg.id);
    this.createCalendar(panel, date, format);
    panel = null;
    year = null;
    month = null;
    date = null;
}, keyEvent: function (event, row, col, format, interval, offset) {
    var keyCode = event && event.button ? event.button : window.event.keyCode;
    if (13 == keyCode) {
        this.changeCalendar(row, col, format, interval, offset);
    }
}, hidePreviousList: function () {
    if (null != this.previous_list) {
        this.hideMonthList(this.previous_list.replace("year", "month"));
        this.hideYearList(this.previous_list.replace("month", "year"));
        this.previous_list = null;
    }
}, getMonthList: function (iMonth, row, col, format) {
    var cfg = this.config;
    var months = this.MONTHS;
    var size = months.length;
    //var str = "";
    var item = null;
    var start = iMonth;
    var end = start + 8;
    var str = '<div class="cal-pre-date" onclick="' + cfg.namespace + '.turnMonth(0, \'' + row + '\', \'' + col + '\', \'' + format + '\')"></div>';
    for (var i = start; i < size && i < end; i++) {
        item = months[i];
        str += '<div class="cal-list-month" onmouseover="this.className=\'cal-list-month-hovr\'" onmouseout="this.className=\'cal-list-month\'" onclick="' + cfg.namespace + '.setCheckedMonth(\'' + item.value + '\', \'' + item.text + '\', \'' + row + '\', \'' + col + '\', \'' + format + '\')">' + item.value + '月</div>';
    }
    str += '<div class="cal-next-date" onclick="' + cfg.namespace + '.turnMonth(4, \'' + row + '\', \'' + col + '\', \'' + format + '\')"></div>';
    return str;
}, turnMonth: function (iMonth, row, col, format) {
    var cfg = this.config;
    //var month_id = this.PREFIX + "month_" + cfg.id + "_" + row + "_" + col;
    var month_list_id = this.PREFIX + "month_list_" + cfg.id + "_" + row + "_" + col;
    var list = document.getElementById(month_list_id);
    list.innerHTML = this.getMonthList(iMonth, row, col, format);
    list = null;
}, setCheckedMonth: function (sMonth, sText, row, col, format) {
    var cfg = this.config;
    var month_id = this.PREFIX + "month_" + cfg.id + "_" + row + "_" + col;
    var month_list_id = this.PREFIX + "month_list_" + cfg.id + "_" + row + "_" + col;
    var month = document.getElementById(month_id);
    var list = document.getElementById(month_list_id);
    month.innerHTML = sMonth;
    month.setAttribute("month", sMonth);
    this.changeCalendar(row, col, format, 'y', 0);
    list.style.display = "none";
    month = null;
    list = null;
}, stopEventBubble: function (obj) {
    if (document.addEventListener) {
        obj.addEventListener("mouseup", function (event) {
            event.preventDefault(); event.stopPropagation();
        }, false);
    } else {
        obj.attachEvent("onmouseup", function () {
            window.event.returnValue = !(window.event.cancelBubble = true);
        });
    }
}, showMonthList: function (obj, row, col, format, monthId, monthListId) {
    var list = document.getElementById(monthListId);
    list.innerHTML = this.getMonthList(0, row, col, format);
    list.style.display = "block";
    list = null;
    this.hidePreviousList();
    this.hideYearList(monthListId.replace("month", "year"));
    this.previous_list = monthListId;
}, hideMonthList: function (monthListId) {
    var list = document.getElementById(monthListId);
    list.style.display = "none";
}, getYearList: function (iYear, row, col, format) {
    var cfg = this.config;
    var end = iYear + 8;
    var str = '<div class="cal-pre-date" onclick="' + cfg.namespace + '.turnYear(' + (iYear - 7) + ', \'' + row + '\', \'' + col + '\', \'' + format + '\')"></div>';
    for (var i = iYear; i < end; i++) {
        str += '<div class="cal-list-year" onmouseover="this.className=\'cal-list-year-hovr\'" onmouseout="this.className=\'cal-list-year\'" onclick="' + cfg.namespace + '.setCheckedYear(' + i + ', \'' + row + '\', \'' + col + '\', \'' + format + '\')">' + i + '年</div>';
    }
    str += '<div class="cal-next-date" onclick="' + cfg.namespace + '.turnYear(' + end + ', \'' + row + '\', \'' + col + '\', \'' + format + '\')"></div>';
    return str;
}, setCheckedYear: function (iYear, row, col, format) {
    var cfg = this.config;
    var year_id = this.PREFIX + "year_" + cfg.id + "_" + row + "_" + col;
    var year_list_id = this.PREFIX + "year_list_" + cfg.id + "_" + row + "_" + col;
    var year = document.getElementById(year_id);
    var list = document.getElementById(year_list_id);
    year.innerHTML = iYear;
    this.changeCalendar(row, col, format, 'y', 0);
    list.style.display = "none";
    year = null;
    list = null;
}, turnYear: function (iYear, row, col, format) {
    if (iYear < 1900) { iYear = 1900; }
    if (iYear > 2093) { iYear = 2093; }
    var cfg = this.config;
    //var year_id = this.PREFIX + "year_" + cfg.id + "_" + row + "_" + col;
    var year_list_id = this.PREFIX + "year_list_" + cfg.id + "_" + row + "_" + col;
    var list = document.getElementById(year_list_id);
    list.innerHTML = this.getYearList(iYear, row, col, format);
    list = null;
}, showYearList: function (obj, row, col, format, yearId, yearListId) {
    var year = document.getElementById(yearId);
    var list = document.getElementById(yearListId);
    var iYear = year.innerHTML * 1;
    list.innerHTML = this.getYearList(iYear, row, col, format);
    list.style.display = "block";
    year = null;
    list = null;
    this.hidePreviousList();
    this.hideMonthList(yearListId.replace("year", "month"));
    this.previous_list = yearListId;
}, hideYearList: function (yearListId) {
    var list = document.getElementById(yearListId);
    list.style.display = "none";
}, createHead: function (table, row, col, format) {
    var cfg = this.config;
    var _id = this.PREFIX + "head_" + cfg.id + "_" + row + "_" + col;
    var month_id = this.PREFIX + "month_" + cfg.id + "_" + row + "_" + col;
    var year_id = this.PREFIX + "year_" + cfg.id + "_" + row + "_" + col;
    var month_list_id = this.PREFIX + "month_list_" + cfg.id + "_" + row + "_" + col;
    var year_list_id = this.PREFIX + "year_list_" + cfg.id + "_" + row + "_" + col;
    var thead = table.createTHead();
    var tr = thead.insertRow(-1);
    var td = tr.insertCell(-1);
    var pre = (0 === row + col) ? '<em title="上一个月" class="cal-btn-month cal-btn-pre-month" onclick="' + cfg.namespace + '.changeCalendar(\'' + row + '\', \'' + col + '\', \'' + format + '\', \'n\', ' + (-1 * cfg.size) + ')"></em>' : '';
    var next = (cfg.size == (row + 1) * (col + 1)) ? '<em title="下一个月" class="cal-btn-month cal-btn-next-month" onclick="' + cfg.namespace + '.changeCalendar(\'' + row + '\', \'' + col + '\', \'' + format + '\', \'n\', 1)"></em>' : '';
    thead.setAttribute("id", _id);
    thead.className = "cal-head";
    td.colSpan = 7;
    td.innerHTML = pre + '<span onclick="' + cfg.namespace + '.showYearList(this, \'' + row + '\', \'' + col + '\', \'' + format + '\', \'' + year_id + '\', \'' + year_list_id + '\')"><code id="' + year_id + '"></code>年<em class="cal-down"></em></span><span onclick="' + cfg.namespace + '.showMonthList(this, \'' + row + '\', \'' + col + '\', \'' + format + '\', \'' + month_id + '\', \'' + month_list_id + '\')"><code id="' + month_id + '"></code>月<em class="cal-down"></em></span>' + next + '<div onmouseup="' + cfg.namespace + '.stopEventBubble(this)" id="' + year_list_id + '" class="cal-year-list" style="display:none;"></div><div onmouseup="' + cfg.namespace + '.stopEventBubble(this)" id="' + month_list_id + '" class="cal-month-list" style="display:none;"></div>';
    table = null;
    thead = null;
    tr = null;
    td = null;
}, createFoot: function (table, row, col) {
    var cfg = this.config;
    var _id = this.PREFIX + "head_" + cfg.id + "_" + row + "_" + col;
    var tfoot = table.createTFoot();
    var tr = tfoot.insertRow(-1);
    var td = tr.insertCell(-1);
    tfoot.setAttribute("id", _id);
    tfoot.className = "cal-foot";
    td.colSpan = 7;
    td.innerHTML = '<button title="' + ((new Date()).format("%y-%M-%d, %w")) + '" type="button" onclick="' + cfg.namespace + '.clickEvent()">今天</button>';
    table = null;
    tfoot = null;
    tr = null;
    td = null;
}, setCurrentDate: function (date, row, col) {
    var cfg = this.config;
    var month_id = this.PREFIX + "month_" + cfg.id + "_" + row + "_" + col;
    var year_id = this.PREFIX + "year_" + cfg.id + "_" + row + "_" + col;
    var month = document.getElementById(month_id);
    var year = document.getElementById(year_id);
    month.innerHTML = this.MONTHS[date.getMonth()].value;
    month.setAttribute("month", this.MONTHS[date.getMonth()].value);
    year.innerHTML = date.getFullYear();
}, createBody: function (table, row, col, date) {
    var currentDate = new Date(date.getFullYear(), date.getMonth(), 1);
    var firstDay = currentDate.getDay();
    var leapYear = date.leapYear();
    var monthDays = leapYear.monthDays;
    for (var i = 0; i < 7; i++) {
        if (0 == i) {
            this.createWeekDays(table, row, col, i);
        } else {
            this.createDate(table, row, col, currentDate, date, i, firstDay, monthDays);
        }
    }
}, createWeekDays: function (table, row, col, i) {
    var cfg = this.config;
    var _id = this.PREFIX + "tr_weekdays_" + cfg.id + "_" + row + "_" + col + "_" + i;
    var weekDays = this.WEEKDAYS;
    var tr = table.insertRow(-1);
    var td = null;
    var j = 0;
    tr.className = "cal-week";
    tr.setAttribute("id", _id);
    for (var key in weekDays) {
        if (weekDays.hasOwnProperty(key)) {
            _id = this.PREFIX + "td_weekdays_" + cfg.id + "_" + row + "_" + col + "_" + i + "_" + j;
            td = tr.insertCell(-1); td.innerHTML = weekDays[key]["abbr"];
            td.setAttribute("id", _id); j++;
        }
    }
    table = null; tr = null; td = null;
}, createDate: function (table, row, col, currentDate, date, i, firstDay, monthDays) {
    var cfg = this.config;
    var _id = this.PREFIX + "tr_date_" + cfg.id + "_" + row + "_" + col + "_" + i;
    var tr = table.insertRow(-1);
    tr.className = "cal-date";
    tr.setAttribute("id", _id);
    for (var j = 0; j < 7; j++) {
        this.createDay(tr, row, col, currentDate, date, i, j, firstDay, monthDays);
    }
}, inRange: function (date) {
	if(!this.RESTRICT_DATE_RANGE){
		return true;
	}
    var cfg = this.config;
    var ref = date.format("%y%M%d") * 1;
    var start = cfg.range.start ? (new Date().parseDate(cfg.range.start, "%y-%M-%d").format("%y%M%d")) * 1 : 0;
    var end = cfg.range.end ? (new Date().parseDate(cfg.range.end, "%y-%M-%d").format("%y%M%d")) * 1 : 99999999;
    var flag = false; if (ref >= start && ref <= end) { flag = true; }
    return flag;
}, createDay: function (tr, row, col, currentDate, date, i, j, firstDay, monthDays) {
    var cfg = this.config;
    //var _id = this.PREFIX + "td_date_" + cfg.id + "_" + row + "_" + col + "_" + i + "_" + j;
    var dis = cfg.range.disabled;
    var inc = false;
    var td = tr.insertCell(-1);
    var index = (i - 1) * 7 + j;
    var d2 = new Date();
    var d = currentDate.getDate();
    td.innerHTML = "&nbsp;";
    if (index >= firstDay && d <= monthDays && date.getMonth() == currentDate.getMonth()) {
        td.innerHTML = d;
        td.title = currentDate.format("%y-%M-%d, %w");
        inc = this.inRange(currentDate);
        if (!inc) {
            td.className = "cal-disabled";
        }
        if (!dis || inc) {
            this.bindClickEvent(td, new Date(currentDate.getTime()));
            this.bindMouseEvent(td);
            if (!inc) { td.className = "cal-not-in-range"; }
        }
        if (currentDate.format("%y%M%d") == d2.format("%y%M%d")) {
            td.className = inc ? "cal-current" : (dis ? "cal-disabled-current" : "cal-current");
        }
        if (currentDate.format("%y%M%d") == this.def_date.format("%y%M%d")) {
            td.className = inc ? "cal-def-date" : (dis ? "cal-disabled-current cal-def-date" : "cal-def-date");
        }
        currentDate.dateAdd("d", 1);
    } else {
        td.className = "cal-null";
    }
}, dispatchEvent: function (target, eventType, datatype, data) {
    var obj = typeof (target) == "object" ? target : document.getElementById(target);
    var e = null;
    if (document.createEvent) {
        e = document.createEvent("Events");
        e.initEvent(eventType, true, true);
    } else if (document.createEventObject) {
        e = document.createEventObject();
    } else { return false; }
    e.datatype = datatype;
    e.data = data;
    if (obj.dispatchEvent) {
        obj.dispatchEvent(e);
    } else if (obj.fireEvent) {
        obj.fireEvent("on" + eventType, e);
    }
}, clickEvent: function (currentDate) {
    var cfg = this.config;
    var next = null;
    var list = cfg.bind || [];
    var size = list.length - 1;
    var index = this.index + 1;
    var item = list[this.index];
    next = size >= index ? list[index] : null;
    currentDate = currentDate || new Date();
    if (item && null != item.handler) {
        item.args.unshift(currentDate);
        item.handler.apply(null, item.args);
        item.args.shift();
    }
    this.hide();
    if (cfg.bindNext && null != next) {
        this.dispatchEvent(next.ref, "click", null, null);
    }
}, bindClickEvent: function (td, currentDate) {
   // var cfg = this.config;
    var _this = this;
    td.onclick = function () { _this.clickEvent(currentDate); };
}, bindMouseEvent: function (td) {
    td.onmouseover = function () {
        var cls = this.className;
        cls = cls.replace(/[\s ]*cal\-mover[\s ]*/, "");
        this.className = cls + " cal-mover";
    };
    td.onmouseout = function () {
        var cls = this.className;
        cls = cls.replace(/[\s ]*cal\-mover[\s ]*/, "");
        this.className = cls;
    };
}, createCalendar: function (panel, date, format) {
    var cfg = this.config;
    var table = null;
    var rows = cfg.rows;
    var cols = cfg.cols;
    var calId = this.PREFIX + "calendar_" + cfg.id;
    var cal = document.getElementById(calId);
    for (var row = 0; row < rows; row++) {
        for (var col = 0; col < cols; col++) {
            table = this.createTable(row, col);
            this.createHead(table.t, row, col, format);
            this.createBody(table.b, row, col, date);
            if (true === cfg.showToday) {
                this.createFoot(table.t, row, col);
            } else {
                panel.style.height = rows * (this.HEIGHT - 25);
            }
            cal.appendChild(table.p);
            this.setCurrentDate(date, row, col);
            date.setDate(1);
            date = date.dateAdd("n", 1);
        }
    }
    panel.style.display = "block";
    if (document.addEventListener) {
        document.addEventListener("mouseup", function (event) {
            panel.style.display = "none";
            document.removeEventListener("mouseup", arguments.callee, false);
        }, false);
    } else {
        document.attachEvent("onmouseup", function () {
            panel.style.display = "none"; document.detachEvent("mouseup", arguments.callee);
        });
    }
}, compatible: function (strDate, format) {
    var fmts = ["%y%M%d", "%y-%M-%d", "%y.%M.%d", "%y年%M月%d日", "%y年%M月%d", "%M%d%y", "%M-%d-%y", "%M.%d.%y", "%M月%d日%y年", "%M月%d日%y", "%d%M%y", "%d-%M-%y", "%d.%M.%y", "%d日%M月%y年", "%d日%M月%y", "%M/%d, %w", "%d/%M, %w", "%M/%d, %W", "%d/%M, %W", "%M/%d, %a", "%d/%M, %a", "%M/%d, %A", "%d/%M, %A"];
    var size = fmts.length;
    var valid = null;
    var date = new Date();
    var str = strDate;
    valid = date.validDate(strDate, format);
    if (!valid.isValid) {
        for (var i = 0; i < size; i++) {
            valid = date.validDate(strDate, fmts[i]);
            if (valid.isValid) { date = valid.date; break; }
        }
    } else {
        date = valid.date;
    }
    str = date.format(format);
    return str;
}, bindCalendar: function () {
    var list = this.config.bind || [];
    var size = list.length;
    var o = null;
    var item = null;
    for (var i = 0; i < size; i++) {
        item = list[i];
        o = document.getElementById(item.ref);
        if (null != o) {
            this.setBindEvent(o, item, i);
        }
    }
}, setBindEvent: function (o, item, i) {
    var _this = this;
    var fmt = this.config.format || "%y-%M-%d";
    if (document.addEventListener) {
        o.addEventListener("click", function () {
            _this.show(o, item.input, _this.config.offsetX, _this.config.offsetY, fmt, i);
        }, false);
    } else {
        o.attachEvent("onclick", function () {
            _this.show(o, item.input, _this.config.offsetX, _this.config.offsetY, fmt, i);
        });
    }
}, show: function (refNode, inputId, offsetX, offsetY, format, index) {
    this.index = index;
    var panel = this.createPanel(refNode, offsetX, offsetY);
    var def = document.getElementById(inputId);
    var defDate = null != def ? (def.value).bothTrim() : "";
    if (defDate && defDate.indexOf(' ') != -1) {
        defDate = defDate.substr(0, defDate.indexOf(' '));
    }
    var date = new Date();
    var fmt = (format || "%y-%M-%d");
    defDate = this.compatible(defDate, fmt);
    date = date.parseDate(defDate, fmt);
    this.def_date = new Date().parseDate(defDate, fmt);
    this.createCalendar(panel.panel, date, fmt);
}, hide: function () {
    var cfg = this.config;
    var _id = this.PREFIX + "panel_" + cfg.id;
    var panel = document.getElementById(_id);
    panel.style.display = "none";
    panel = null;
}, dynamicStyle: function (cssTexts, suffix) {
    var id = "dynamic_style_" + (suffix || (new Date().getTime()));
    var style = document.getElementById(id);
    if (null == style) {
        style = document.createElement("style");
        style.type = "text/css"; style.rel = "stylesheet";
        style.setAttribute("id", id);
        document.getElementsByTagName("head")[0].appendChild(style);
        if ("MSIE" == Browser.type) {
            style.styleSheet.cssText = cssTexts.join("");
        } else {
            for (var i = 0; i < cssTexts.length; i++) {
                style.sheet.insertRule(cssTexts[i], i);
            }
        }
    }
    return style;
}, setCalendarCSS: function () {
    var cssTexts = ['.cal-panel{font:normal normal normal 12px/16px simsun; overflow:hidden; background:#fff;}', '.cal-panel .cal-calendar-p{width:175px; height:auto; position:relative; float:left;}', '.cal-panel .cal-calendar{border:#9DB0BC solid 1px; width:175px; height:auto; border-collapse:separate; *border-collapse:collapse;}', '.cal-panel .cal-calendar td{padding:0px; margin:0px; border:none;}', '.cal-panel .cal-head, .cal-panel .cal-body, .cal-panel .cal-foot{width:100%;}', '.cal-panel .cal-head td{border-bottom:#9DB0BC solid 1px; height:28px; vertical-align:middle; text-align:center;}', '.cal-panel .cal-head em.cal-btn-month{display:-moz-stack-inline; display:inline-block; zoom:1; *display:inline; padding:0px; margin:0px; width:0px; height:0px; overflow:hidden; border-top:solid 7px #fff; border-bottom:solid 7px #fff; cursor:pointer; vertical-align:middle; position:absolute; top:7px;}', '.cal-panel .cal-head em.cal-btn-pre-month{border-right:solid 7px #7c9db1;border-left:none; left:5px;}', '.cal-panel .cal-head em.cal-btn-next-month{border-right:none; border-left:solid 7px #7c9db1; right:5px;}', '.cal-panel .cal-head span{display:-moz-stack-inline; display:inline-block; zoom:1; *display:inline; width:56px; height:22px; _height:12px; line-height:26px; margin:0px 3px; _padding:2px 0px 0px 0px; cursor:pointer; vertical-align:middle; overflow:hidden;}', '.cal-panel .cal-head code{display:inline; margin:0px 2px 0px 0px;}', '.cal-panel .cal-head em.cal-down{display:-moz-stack-inline; display:inline-block; zoom:1; *display:inline; margin:0px 0px 0px 2px; width:0px; height:0px; border-left:solid 4px #fff; border-right:solid 4px #fff; border-top:solid 4px #7c9db1;border-bottom:none; cursor:pointer; vertical-align:2px; overflow:hidden;}', '.cal-panel .cal-head div.cal-year-list{position:absolute; left:30px; top:22px; border:1px solid #9DB0BC; background:#f8f8f8; width:48px; height:146px;}', '.cal-panel .cal-head div.cal-pre-date{width:0px; height:0px; border-left:solid 4px #f8f8f8; border-right:solid 4px #f8f8f8; border-bottom:solid 4px #7c9db1; margin:3px auto; cursor:pointer; overflow:hidden;}', '.cal-panel .cal-head div.cal-next-date{width:0px; height:0px; border-left:solid 3px #f8f8f8; border-right:solid 3px #f8f8f8; border-top:solid 3px #7c9db1; margin:3px auto; cursor:pointer; overflow:hidden;}', '.cal-panel .cal-head div.cal-list-year{height:16px; line-height:16px; overflow:hidden; cursor:pointer; color:#666;}', '.cal-panel .cal-head div.cal-list-year-hovr{height:16px; line-height:16px; overflow:hidden; cursor:pointer; background:#07679C; color:#fff;}', '.cal-panel .cal-head div.cal-month-list{position:absolute; left:94px; top:22px; border:1px solid #9DB0BC; background:#f8f8f8; width:48px; height:146px;}', '.cal-panel .cal-head div.cal-list-month{height:16px; line-height:16px; overflow:hidden; cursor:pointer; color:#666;}', '.cal-panel .cal-head div.cal-list-month-hovr{height:16px; line-height:16px; overflow:hidden; cursor:pointer; background:#07679C; color:#fff;}', '.cal-panel .cal-week td{border-bottom:#9DB0BC solid 1px; width:25px; height:20px; text-align:center; color:#333;}', '.cal-panel .cal-date td{width:25px; height:20px; text-align:center; color:#07679C; cursor:pointer;}', '.cal-panel .cal-date td.cal-null{cursor:default;}', '.cal-panel .cal-date td.cal-current{background:#043C59; color:#fff;}', '.cal-panel .cal-date td.cal-disabled{color:#999; cursor:default;}', '.cal-panel .cal-date td.cal-disabled-current{background:#043C59; color:#fff; cursor:default;}', '.cal-panel .cal-date td.cal-not-in-range{color:#999;}', '.cal-panel .cal-date td.cal-mover{background:#07679C; color:#fff;}', '.cal-panel .cal-date td.cal-def-date{background:#07679C; color:#fff;}', '.cal-panel .cal-foot td{border-top:#9DB0BC solid 1px; height:25px; vertical-align:middle; text-align:center;}', '.cal-panel .cal-foot button{border:none; background:#fff; font:normal normal normal 12px/16px simsun; color:#333; cursor:pointer;}'];
    this.dynamicStyle(cssTexts, "calendar_v1.5");
}
};

Calendar.prototype.xiaKeInit = function (id, varName, handler, settings) {
    if (jQuery('#' + id).length <= 0 || varName == '') { return; }
    if (typeof handler != "function") {
        handler = function (date) {
            var format = date.format("%y-%M-%d");
            var nature = Xiake.natureDate(date);
            jQuery('#' + id).val(format + ' ' + nature);

            var index = id.toUpperCase().replace("FLIGHTDATE", "");
            if (index != "") {
                var f = BFJR.Flights.Get(index);
                if (f != null) {
                    f.FlightDate = format + ' ' + nature;
                }
            }
        };
    }
    var input = { ref: id, input: id, handler: handler, args: [id] };
    var defaultSettings = { id: 0, size: 2, rows: 1, cols: 2, range: { start: new Date().format("%y-%M-%d"), end: null, disabled: true }, namespace: varName, bind: [input], offsetX: 0, offsetY: 20, bindNext: false, showToday: false };
    for (var key in settings) { defaultSettings[key] = settings[key]; }
    settings = defaultSettings;
    this.init(settings);
};


Calendar.natureDate = function (date) {
    if (!(date instanceof Date)) { return ''; }
    //var nature;
    var now = new Date(); date.setHours(0, 0, 0, 0); now.setHours(0, 0, 0, 0); var daysDiff = parseInt((date.getTime() - now.getTime()) / (24 * 3600 * 1000)); var nature; switch (daysDiff) { case -2: nature = '前天'; break; case -1: nature = '昨天'; break; case 0: nature = '今天'; break; case 1: nature = '明天'; break; case 2: nature = '后天'; break; default: var weekMap = { 'sun': '日', 'mon': '一', 'tue': '二', 'wed': '三', 'thu': '四', 'fri': '五', 'sat': '六' }; var week = date.toString().substr(0, 3).toLowerCase(); nature = '星期' + weekMap[week]; }
    return nature;
}; 


