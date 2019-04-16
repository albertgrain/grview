/**
 * Grain's Form
 * 表单模块
 */
define(['gt'],function(gt){
	"use strict";
	/**
	 * 只允许绑定一个form!
	 * gf只返回数据,自身不保存数据(何gb的本质不同)
	 * 通过getVals方法从指定form中读取所有input类型数据
	 * 通过setVals方法向制定form写入{key:val}中的值
	 * @param frm: 一个form或form ID
	 */
	var gf = function(fm){
		var frm;
		if(gt.isString(fm)){
			frm = document.getElementById(fm);
		}else{
			frm = fm;
        }
        
        var funcs={
            /**
             * 获得form中的input类控件元素
             * @param {*} inputName 控件的name
             */
            elm : function(inputName){
                return frm[inputName];
            },
            /**
             * 获得form中的input类控件元素的值
             * @param {*} inputName 控件的name 
             */
            val : function(inputName){
                return frm[inputName].value;
            },
            
            getVal : function(inputName){
            	return this.val(inputName);
            },

            /**
             * 给form中的input类控件元素的值
             * @param {*} inputName 待赋值控件的name 
             * @param {*} inputName 待赋值控件的值 
             */
            setVal : function (inputName, val){
                frm[inputName].value=val;
                return this;
            },

            /**
             * 将form中的input的内容转化为hash/json表
             * 注意，只处理包含name属性的input
             */
            getVals : function (){
                var data = {};
                for (var i = 0; i < frm.length; ++i) {
                    var el = frm[i];
                    if(gt.isFunction(el)){
                        continue;
                    }
                    var attr= el.getAttribute("name");
                    if(attr){
                        if(el.type == 'checkbox' || el.type=='radio'){
                            if(el.checked){
                                if(el.value){				//只收集非空值
                                    data[attr]=el.value;	//Only checked is to send
                                }
                            }
                        }else{
                            if(frm[i].value){			//只收集非空值
                                data[attr]=frm[i].value;
                            }
                        }
                    }
                }
                return data;
            },

            /**
             * 将用键值对组成的数据导入form各input元素中
             * @param {*} hash 键值对(哈希表)对象
             * @param {*} more 额外赋值函数
             */
            setVals : function(hash, more){
                for(var key in hash) {
                    for (var i = 0; i < frm.length; ++i) {
                        var el = frm[i];
                        if(gt.isFunction(el)){
                            continue;
                        }
                        var attr= el.getAttribute("name");
                        if(key == attr){
                            if(el.type == 'checkbox'){
                                el.checked=true;
                            }else if(el.type=='radio'){
                                //Ensured cleaned!
                                el.checked = false;
                                if(el.value == hash[key]) {
                                    el.checked = true;
                                }
                            }else{
                                if(frm[i].value){
                                    frm[i].value=hash[key];
                                }
                            }
                        }
                    }
                }
                if(gt.isFunction(more)){
                    more();
                }
                return this;
            },

            /**
             * 将form内的所有值重置
             * @param {*} more 额外的重置操作
             */
            reset : function(more){
                for (var i = 0; i < frm.length; i++){
                    var field_type = frm[i].type.toLowerCase();
                    switch (field_type){
                    case "text":
                    case "password":
                    case "textarea":
                    case "hidden":
                        frm[i].value = "";
                        break;
                    case "radio":
                    case "checkbox":
                        if (frm[i].checked)
                        {
                            frm[i].checked = false;
                        }
                        break;
                    case "select-one":
                    case "select-multi":
                        frm[i].selectedIndex = -1;
                        break;
                    default:
                        break;
                    }
                    if(gt.isFunction(more)){
                        more();
                    }
                }
            }
        };//End of var funcs
		return Object.freeze(funcs);
	};
	/* ************************************************************** */
	
	/**
	 * 对vals进行读写,将vals数据写入container包含name的元素中，不可以从container中读取数据。
	 * container可以是一个div，数据是所有包含name属性的元素。
	 * 适用方法类似gf.setVals和gf.getVals
	 * @param {*} vals 键值对(哈希表)对象
	 * @param container
	 */
	gf.cont = function(container, vals){
		this.vals=vals || {};
		if(gt.isString(container)){
			this.cnt = document.getElementById(container);
		}else{
			this.cnt = container;
        }
	};
	gf.cont.prototype = {
		constructor: gf.cnt,
		/**
         * 用键值对组成的数据修改所有键与name属性相匹配的页面元素的text
         * @param {*} vals 键值对(哈希表)对象,如果为定义，则取默认vals
         */
        setVals : function(vals){
        	if(vals){
        		this.vals=vals;
        	}
        	var elms = this.cnt.querySelectorAll('[name]');
        	for(var key in this.vals){
	        	for(var i in elms){
	        		if(gt.isElement(elms[i]) && key == elms[i].getAttribute("name")){
	        			elms[i].innerHTML=this.vals[key];
	        			break;
	        		}
	        	}
        	}
        	return this;
        },
        setVal : function(name, val){
        	this.vals[name]=val;
        	var elms = this.cnt.querySelectorAll("[name='"+name+"']");
        	for(var i in elms){
        		if(gt.isElement(elms[i]) && name == elms[i].getAttribute("name")){
        			elms[i].innerHTML=val;
        			break;
        		}
        	}
        	return this;
        },
        
        getVal : function(name){
        	return this.vals[name]; 
        },
        getVals : function(){
        	return this.vals;
        }, 
        reset : function(){
        	for(var i in elms){
        		elms[i].innerHTML="";
        	}
        	return this;
        }
	};//End of funcs
	

	return gf;
});//end define