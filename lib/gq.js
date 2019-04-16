/***
 * Grain's Query
 * 页面元素查询模块
 */
define(['gt'],function(gt){
	"use strict";
	/***
	* 全局变量：用于保存on注册的事件/toggle的display样式等内容
	* 结构为[{elm:绑定事件的元素, funcs:{事件名1:回调函数1, ...}, oldDisplay:元素旧display样式,字符串}]
	*/
	var 
	__globalStore = [],
	/* 从全局变量中查找项目并返回。没找到返回null */
	_findItemInStore = function(elm){
		var rtn = null;
		__globalStore.forEach(function(item,idx){
			if(item.elm === elm){
				rtn = item;
				return false;
			}
		});
		return rtn;
	},
	/* 从全局变量中删除项目，成功返回true，没找到或失败返回false*/
	_deleteItemFromStore = function(elm){
		var rtn = false;
		__globalStore.forEach(function(item,idx){
			if(item.elm === elm){
				__globalStore.splice(idx, 1);
				rtn = true;
				return false;
			}
		});
		return rtn;
	};
	/*******************************************************************************/
	
	/**
	 * 通过$("..")选中的一组NodeList对象，传入参数可以为查询字符串或通过查询得到的一组对象
	 */
	var gq = function(selector){
		return new gqp(selector);
	};
	
	function gqp(selector){
		if(gt.isString(selector)){
			this.elms=document.querySelectorAll(selector);
		}else if(selector instanceof gqp){ 
			this.elms=selector.elms;
		}else if(selector instanceof NodeList){
			this.elms=selector;
		}else if(selector instanceof Element){
			this.elms=[];
			this.elms.push(selector);
		}else{
			throw "Unknown selector type. It may be either a query string or a NodeList, or an Element (eg. selected by getElementById)";
		}
		this.elm=this.elms[0];
	};
	
	gqp.prototype ={
		constructor: gqp,
		
		/*****************  单元素操作   **************
		 * 如果选择了多个对象，仅对第一个对象进行操作
		*/
		id:function(){
			return this.getId();
		},		
		getId : function(){return this.elm.id;},
		/* 取得第i个元素，并用gqp包裹起来。比elms更方便 */
		items : function(i){
			return this.getItem(i);
		},
		getItem: function(i){
			return new gqp(this.elms[i]);
		},

		getData: function(dataName){
			return this.elm.dataset[dataName];
		},

		visible: function(){
			reutrn (this.elm.offsetWidth === 0 && this.elm.offsetHeight === 0);
		},
			
		hasClass : function(clsName){
			return gt.hasClass(this.elm,clsName);
		},
		removeClass : function(clsName){
			gt.removeClass(this.elm, clsName);
			return this;
		},
		appendClass : function(clsName){
			gt.appendClass(this.elm, clsName);
			return this;
		},
		toggleClass : function(clsName){
			gt.toggleClass(this.elm, clsName);
			return this;
		},

		/* 绑定事件
			event: 事件名, handler:事件响应函数, capture 默认为false
		*/
		addListener : function(event, handler, capture){
			return gt.EventHelper.addListener(this.elm, event, handler, capture?true:false);
		},
	
		/* 移除事件绑定
			id: 绑定事件时生成的id
		*/
		removeListener : function(id){
			return gt.EventHelper.removeListener(id);
		},
				
		/** 查找与定位 **/
		/* 从当前元素开始根据查询字符串查找子元素*/
		find : function(selector){
			return new gqp(this.elm.querySelectorAll(selector));
		},
		/* 取得父元素（Element和Node）	*/
		parent : function(){
			return this.getParent();
		},
		getParent: function(){
			return new gqp(this.elm.parentNode);
		},
		
		/* 取得下一个兄弟元素（Element和Node）	*/
		next : function(){
			return getNext(this.elm);
		},
		/* 取得前一个兄弟元素（Element和Node）	*/
		prev : function(){
			return getPrev(this.elm);
		},

		/*****************  多元素操作   **************
		 * 如果选择了多个对象，会对所有的元素进行操作
		* v: 如果非空则为赋值（单元素赋值，返回该gp对象本身）
		/** 取得对象值。如果选中多个对象则返回它们的值的数组 */
		val: function(v){
			if(this.elms.length==0){
				return null;
			}else if(this.elms.length==1){
				if(v!==undefined){
					this.elm.value=v;
					return this;
				}else{
					return this.elm.value;
				}
			}else{
				var rtn=[];
				for(var i=0; i<this.elms.length; i++){
					rtn.push(this.elms[i].value);
				}
				return rtn;
			}
		},
		getVal:function(v){
			return this.val(v);
		},
		
		/*** 事件注册 **/
		/**
		* 基本事件（如click）只能绑定一次，后绑定将覆盖前绑定；但可以在基本事件基础上再绑定多个带命名空间的事件（如click.mysubmit）
		* 事件名必须是小写
		* eventName:带命名空间的事件名(如click.mysubmit), callback:回调函数, 是否保存element与事件关联关系以便可能的off调用
		*/
		on : function(eventName, callback, keepForOff){
			var enm = eventName.toLowerCase();	//如：click.mysubmit
			var enmBasic = enm.split(".")[0];	//如: click
			for(var i=0; i<this.elms.length; i++){
				if(keepForOff){ //remove duplicate event binding
					var item = _findItemInStore(this.elms[i]);
					if(item){
						this.elms[i].removeEventListener(enmBasic, item.funcs[enm], false);
						item.funcs[enm] = callback;
					}else{// create a new item and insert into event store
						var funcs = {};
						funcs[eventName]=callback;
						item = {elm:this.elms[i], funcs:funcs};
						__globalStore.push(item);
					}
				}
				this.elms[i].addEventListener(enmBasic, callback, false);
			}
			return this;
		},
		/**
		* 与this.on配套使用
		*/
		off : function(eventName){
			var enm = eventName.toLowerCase();
			var enmBasic = enm.split(".")[0];
			for(var i=0; i<this.elms.length; i++){
				var item = _findItemInStore(this.elms[i]);
				if(item){
					this.elms[i].removeEventListener(enmBasic, item.funcs[enm], false);
					_deleteItemFromStore(enmBasic, item.funcs[enm], false);
					delete item.funcs[enm];
					if(item.funcs.length==0){
						_deleteItemFromStore(item);
					}
				}
			}
			return this;
		},
			
		
		hide : function(){
			for(var i=0; i<this.elms.length; i++){
				showHide(this.elms[i],false);
			}
		},
		
		show : function(){
			for(var i=0; i<this.elms.length; i++){
				showHide(this.elms[i], true);
			}
		},
		
		toggle : function(){
			for(var i=0; i<this.elms.length; i++){
				showHide(this.elms[i], isHidden(this.elms[i]));
			}
		},
		
		clean: function(){
			for(var i=0; i<this.elms.length; i++){
				this.elms[i].innerHTML="";
			}
		},

		empty: function(){
			for(var i=0;i<this.elms.length;i++){
				gt.empty(this.elms[i]);
			}
		},
		remove: function(child){
			if(child instanceof gqp){
				return this.elm.removeChild(child.elm);
			}else{
				return this.elm.removeChild(child);
			}
		},
		append: function(frag){
			if(frag){
				if(frag instanceof gqp){
					this.elm.appendChild(gqp.elm);
				}else if(gt.isString(frag)){
					for(var i=0;i<this.elms.length;i++){
						var toAdd=gt.htmlToElement(frag);
						this.elms[i].appendChild(toAdd);
					}
				}else if(frag instanceof Element){
					this.elm.appendChild(frag);
				}
			}
			return this; //make continously appending possible
		}

	};

	function getNext(el){
		if(el==null){
			return null;
		}
		var nxt=el.nextSibling;
		if(nxt!=null && nxt.nodeType == Node.ELEMENT_NODE){
			return new gqp(nxt);
		}else{
			return getNext(nxt);
		}
	}

	function getPrev(el){
		if(el==null){
			return null;
		}
		var prv=el.previousSibling;
		if(prv!=null && prv.nodeType == Node.ELEMENT_NODE){
			return new gqp(prv);
		}else{
			return getPrev(prv);
		}
	}

	/**************  隐藏与显示 Copied from jQuery************************/
	// get the default display style of an element
	function getComputedDisply(el){
		return (window.getComputedStyle ? getComputedStyle(el, null) : el.currentStyle).display;
	}

	function isHidden(el){
		if('none'== getComputedDisply(el)){
			return true;
		}
		return false;
	}

	gq.visible = function(el){
		return !isHidden(el);
	};

	function defaultDisplay(tag) {
		var iframe = document.createElement('iframe');
		iframe.setAttribute('frameborder', 0);
		iframe.setAttribute('width', 0);
		iframe.setAttribute('height', 0);
		document.documentElement.appendChild(iframe);

		var doc = (iframe.contentWindow || iframe.contentDocument).document;

		// IE support
		doc.write();
		doc.close();

		var testEl = doc.createElement(tag);
		doc.documentElement.appendChild(testEl);
		var display = getComputedDisply(testEl);
		iframe.parentNode.removeChild(iframe);
		return display;
	}

	// actual show/hide function used by show() and hide() below
	function showHide(el, show) {
		var value = el.getAttribute('data-olddisplay'),
			display = el.style.display,
			computedDisplay = getComputedDisply(el);

		if (show) {
			if (!value && display === 'none') el.style.display = '';
			if (el.style.display === '' && (computedDisplay === 'none')) value = value || defaultDisplay(el.nodeName);
		} else {
			if (display && display !== 'none' || !(computedDisplay == 'none'))
				el.setAttribute('data-olddisplay', (computedDisplay == 'none') ? display : computedDisplay);
		}
		if (!show || el.style.display === 'none' || el.style.display === '')
			el.style.display = show ? value || '' : 'none';
	}
	/**************  隐藏与显示 END ************************/

	return gq;

});//end define