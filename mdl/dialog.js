define(['gt','gr'], function(gt,gr){
	
	function dlg(html, width, height){
		var wd = width || "25em";
		var ht = height || "10em";
		this.x=0;
		var elm = gt.findFirst("div#dialog");
		if(!elm){
			elm = gt.htmlToElement("<div id='dialog' class='pmt-outer'><div class='pmt-middle'><div class='pmt-inner dialog-box'></div></div></div>");
		}
		this.dlgBox=elm.firstChild.firstChild;
		gt.empty(this.dlgBox);
		
		this.dlgBox.innerHTML=html;
		this.node = document.body.appendChild(elm);
		this.node.style.zIndex=-1;
		this.node.style.display="none";
		this.dlgBox.style.width=wd;
		this.dlgBox.style.minHeight=ht;
		this.dlgBox.style.backgroundColor="white";
		this.dlgBox.style.padding="1em";
		this.dlgBox.style.borderRadius="5px";
		this.dlgBox.style.boxShadow="10px 10px 5px #657786";
		this.dlgBox.style.border="1px solid #657786";
		//console.dir(this.node);
	};
	
	dlg.prototype.attachScript=function(attFun){
		if(gt.isFunction(attFun)){
			attFun();
		}else{
			throw "Attaching script is not a function";
		}
		return this;
	};
		
	dlg.prototype.show = function(){
		this.node.style.display="table";
		this.node.style.zIndex=500;
	};
	dlg.prototype.hide = function(){
		this.node.style.display="none";
		this.node.style.zIndex=-1;
	};
	   
    dlg.prototype.setContentHTML = function(htmlStr){
        this.dlgBox.innerHTML=htmlStr;
    };

    dlg.prototype.setContentByUrl = function (htmlUrl, callback){
        gr.ajax({
            url:htmlUrl,
            returnJson:false,
            success:function(rspn){
                this.setContentHTML(rspn);
                callback(dlgBox);
            }
        });
    };
    dlg.prototype.close = function(callback){
        this.hide();
        if(gt.isFunction(callback)){
            callback();
        }
        gt.empty(this.dlgBox);
    };

    dlg.prototype.find=function(selector){
        return gt.findFirst(selector, this.dlgBox);
    };
    return dlg;
});