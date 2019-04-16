/**
 * Grain's Remote
 * 服务器Ajax访问模块
 */
define(['gt'],function(gt){
	"use strict";
	var gr={};

	var defaultSuccess=function(rspn){
		if(rspn.ok){
			alert(rspn.rspn?rspn.rspn:"提交成功");
		}else{
			alert(rspn.msg);
		}
	};
	
	var defaultError = function(xmlhttp){
		if(console){
		   console.log(xmlhttp.responseText);
		}
		alert("服务器错误：Error:" + xmlhttp.status);
	};
	
	var defaultFunc400 = function(){
		alert("资源未定位(Error 400)");
	};
	/***
		ajax调用，至少需要提供params.url
		所有待提交的数据都应被编码为json对象，附在名为"data"的key后（key=#######）
		服务器端应读取key为"data"的项目，然后还原成json对象
	***/
	gr.ajax =function(params) {
		var defaultParams={
			url: "#" , 
			data: null,					//e.g. "Name=Tom&Age=20";
			success: defaultSuccess,	//callback function for successful ajax call
			error: defaultError,		//callback function for bad ajax call
			complete: function(){},		//callback after success or error
			func400: defaultFunc400,	//callback function for 400 ajax call
			method:"POST",
			returnJson:true				//return in Json format (or raw)
		};
		gt.attachDefaultParams(params, defaultParams);
		
		var xmlhttp = gt.createXmlHttpRequest();
		xmlhttp.onreadystatechange = function() {
			if (xmlhttp.readyState == 4 ) { //XMLHttpRequest.DONE==4
			   if (xmlhttp.status == 200) {
				   var rspn = params.returnJson? eval("("+xmlhttp.responseText+")"): xmlhttp.responseText;
				   params.success(rspn);
			   }else if (xmlhttp.status == 400) {
			       params.func400();
			   }else{
				   params.error(xmlhttp);
			   }
			   params.complete(xmlhttp.status);
			}
		};

		xmlhttp.open(params.method, params.url, true);
		xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
		//因为安全原因，请不要设置以下头信息，否则会在某些浏览器上引发警告
		//http://stackoverflow.com/questions/2623963/webkit-refused-to-set-unsafe-header-content-length
		//var len=params.data?params.data.length:0;
		//xmlhttp.setRequestHeader("Content-length", len);
		//xmlhttp.setRequestHeader("Connection", "close");
		xmlhttp.send(params.data);

	};
	
	/***
		rspn={
			ok = true /false,
			msg = success or error message return,
			rspn = list or object/success message returned
		}
		注意提交的form必须：
		1. 包含method、action属性
		2. 有一个submit按钮，可以有一个reset按钮
		3. 所有含有待提交数据的字段必须有name属性，不提交的数据不可有name属性
		4. clean=true: 成功提交后会清空form（reset）
	***/
	gr.ajaxForm=function(submit){ //Firefox : 第一个参数为submit button , IE: 第一个参数=undefined,所以用this更靠谱
		var prepareData = function(frm){
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
							data[attr]=el.value;  //Only checked is to send
						}
					}else{
						data[attr]=frm[i].value;
					}
				}
			}
			rtn= "data=" + gt.encode(data);
			return rtn;
		};
		
		var resetForm = function (frm){
			for(var j=0; j< frm.length; j++){
				var f=frm[j];
				if(f.type!="button" && f.type!="submit" && f.type!="reset"){
					f.value="";
				}
			}
		};
		
		var prepareSuccess = function(frm){
			var rtn = function(rspn){
				if(gt.isFunction(frm.success)){
					frm.success(rspn);
				}else{
					defaultSuccess(rspn);
				}
				if(rspn.ok && frm.clean){
					resetForm(frm);
				}			
			};
			return rtn;
		};
		
		var prepareError = function (frm){
			var rtn = function(xmlhttp){
				frm.error(xmlhttp);
			};
			return rtn;
		};

		var frm = this;
		var url = frm.action;
		var method=frm.method?frm.method:"POST";
		if(!gt.isFunction(frm.success)){
			frm.success=defaultSuccess;
		}
		if(!gt.isFunction(frm.error)){
			frm.error=defaultError;
		}
		if(frm.clean==undefined){
			frm.clean=true;
		}
		
		var params={
			url: url, 
			data: prepareData(frm),
			method: method,
			success: prepareSuccess(frm),
			error: prepareError(frm)
			
		};
				
		gr.ajax(params);
		//Must return false to diable submit
		return false;
	};
	
	var UPLOAD_URL="json/fup/add";
	var MAX_FILE_SIZE = 3 * 1024 * 1024;
	/***
	 * handle the change event of an input[file] element
	 * @param ev: change event
	 * @param params: parameters
	 * @param before: function to do before uploading
	 * @param after: function to do after loading or when error occured.
	 * @returns {Boolean}
	 */
	gr.upload = function(ev, params, before, after){
		if(window.FileReader){
			var pmDefault={
				url:UPLOAD_URL,	//optional. Default is json/fup/add
				data: null,		//mime image
				fullname:null, 	//Full client side file name with path
				show_type:"link",	//'link' or 'img'
				fl_memo: null,
				is_private: true	//true if save to private folder, false if save to public folder
			};
			var pm = gt.attachDefaultParams(params, pmDefault);
	    	var f = ev.target.files[0];
	    	var fr = new FileReader();
		    if(f!=null){
			    fr.readAsDataURL(f);
			}else{
				return false;
			};
			pm.fullname = ev.target.value;
	    	fr.onload = function(ev2) {
	    		 console.dir(ev2);
	    		 var dataToSave = ev2.target.result;
	    		 if(!dataToSave){
	    			 alert("文件内容为空");
	    			 return false;
	    		 }
	    		 if(dataToSave.length> MAX_FILE_SIZE){
	    			 alert("文件不可超过2.5M");
	    			 return false;
	    		 }
	    		 pm.data=dataToSave;
	    		 before();
    			 gr.ajax({
    				 url:pm.url,
    				 data: gt.serialize(pm),
    			 	 success: function(rspn){
    			 		 if(rspn.ok){
    			 			after(rspn.rspn);
    			 			alert("文件上传成功!");
    			 		 }else{
    			 			after();
    			 			alert(rspn.err.msg);
    			 		 }
    			 	 },
    			 	 error:function(){
    			 		 after();
    			 		 alert("server error");
    			 	 }
    			 });
		    };
		};
	};//End of gr.upload
	
	return gr;
});//end define
