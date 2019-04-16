/**
 * Grain's Binding
 * 绑定模块
 */
define(['gt','gf','gq'],function(gt,gf,$$){
    "use strict";
    /***
     * 半自动双向model-view绑定
     * 必须指定vals（key-val对象）和被绑定的form（ID或form对象）
     */
    function gb(args){
        this._vals= args.vals||{};	//vals(key/value pair) to be assigned
        this._mapping=args.mapping||{};	//tells how to bind model(value) with view(HTML)
        this._form=gt.isString(args.form)?document.getElementById(args.form):args.form;	//The FORM element or the id of the FORM element which contains all input element with name the same as the key
        this._silent=args.silent||false;	//throw error when true, log error when false or undefined
        this._notOneLess=args.notOneLess||false; //every property must be properly processed
    };

    /**
     * Load model from a HTML FORM (view). And return an gb object
     * 
     * @param {*} frm a FORM ID or a FORM object
     * @param {*} silent if true, errors will be sliently logged
     */
    gb.load=function (frm, silent){
        if(frm){
            var fm = gf(frm);
            var vals=fm.getVals();
            return new gb({vals:vals, form:frm, silent:silent});
        }else{
        	if(!this._silent){
        		throw "Form ID must be set to load from a FORM";
        	}
        }
    };
    
    /***
     * Load model from a HTML FORM (view).
     * The model may be empty, the FORM input names decide what attributes are set into model
     * Method getVals() only load value for attributes already existed in model. 
     */
    gb.prototype.load = function(){
    	if(frm){
	    	var fm = gf(this._form);
	    	this._vals=fm.getVals();
    	}else{
    		if(!this._silent){
    			throw "FORM ID or FORM object must be set to load from a FORM";
    		}
    	}
    };

    //Default mapping function, tells how to map model(value) to HTML element, vice versa.
    var _mvvm=function(self, isM2V, k){
        var f=self._form;
        var v=self._vals;
        if(f){
            if(isM2V){
                if(f[k]){
                    if(f[k].type == 'checkbox' || f[k].type=='radio'){
                        f[k].checked=v[k]?true:false;
                    }else{
                        if(v[k]==undefined){ //undefined or null
                        	f[k].value="";  //TODO check if work in input or select
                        }else{
                        	f[k].value=v[k];
                        }
                    }
                }
            }else{
                if(f[k].type == 'checkbox' || f[k].type=='radio'){
                    if(f[k].checked){
                        if(f[k].value){				//只收集非空值
                            v[k]=true;	//Only checked is to send
                        }
                    }else{
                        v[k]=false;
                    }
                }else{
                    v[k]=f[k].value;
                }
            }
        }
    };

    /**
     * If mapping function exists, then form will be neglected
     * @param {*} self 
     * @param {*} isM2V 
     * @param {*} key 
     * @param {*} vals 
     */
    var _syncVals=function(self, isM2V, key, vals){
        if(self._mapping){
            if(self._mapping.hasOwnProperty(key)) {
                var fn=self._mapping[key][isM2V?"m2v":"v2m"];
                if(fn){
                    fn(vals, key);
                    return;
                }   
            }
        }
        if(self._form){
            if(self._form[key]){
                self._vals[key]= gt.isObject(vals)?vals[key]:vals;
                _mvvm(self, isM2V, key);
            }else{
                gt.error("Form["+self._form.id+"] does not has an element named '"+ key+"'", true);
            }
        }else{
            if(self._notOneLess){
                gt.error("Either mapping or form should be assigned to key '" + key +"'", self._silent);
            }
        }
    };

    var _eachVal=function(self, isM2V, vals){
        for(var key in vals){
            _syncVals(self, isM2V,key, vals);
        }
    };

    /**
     * 用vals中的key-value覆盖_vals，并用mapping或form修改界面
     * @param {*} vals 
     */
    gb.prototype.setVals=function(vals) {
        _eachVal(this, true, vals?vals: this._vals);
        return this;
    };

    /*
     * 根据key提取界面值并同步到_vals中，然后相应记录并返回
     */
    gb.prototype.getVals=function(){
        _eachVal(this, false, this._vals);
        return this._vals;
    };
    
    gb.prototype.vals=function(){
    	return this._vals;
    };
	
    /**
     * convert model object to URL encoded string starting with 'data='
     * @returns {String}
     */
	gb.prototype.encodeVals=function(){
		var pms = this.getVals();
        return "data=" + gt.encode(pms);
	};

    /**
     * 根据key提取界面值并同步到_vals中，然后相应记录并返回
     * @param {*} vals 
     */
    gb.prototype.getVal=function(key){
        _syncVals(this, false,key, this._vals);
        return this._vals[key];
    };
    
    /**
     * 根据key提取model值同步到界面去,并返回该值
     * @param key: 键
     * @param val: 值。如果不提供，则吧model中已有val同步到界面去
     * @return this (gb)
     */
    gb.prototype.setVal=function(key, val){
    	if(val!==undefined){
    		this._vals[key]=val;
    	}
        _syncVals(this, true,key, this._vals);
        return this;
    };

    /**
     * Reset the form if it exist
     * @param {*} done : callback after the reset is done
     */
    gb.prototype.reset=function(done){
        if(!this._form){
            return false;
        }
        for (var i = 0; i < this._form.length; i++){
            var fty = this._form[i].type.toLowerCase();
            switch (fty){
            case "text":
            case "password":
            case "textarea":
            case "hidden":
                this._form[i].value = "";
                break;
            case "radio":
            case "checkbox":
                if (this._form[i].checked)
                {
                    this._form[i].checked = false;
                }
                break;
            case "select-one":
            case "select-multi":
                this._form[i].selectedIndex = -1;
                break;
            default:
                break;
            }
            if(gt.isFunction(done)){
                done();
            }
        }
        var names=this._vals.getOwnPropertyNames;
        if(names){
            for(var i=0;i<names;i++){
                this._vals[names[i]]=null;
            }
        }
        return true;
    };
	

   	/**
	 * 批量进行任意绑定。数据以行(row,一个key-val对象)的形式进行处理，实现多行数据与多行视图的对照
	 * @param container: an DOM element where the views should be appended to, or a element ID (String without '#') 
  	 * @param fm2v: Object contains functions mapping model (one row of data) to view
  	 * 				rtn = fm2v.before(container)
  	 * 				fm2v.eachRow(container, row, rtn)
  	 * 				fm2v.after(container)
  	 * 				fm2v.delRow(container, row)         //delete row from view  
	 * @param fv2m: Object contains function mapping view to model
	 * 				parameter is the same as fm2v
	 */
	gb.batch = function(container, fm2v, fv2m){
        if(gt.isString(container)){
			this.container = document.getElementById(container);
		}else{
			this.container = container;
        }
        this._vals=[];
		this._fm2v = fm2v || function(){};
        this._fv2m = fv2m || function(){return this._vals;};
    };
	gb.batch.prototype={
        constructor: gb.batch,
        vals:function(){
        	return this._vals;
        },
        setVals:function(rows){
            var tmp=null;
            if(this._fm2v.before){
                tmp = this._fm2v.before(this.container);
            }
            for(var i=0; i < rows.length; i++){
                this._fm2v.eachRow(this.container,rows[i], tmp);
            }
            if(this._fm2v.after){
                this._fm2v.after(this.container);
            }
            this._vals=rows;
		},
		// 请注意参数顺序是row, key
		setVal: function(row, key){
			this.delVal(row, key);
			this._vals.push(row);
			this._fm2v.eachRow(this.container,row);
		},
		getVals:function(){
			return this._vals.length>0?this._vals:this._fv2m(this.container);
        },
        getVal:function(row){
            for(var i=0;i<this._vals.length;i++){
                var k=Object.keys(row)[0];
                if(this._vals[i][k] == row[k]){
                    return this._vals[i];
                }
            }
            return  null;
        },
        /**
         * 从模型和视图中删除一行，请注意参数顺序是row, key
         * @param row 一行数据
         * @param key 行数据的主键字段名。如果不传递这个参数，则默认为行数据的第一个主键名
         * @returns {gb.batch}
         */
        delVal: function(row,key){
        	var k=null;
        	if(key===undefined){
        		k=Object.keys(row)[0];
        	}else{
        		k=key;
        	}
        	for(var i=0;i<this._vals.length;i++){
                if(this._vals[i][k] == row[k]){
                	var row= this._vals.splice(i,1); //row is an array
                	if(this._fm2v.delRow && row.length==1){
                		this._fm2v.delRow(this.container, row[0]);
                		break;
                	}
                }
            }
            return this;
        },
        empty: function(){
        	if(this._fm2v.delRow){
	        	for(var i=0; i<this._vals.length;i++){
	        		this._fm2v.delRow(this.container, this._vals[i]);
	        	}
        	}else{
        		$$(this.container).empty();
        	}
        	this._vals=[];
        }
	};
	/*** End of gb.batch ***/
	
	/*** Select Render ***/
	/***
	 * Assign value/text to one or more SELECT elements. 
	 * selector: selector of the SELECT element.
	 * list: a list of value-text pairs. e.g, [{value:2220123456, text:"张三"},{value:2220123457, text:"李四"}}]
	 * pm: other parameters
	 * 		tagValue: the key name of value item
	 * 		tagText: the key name of text item
	 * 		optClass: the CSS class for each option element
	 * 		renderFunc: the alternative funtion to render the select element
	 * 		firstRowEmpty: default false. Add an empty row at the beginning
	 * 		showKey: show key together with the text. For example, "2220123456 张三"
	 */
	gb.SelectRender = function(selector, list, pm){
		this.$sels = $$(selector);
		this._list = list;
		this.cfg = {tagValue:"value", tagText:"text", optClass:null, renderFunc:null, firstRowEmpty:false, showKey:false};
	    //config
		if(pm){
		    for (var key in pm) {
		        if (pm.hasOwnProperty(key)) { 
		        	this.cfg[key] = pm[key];
		        }
		    }
		}
	};
	gb.SelectRender.prototype = {
		constructor: gb.SelectRender,
		/** Reset and render the list to select element **/
		render: function(){
			if(this.cfg.renderFunc){
				this.cfg.renderFunc();
			}else{
				for(var i=0;i<this.$sels.elms.length;i++){
					var $sel=this.$sels.getItem(i);
					$sel.empty();
					if(this.cfg.firstRowEmpty){
						$sel.append("<option data-idx='0'> </option>");
					}
					for(var j=0;j<this._list.length;j++){
						var html = ("<option value='"+this._list[j][this.cfg.tagValue]+"'")+
								(" data-idx='"+ j + "'") +
								(this.cfg.optClass?" class='" +this.cfg.optClass+"'":"" +">")+
								(this._list[j][this.cfg.tagText]+ "</option>");
						$sel.append(html);
					}
				}
				
			}
			return this;
		},
		rebind: function(list){
			this._list=list;
			return this.render();
		},
		//取得Select元素当前选中值，如有多个select，则只返回第一个select选中值
		getVal: function(){
			if(gt.isArray(this.$sels)){
				return this.$sels[0].val();
			}else{
				return this.$sels.val();
			}
		},
		//取得当前select元素选中的所有值
		getVals: function(){
			var rtn = [];
			if(gt.isArray(this.$sels)){
				for(var i=0;i<this.$sels.length;i++){
					rtn.push(this.$sels[0].val());
				}
			}else{
				rtn.push(this.$sels.val());
			}
			return rtn;
		}		
	};
	/*** End of gb.selectRender ***/
	
	/*** UL Binder ***/
	/***
	 * Bind list of data with a UL element
	 * selector: selector of the UL element.
	 * list: a list of value-text pairs. e.g, [{val:10, text:"老人"},{val:10, text:"老人"}}]
	 * pm: other parameters
	 * 		tagText: the key name of text item
	 * 		optClass: the CSS class for each option element
	 * 		renderFunc: the alternative funtion to render the select element
	 * 		otherHTML: other HTML need to be inserted into the LI element
	 * 		showKey: show key with text or not
	 */
	gb.ULBinder = function(selector, list, pm){
		this.$sel = $$(selector).getItem(0);
		this._list = list||[];
		this._curIdx = -1;
		this.cfg = {selected:-1, tagValue:"value", tagText:"text", optClass:null, renderFunc:null, otherHTML:"", showKey:false};
	    //config
		if(pm){
		    for (var key in pm) {
		        if (pm.hasOwnProperty(key)) { 
		        	this.cfg[key] = pm[key];
		        }
		    }
		}
	};
	gb.ULBinder.prototype = {
		constructor: gb.ULBinder,
		getVals:function(){
			return this._list;
		},
		getVal:function(idx){
			return this._list[idx];
		},
		/** Reset and render the list to select element **/
		render: function(){
			if(this.cfg.renderFunc){
				this.cfg.renderFunc();
			}else{
				
				this.$sel.empty();
				for(var j=0;j<this._list.length;j++){
					var html = ("<li data-idx='"+ j + "'") +
							(this.cfg.optClass?" class='" +this.cfg.optClass+"'":"" +">")+
							((this.cfg.showKey?this._list[j][this.cfg.tagValue]+" ":"") + this._list[j][this.cfg.tagText])+ 
							(this.cfg.otherHTML + "</li>");
					this.$sel.append(html);
				}
				
				
			}
			return this;
		},
		rebind: function(list){
			this._list=[].concat(list);
			return this.render();
		},
		setVals:function(vals){
			this._list=[].concat(this._list, vals);
			return this.render();
		},
		setVal:function(val){
			return this.setVals(val);
		},
		empty:function(){
			this._list=[];
			return this.render();
		},
		delVal:function(idx){
			this._list.splice(idx,1);
			return this.render();
		},		
		/** 按照keyName 对_list进行筛选，去掉重复项**/
		pack:function(keyName){
		    /***
		     * 去除list中的冗余
		     */
		    function _uniquifyList(src, dst){
				for(var i in src){
					var found=false;
					for(var j in dst){
						if(src[i][keyName]==dst[j][keyName]){
							found=true;
							break;
						}
					}
					if(!found){
						dst.push(src[i]);
					}
				}
		    }
		    var uqfd = [];
	    	_uniquifyList(this._list, uqfd);
	    	this._list=uqfd;
	    	return this.render();
		}
		
		
	};
	/*** End of gb.ULBinder ***/
	
    return gb;
});//end define



