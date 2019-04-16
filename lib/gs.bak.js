
/**
 * Grain's Status
 * 状态控制模块
 */
define('gt', function(gt){
	var TAG_HEAD = "__HEAD__";
	var TAG_END = "__END__";
	/***
	 * @param name: the user defined name of the status
	 * @param status: the properties of current state
	 */
	var gs =function(name, status){
		this.name = name;
		this.isStart = TAG_HEAD==name?true:false;
		this.isEnd = TAG_END==name?true:false;
		//follower candidates list
		this.flwLst = [];
		//previous state
		this.previous = null;
		//next state
		this.next = null;
		this.status = status?status:{};
	};
	
	gs.prototype = {
		constructor:gs.state,
		/***
		 * Set the following state object
		 * @param nextState(s): a state object or a list of state objects that follows current state
		 */
		addFollowers: function(nextState){
			if(this.isEnd){
				throw "End state does not have follower.";
			}
			if(gt.isArray(nextState)){
				this.flwLst = this.flwLst.concat(nextState);
			}else{
				this.flwLst.push(nextState);
			}
		},
		/**
		 * Activate state transition
		 * @param nextState: The state that follows current state
		 * @return next state if transferable and transfer succeeded, throw exception
		 */
		transfer: function(nextState){
			
		},
		
		goback: function(prevState){
			
		},
		
		equals: function(state){
			return this.name==state.name;
		}
	};
	
	gs.HEAD = new gs("__HEAD__", true, false);
	gs.HEAD.goback = function(){return false;};
	gs.END = new gs("__END__", false, true);
	gs.END.transfer=function(){return false;};
	
	/***
	 * return a singleton as gs
	 */
	return (function(){
		var instance={}; 
		var machine={
			transitions:[],
			add: function(name, from, to){
				for(var tr in this.transitions){
					if(tr.name == name){
						return false;
					}
				}
				this.transitions.push({name:name, from:from, to:to});
			},
			addAll: function(list){
				this.transitions.concat(list);
			},
			get: function(name){
				for(var tr in this.transitions){
					if(tr.name == name){
						return tr;
					}
				}
				return null;
			},
			getAll: function(){
				return this.transitions;
			}
		};
		return {
			HEAD:TAG_HEAD,
			END:TAG_END,
			getState: function (name, status){
				if(instance.hasOwnProperty(name)){
					return instance[name];
				}else{
					var st = new gs(name, status);
					instatnce[name] = st;
					return st;
				}
			},
			getMachine: function(){
				
				return machine;
			}
		}
	})();
});