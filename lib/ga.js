/***
 * Grain's Animation
 * 动画模块
 */
define(['gc','gt'],function(gc,gt){
	//Default parameter
	var DPM = {
		interval: 1000 /60,
		beforeStart: function(){},
		afterStop: function(){}
	};
	var WID_EM_PX = 12;
	var HET_EM_PX = 30;
	
	var ga= function(callback, params){
		this.callback = callback;
		this.pm = gt.combineParams(params, DPM);
	};
	
	ga.prototype = {
		constructor : ga,
		start : function(){
			this.pm.beforeStart();
			//console.log('Animation started');
			if(!this.id){
				this.id = setInterval(this.callback, this.pm.interval);
			}
		},
		stop : function(){
			clearInterval(this.id);
			this.id=null;
			//console.log("Animation stopped");
			this.pm.afterStop();
		}
	};
	/********** Twinkle twinkle litter dot *****/
	ga.twinkle = function(selector){
		this.elms = document.querySelectorAll(selector);
		this.visible = false;
		var that = this;
		this._showHide = function(show){
			for(var i=0;i<that.elms.length;i++){
				var stl=that.elms[i].style;
				if(show){		
					stl.visibility ="visible";
				}else{
					stl.visibility ="hidden";
				}
			}
		}; 
		
		this.tk = new ga(
			function(){
				that._showHide(that.visible);
				that.visible= !that.visible;
			},
			{interval:500}
		);
		
	};
	ga.twinkle.prototype = {
		constructor:ga.twinkle,
		start : function(){
			this.tk.start();
		},
		stop : function(){
			this.tk.stop();
			this._showHide(false);
		}
	};
	
	
	/************ Toaster ***************/
	var TS_DPM={
		backColor:"#12bc00",
		color:"white", 
		speed:2,
		msg:"[empty]",
		autoDispear:true
	};
	
	var SPEED ={
		1:{move:2, dur:3, fade:0.005}, //slowest
		2:{move:10, dur:2, fade:0.01},
		3:{move:18, dur:1, fade:0.02}
	};
	
	ga.toaster = function(params){
		this.pm = gt.combineParams(params, TS_DPM);
		this.tst = gt.ce("div");
		this.stl=this.tst.style;
		
		var msges=this.pm.msg.split("\n");
		
		this.tst.appendChild(gt.htmlToElement("<pre>"+msges.join("\n")+"</pre>"));
		document.body.appendChild(this.tst);
		
		var maxLen=0;
		for(var i=0;i<msges.length;i++){
			if(maxLen < msges[i].length){
				maxLen=msges[i].length;
			}
		}
		
		var tlen=(maxLen+4)*WID_EM_PX;
		var twidth=tlen>400?tlen:400;
		var theight=msges.length*HET_EM_PX;
		
		this.stl.position="absolute";
		this.stl.backgroundColor=this.pm.backColor;
		this.stl.color=this.pm.color;
		this.stl.textAlign="center";
		this.stl.width= twidth+"px";
		this.stl.height=theight+"px";
		this.stl.lineHeight=HET_EM_PX+"px";
		this.stl.overflowWrap="break-word";
		this.stl.borderRadius="5px";
		this.pos = gt.getWindow();
		this.hcenter =(this.pos.height/2 - theight/2);
		this.stl.left=(this.pos.width/2 - twidth/2)  + "px";
		this.stl.top=this.pos.height  + "px";
		this.stl.boxShadow="5px 5px 2px #657786";
	};
	
	ga.toaster.prototype = {
		constructor : ga.toaster,
		show : function(){
			var that=this;
			
			var params ={
					afterStop: function(){
						if(!that.pm.autoDispear){
							that.tst.addEventListener("click", function(e){
								document.body.removeChild(that.tst);
							});
							return;
						}
						setTimeout(function(){
							var op=1;
							var g2=new ga(function(){
								op -= SPEED[that.pm.speed].fade;
								if(op>=0){
									that.stl.opacity= op;
								}else{
									that.stl.opacity= 0;
									g2.stop();
									document.body.removeChild(that.tst);
								}
							});
							g2.start();
						}
						,SPEED[that.pm.speed].dur*1000);
					}
				};
			
			var curtop = that.pos.height;
			var g = new ga(function(){
				curtop -= SPEED[that.pm.speed].move;
				if(curtop > that.hcenter){
					that.stl.top = curtop + "px";
				}else{
					that.stl.top = that.hcenter + "px";
					g.stop();
				}
				
			},params);
			g.start();
		}
	};
	
	/**
	 * toast a message
	 * @param msg
	 * @param speed 1,2,3. 3 is fastest, default is 2.
	 */
	ga.msg = function(msg,autoDispear,speed){
		var g=new ga.toaster({msg:msg, autoDispear: autoDispear, speed:speed});
		g.show();
	};
	/***
	 * toast a warning
	 * @param msg
	 * @param speed 1,2,3. 3 is fastest, default is 2.
	 */
	ga.warn = function(msg, autoDispear, speed){
		var g=new ga.toaster({backColor:"#e0245e",color:"white", msg:msg, autoDispear:autoDispear, speed:speed});
		g.show();
	};
	
	/***
	 * toast a warning or redirect to login page
	 * @param err: object contains "code" and "msg" properties
	 * @param redirect: page redirect to
	 */
	ga.wor = function(err, redirect){
		if(err.code==gc.CODE_LOGIN){
			window.location.replace(redirect?redirect:gc.LOGIN_PAGE);
		}else{
			ga.warn(err.msg);
		}
	};
	return ga;
});

