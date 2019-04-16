define(['gt'], function(gt){
	"use strict";
	function pt(cnt, wdt){
		var width = wdt || "25em";
		this.x=0;
		var elm = gt.htmlToElement("<div id='loading' class='pmt-outer'><div class='pmt-middle'><div class='pmt-inner loading-box'></div></div></div>");
		elm.firstChild.firstChild.innerHTML=cnt;
		this.node = document.body.appendChild(elm);
		this.node.style.zIndex=-1;
		this.node.style.display="none";
		this.node.firstChild.firstChild.width=width;
		//console.dir(this.node);
	};
		
	pt.prototype.show = function(){
		this.node.style.display="table";
		this.node.style.zIndex=1000;
	};
	pt.prototype.hide = function(){
		this.node.style.display="none";
		this.node.style.zIndex=-1;
	};
	
	return pt;
});