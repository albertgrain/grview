var browser = function(){
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
	rtn.isOldIE = rtn.isIE & !!document.all;
	// Edge 20+
	rtn.isEdge = !rtn.isIE && !!window.StyleMedia;
	// Chrome 1 - 68
	rtn.isChrome = !!window.chrome && !!window.chrome.webstore;
	// Blink engine detection
	rtn.isBlink = (rtn.isChrome || rtn.isOpera) && !!window.CSS;
	return rtn;
};