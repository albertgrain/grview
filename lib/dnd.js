/**
 * DnD support
 * Usage:      
 * dnd.bind({
 *  src: ".dnd-src span",
 *  dst: ".dnd-src span",
 *  dragstart: function(e){console.log("2 drag start ...")},
 *  beforedrop: function(e){console.log("2 before drop ..."); return true;},
 *  afterdrop: function(e){console.log("2 after drop ...")}
 * });
 * 
 * DnD allow multiple binding. 
 * Destination container include "data-append='true'" to allow appending, 
 * otherwise, overwrite will happen.
 */
define(['gt'],function(gt){
    var currentElm = null;
    var dragstart=function(){};
    var beforedrop = function(){};
    var afterdrop= function(){};

    var bindedEventIds=[];
    
    function _dragstart(e) {
        e.dataTransfer.setData('text/plain', this.id); //make Firefox DnD to work !!
        e.dataTransfer.effectAllowed = 'move';
        currentElm = this;
        this.style.opacity = '0.4';
        this._pms.dragstart(e, currentElm); //carry DnD data if available
    }

    var bindSrc = function(srcs, pms){
        [].forEach.call(srcs, function(src) {
        	src._pms=pms;
            bindedEventIds.push(
                gt.EventHelper.addListener(src, 'dragstart', _dragstart , false)
            );
            bindedEventIds.push(
                gt.EventHelper.addListener(src, 'dragend', function(e) {
                    this.style.opacity = 1;
                }, false)
            );
        });
    };

    function _drop(e){
        if (e.stopPropagation) {
            e.stopPropagation(); // Stops some browsers from redirecting.
        }
        if(!this._pms.beforedrop(e, currentElm)){
            console.log("drop cancelled!");//stop dropping
            return false;
        } 
        if(this.dataset['append']){//If this is a container, append dragged item into it.
            this.appendChild(currentElm);  
        }else{//replace the item / switch position on page
            var tmp = currentElm.innerHTML;
            currentElm.innerHTML = this.innerHTML;
            this.innerHTML = tmp;
        }
        this.classList.remove('dnd-over'); 
        this._pms.afterdrop(e, currentElm);
        return false;
    }
    var bindDest = function(dests, pms){
        [].forEach.call(dests, function(dest){
        	dest._pms=pms;
            bindedEventIds.push(
                gt.EventHelper.addListener(dest, 'dragenter', function(e){
                    this.classList.add('dnd-over');
                }, false)
            );
            bindedEventIds.push(
                gt.EventHelper.addListener(dest, 'dragover', function(e){
                    if (e.preventDefault) {
                        e.preventDefault(); // Necessary. Allows us to drop.
                    }
                    e.dataTransfer.dropEffect = 'move';
                    return false;
                }, false)
            );
            bindedEventIds.push(
                gt.EventHelper.addListener(dest, 'dragleave', function(e){
                    this.classList.remove('dnd-over'); 
                }, false)
            );
            bindedEventIds.push(
                gt.EventHelper.addListener(dest, 'drop', _drop)
            );
        });
    };//end bindDest;

    var dnd ={};
    var defaultPms = {
        src:null,
        dst:null,
        dragstart:function(e, i){},
        beforedrop: function(e, i){return true;},
        afterdrop: function(e, i){},
        type:null
    };

    var DnDPms = function(params){
        gt.extend(this, defaultPms, params);
    };

    /* dnd绑定 */
    dnd.bind = function(spms){
        var pms = new DnDPms(spms);
        if(!pms.src || !pms.dst){
            throw "Source and Destination should be assigned before DnD binding";
        }
        ///assing srouce
        if(gt.isString(pms.src)){
            bindSrc(document.querySelectorAll(pms.src), pms);
        }else if(pmd.src instanceof NodeList){
            bindSrc(pms.src, pms);
        }else if(pmd.src instanceof Element){
            var srcArray=[];
            srcArray.push(pms.src);
            bindSrc(srcArray, pms);
        }else{
            throw "Unknown DnD source type";
        }
        // assign destination
        if(gt.isString(pms.dst)){
            bindDest(document.querySelectorAll(pms.dst), pms);
        }else if(dst instanceof NodeList){
            bindDest(pms.dst, pms);
        }else if(dst instanceof Element){
            var dstArray=[];
            dstArray.push(pms.dst);
            bindSrc(dstArray, pms);
        }else{
            throw "Unknown DnD destination type";
        }

        return this;
    };

    /* 接触dnd绑定 */
    dnd.unbind = function(){
        [].forEach.call(bindedEventIds, function(id) {
            gt.EventHelper.removeListener(id);
        });
    };

    return dnd;
});//end of define