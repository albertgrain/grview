/**
 * Grain's Tools
 * 工具模块
 */
define(function(){
	"use strict";
	
	String.prototype.format = function () {
        var a = this;
        for (var k in arguments) {
            a = a.replace(new RegExp("\\{" + k + "\\}", 'g'), arguments[k]);
        }
        return a;
    };
	
	var gt={};
	//http://stackoverflow.com/questions/195951/change-an-elements-class-with-javascript
	gt.hasClass = function(elm, cls){
		return new RegExp('(\\s|^)' + cls + '(\\s|$)').test(elm.className);
	};
	gt.removeClass = function (elm, cls){
		if (gt.hasClass(elm, cls)) {
			var reg = new RegExp('(\\s|^)' + cls + '(\\s|$)', 'g');
			elm.className = elm.className.replace(reg, ' ').trim();
		}
	};
	gt.appendClass =function(elm, cls){
		if (!gt.hasClass(elm, cls)) elm.className += " " +cls.trim();
	};

	gt.toggleClass=function(elm, cls){
		if(gt.hasClass(elm, cls)){
			gt.removeClass(elm,cls);
		}else{
			gt.appendClass(elm, cls);
		}
	};

	gt.toString = function(obj){
		return (obj===undefined || obj===null)?"":obj.toString();
	};
	
	gt.isFunction = function(functionToCheck) {
		var getType = {};
		return functionToCheck && getType.toString.call(functionToCheck) === '[object Function]';
	};

	gt.isString = function(strToCheck){
		return (typeof strToCheck=='string') && strToCheck.constructor==String; 			
	};
	
	gt.isObject = function(obj){
		return (typeof obj === "object") && (obj !== null);
	};

	gt.isInt = function(value){
		if((parseFloat(value) == parseInt(value)) && !isNaN(value)){
			return true;
		} else {
			return false;
		}
	};
	
	gt.isArray = function(obj){
		if(Array.isArray){
			return Array.isArray(obj);
		}else{
			return Object.prototype.toString.call(obj) === '[object Array]';
		}
	};
	
	//Returns true if it is a DOM node, works in IE7
	gt.isNode = function(o){
	  return (
	    typeof Node === "object" ? o instanceof Node : 
	    o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
	  );
	};

	//Returns true if it is a DOM element, works in IE7    
	gt.isElement = function(o){
	  return (
	    typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
	    o && typeof o === "object" && o !== null && o.nodeType === 1 && typeof o.nodeName==="string"
	  );
	};

	gt.getRandomInt=function(min, max) {
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};
	
	gt.serialize = function (obj) {
		  var str = [];
		  for(var p in obj)
		    if (obj.hasOwnProperty(p)) {
		      str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
		    }
		  return str.join("&");
	};	
	gt.decode = function(strData) {
	      return JSON.parse(decodeURIComponent(strData));
	};
	gt.encode = function(data) {
		if(gt.isString(data)){
			return encodeURIComponent(data);
		}else{
			return encodeURIComponent(JSON.stringify(data));
		}
    };
	
    //params is changed and return
	gt.attachDefaultParams = function(params, defaultParams){
		for (var pn in defaultParams){ 
			if (params[pn]===undefined){  
				params[pn]=defaultParams[pn];
			}  
		}
		return params;
	};
	
	//params is untouched
	gt.combineParams = function(params, defaultParams){
		if(!params){
			params={};
		}
		var rtn={};
		for (var pn in defaultParams){ 
			if (params[pn]===undefined){  
				rtn[pn]=defaultParams[pn];
			}else{
				rtn[pn]=params[pn];
			}
		}
		return rtn;
	};
	
	gt.createXmlHttpRequest =function(){    
		if(window.ActiveXObject){ //如果是IE浏览器    
			return new ActiveXObject("Microsoft.XMLHTTP");    
		}else if(window.XMLHttpRequest){ //非IE浏览器    
			return new XMLHttpRequest();    
		}    
	};

	/***
		取得屏幕像素值。
		percent 折合百分比 0-1之间小数
	***/
	gt.getScreen=function(percent){
		var width, height;
		//function load(){
		if(window.outerHeight){
			width = window.outerWidth;
			height = window.outerHeight;
		}
		else {
			width = document.body.clientWidth;
			height = document.body.clientHeight; 
		}
		if(percent!==undefined && percent <=1 && percent >0){
			return {width:parseInt(width * percent), height:parseInt(height * percent)};
		}else{
			return {width:width, height:height};
		}
	};
	
	gt.getWindow=function(){
		var width, height;
		width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
		height = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
		return {width:width, height:height};
	};
	
	/**
	 * 判断浏览器是否支持SVG图形
	 */
	gt.supportSVG = function(){
		return document.implementation.hasFeature('http://www.w3.org/TR/SVG11/feature#Image', '1.1');
	};

	/**
	 * 模仿jQuery的extend
	 * http://www.jianshu.com/p/04b1d88dabf2
	 * 未测试
	 */
	gt.extend = (function() {
		var isObjFunc = function(name) {
			var toString = Object.prototype.toString;
			return function() {
				return toString.call(arguments[0]) === '[object ' + name + ']';
			};
		};
		var isObject = isObjFunc('Object'),
			isArray = isObjFunc('Array'),
			isBoolean = isObjFunc('Boolean');
		return function extend(){
			var index = 0,isDeep = false,obj,copy,destination=null,source,i;
			if(isBoolean(arguments[0])) {
				index = 1;
				isDeep = arguments[0];
			}
			for(i = arguments.length - 1;i>index;i--) {
				destination = arguments[i - 1];
				source = arguments[i];
				if(isObject(source) || isArray(source)) {
					for(var property in source) {
						obj = source[property];
						if(isDeep && ( isObject(obj) || isArray(obj) ) ) {
							copy = isObject(obj) ? {} : [];
							var extended = extend(isDeep,copy,obj);
							destination[property] = extended; 
						}else {
							destination[property] = source[property];
						}
					}
				} else {
					destination = source;
				}
			}
			return destination;
		};
	})();
	
	/**
	* HTML相关字符串处理
	*/
	var REGX_HTML_ENCODE = /"|&|'|<|>|[\x00-\x20]|[\x7F-\xFF]|[\u0100-\u2700]/g;
    var REGX_HTML_DECODE = /&\w+;|&#(\d+);/g;
	var REGX_TRIM = /(^\s*)|(\s*$)/g;
	var HTML_DECODE = {
        "&lt;" : "<",
        "&gt;" : ">",
        "&amp;" : "&",
        "&nbsp;": " ",
        "&quot;": "\"",
        "©": ""
        // Add more
    };

    gt.escapeHtml = function(s){
        s = (s != undefined) ? s : this.toString();
        return (typeof s != "string") ? s :
            s.replace(REGX_HTML_ENCODE,
                      function($0){
                          var c = $0.charCodeAt(0), r = ["&#"];
                          c = (c == 0x20) ? 0xA0 : c;
                          r.push(c); r.push(";");
                          return r.join("");
                      });
    };

    gt.unEscapeHtml = function(s){
        s = (s != undefined) ? s : this.toString();
        return (typeof s != "string") ? s :
            s.replace(REGX_HTML_DECODE,
                      function($0, $1){
                          var c = HTML_DECODE[$0];
                          if(c == undefined){
                              // Maybe is Entity Number
                              if(!isNaN($1)){
                                  c = String.fromCharCode(($1 == 160) ? 32:$1);
                              }else{
                                  c = $0;
                              }
                          }
                          return c;
                      });
    };

    gt.trim = function(s){
        s = (s != undefined) ? s : this.toString();
        return (typeof s != "string") ? s :
            s.replace(this.REGX_TRIM, "");
    };


    gt.hashCode = function(){
        var hash = this.__hash__, _char;
        if(hash == undefined || hash == 0){
            hash = 0;
            for (var i = 0, len=this.length; i < len; i++) {
                _char = this.charCodeAt(i);
                hash = 31*hash + _char;
                hash = hash & hash; // Convert to 32bit integer
            }
            hash = hash & 0x7fffffff;
        }
        this.__hash__ = hash;

        return this.__hash__;
    };
	
    /***
     * Parse all parameters in URL
     * @returns list of url paremters
     */
	gt.getUrlVars = function() {
	    var vars = {};
	    var parts = window.location.href.replace(/[?&]+([^=&]+)=([^&]*)/gi, function(m,key,value) {
	        vars[key] = value;
	    });
	    return vars;
	};
	
	/***
	 * Get one parameter from URL
	 * @param parameter parameter name
	 * @param defaultvalue default parameter value
	 * @returns
	 */
	gt.getUrlParam = function(parameter, defaultvalue){
	    var urlparameter = defaultvalue;
	    if(window.location.href.indexOf(parameter) > -1){
	        urlparameter = gt.getUrlVars()[parameter];
	        }
	    return urlparameter;
	};



	/**
	 * https://stackoverflow.com/questions/5660131/how-to-removeeventlistener-that-is-addeventlistener-with-anonymous-function
	 * 用于帮助方便地增加和删除事件绑定
	 */
	gt.EventHelper = (function(){
		var i = 1,
			listeners = {};
	
		return {
			addListener: function(element, event, handler, capture) {
				element.addEventListener(event, handler, capture);
				listeners[i] = {element: element, 
								 event: event, 
								 handler: handler, 
								 capture: capture};
				return i++;
			},
			removeListener: function(id) {
				if(id in listeners) {
					var h = listeners[id];
					h.element.removeEventListener(h.event, h.handler, h.capture);
					delete listeners[id];
				}
			}
		};
	}());
	
	gt.log = function(msg){
		if(console){
			console.log(msg);
		}
	};
	gt.error = function(msg, silent, tag){
		var bs=silent?silent:true;
		var stag=tag?tag:"ERROR";
        if(bs){
            gt.log(stag + ": " +msg);
        }else{
            throw stag + msg;
        }
	};
	
	/*
	 * ***** HTML DOM related *******
	 */
	
	 /* node: parent node to be emptyed 
	 */
	gt.empty= function(node) {
		if(node!=null){
			while (node.hasChildNodes()) {
				node.removeChild(node.lastChild);
			}
		}else{
			alert("can not remove null node");
		}
	};
	
	/**
	 * Find first child from the parent
	 * @param selector: css selector
	 * @param parent: start from which node, if not assigned, document is used 
	 * @returns null if not found
	 */
	gt.findFirst = function(selector, parent){
		var from=null;
		if(parent){
			if(parent instanceof Element){
				from=parent;
			}else{
				throw "Parent must be a DOM element";
			}
		}else{
			from=document;
		}
		var nodes = from.querySelectorAll(selector);
		if(nodes.length>=1){
			return nodes[0];
		}else{
			return null;
		}
	};

	gt.htmlToElementIE =function(xmlString) {
		var parser=new DOMParser();
  		var doc = parser.parseFromString(xmlString, "text/html"); //!
		return doc.firstChild;
	};

	gt.htmlToElement=function(html) {
		var template = document.createElement('template');
		html = html.trim(); // Never return a text node of whitespace as the result
		template.innerHTML = html;
		return template.content.firstChild;
	};

	//Brief for createElement
	gt.ce = function(elm){
		return document.createElement(elm);
	};
	//Brief for createTextNode
	gt.ct = function(txt){
		return document.createTextNode(txt);
	};
	
	gt.browser = function(){
		var rtn = {};
		// Opera 8.0+
		rtn.isOpera = (!!window.opr && !!opr.addons) || !!window.opera || navigator.userAgent.indexOf(' OPR/') >= 0;
		// Firefox 1.0+
		rtn.isFirefox = typeof InstallTrigger !== 'undefined';
		// Safari 3.0+ "[object HTMLElementConstructor]" 
		rtn.isSafari = /constructor/i.test(window.HTMLElement) || (function (p) { return p.toString() === "[object SafariRemoteNotification]"; })(!window['safari'] || (typeof safari !== 'undefined' && safari.pushNotification));
		// Internet Explorer 6-11
		rtn.isIE = /*@cc_on!@*/false || !!document.documentMode;
		// Internet Explorer 6-10
		rtn.isOldIE = rtn.isIE && !!document.all;
		// Edge 20+
		rtn.isEdge = !rtn.isIE && !!window.StyleMedia;
		// Chrome 1 - 68
		rtn.isChrome = !!window.chrome && !!window.chrome.webstore;
		// Blink engine detection
		rtn.isBlink = (rtn.isChrome || rtn.isOpera) && !!window.CSS;
		return rtn;
	};

	return gt;
}); // end define
