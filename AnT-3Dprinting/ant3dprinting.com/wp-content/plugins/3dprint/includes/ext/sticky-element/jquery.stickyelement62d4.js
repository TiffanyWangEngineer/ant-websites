;(function(jQuery,win){
    'use strict';
     var requestFrame = (function(){
        var raf = win.requestAnimationFrame ||
            win.mozRequestAnimationFrame ||
            win.webkitRequestAnimationFrame ||
            function(fn){ return win.setTimeout(fn,20); };
        return function(fn){ return raf(fn); };
    })();

    // Check if the browser supports the transition CSS property
    var style = (win.document.body || win.document.documentElement).style;
    var prop = 'transition';
    var supportsTransition = typeof style[prop] == 'string';

    var events = {
        created:'sticky2-created',
        update:'sticky2-update',
        top:'sticky2-hit-top',
        bottom:'sticky2-hit-bottom',
        frozen:'sticky2-frozen',
        unfrozen:'sticky2-unfrozen'
    };

    /**
     * Sticky2 Element constructor
     * @param elm {String}
     * @param par {String}
     * @param [options] {Object}
     * @constructor
     */
    var Sticky2 = function(elm,par,options){
        this.element = elm;
        this.parent = par;

        this._frozen = false;
        this._stopped = true;
        this.options = jQuery.extend({
            useTransition:true,
            animate:true,
            animTime:200,
            animDelay:300
        },options);

        var offset = parseInt(options.offset, 10);
        this.options.offset = isNaN(offset) ? 0 : offset;

        this.init();
    };

    Sticky2.prototype.init = function(){
        var transition = '';
        if(this.options.useTransition && supportsTransition){
            transition = 'top ' + this.options.animTime + 'ms ease-in-out';
            this.options.animate = false;
        }

        this.parent.css({'position':'relative'});
        this.element
            .addClass('sticky2-scroll')
            .css({
                'transition':transition,
                'position':'relative'
            });

        this.element.trigger(events.created);
        this.update();
    };

    /**
     * This will handle any resizing of the container the sticky2 scroll is in and update the boundaries if necessary
     */
    Sticky2.prototype.update = function(){

        this.setBoundaries(0);
        this.moveIt();
        this.element.trigger(events.update);
    };

    /**
     * This will decide whether to move the stickied item
     */
    Sticky2.prototype.moveIt = function(){
	//check settings
	if (p3d.adjust_position!='on') return;


	//if mobile view
	if (window.matchMedia('(max-width: 767px)').matches) {
//		jQuery('form.variations_form.cart div.woocommerce-variation-add-to-cart').first().show();
		jQuery('div.images').css('top', '0px');
		return;
	}
	else {
//		jQuery('form.variations_form.cart div.woocommerce-variation-add-to-cart').first().hide();
	}



	var reviews_height = jQuery('div.woocommerce-tabs').height() || 0;


        var scrollTop = (win.document.documentElement.scrollTop || win.document.body.scrollTop) + this.options.offset;
	if (p3d.show_reviews=='on')
	        var height = this.element.outerHeight(true) + reviews_height;
	else
	        var height = this.element.outerHeight(true);

	if (parseFloat(p3d.sticky_menu_offset)>0) height += parseFloat(p3d.sticky_menu_offset)

        var realStop = this._stop - height;

        if(this._parentHeight - this._offset > height && !this._frozen){
            if(scrollTop >= this._start && scrollTop <= realStop){
                // Element is between top and bottom
                this.updateOffset(scrollTop - this._start);
                this._stopped = false;
            } else {

                if(scrollTop < this._start){
                    // Element is at top
                    this.updateOffset(0);

                    if(!this._stopped){
                        this.element.trigger(events.top);
                    }
                    this._stopped = true;
                } else if(scrollTop > realStop){
                    // Element is at bottom
                    this.updateOffset(this._parentHeight - height - this._offset);
                    if(!this._stopped){
                        this.element.trigger(events.bottom);
                    }
                    this._stopped = true;
                }
            }
        }
    };

    /**
     * This will set the boundaries the stickied item can move between and it's left position
     * @param [offset] {Number} Manually set the element offset
     */
    Sticky2.prototype.setBoundaries = function(offset){
        this._offset = typeof offset === 'undefined' ? this.element.position().top : offset;
        this._start = this.parent.offset().top + this._offset;

        this._parentHeight = this.parent[0].offsetHeight;
        this._stop = this._start + this._parentHeight - this._offset;
    };

    /**
     * Update the Y offset to calculate against
     * @param newOffset {Number}
     */
    Sticky2.prototype.setOffset = function(newOffset){
        newOffset = parseInt(newOffset, 10);
        if(!isNaN(newOffset)){
            this.options.offset = newOffset;
            this.moveIt();
        }
    };

    /**
     * Update Stickied Element's offset thereby moving it up/down the page
     * @param yOffset {Number}
     */
    Sticky2.prototype.updateOffset = function(yOffset){
        if(this._lastPosition !== yOffset){
            if(this.options.animate){
                this.element.stop(true,false).delay(this.options.animDelay).animate({
                    'top':yOffset
                },this.animTime);
            } else {
                this.element.css('top',yOffset);
            }

            this._lastPosition = yOffset;
        }
    };

    /**
     * This will freeze/unfreeze the stickied item
     */
    Sticky2.prototype.toggleFreeze = function(){
        this._frozen = !this._frozen;
        this.element.stop(true,false);
        if(!this._frozen){
            this.element.trigger(events.unfrozen);
            this.moveIt();
        } else {
            this.element.trigger(events.frozen);
        }
    };

    jQuery.fn.sticky2 = function(parentName,options){
        var method = parentName;
        var ret = false;

        this.each(function(){
            var self = jQuery(this);
            var instance = self.data('sticky2Instance');

            if(instance && (options || method)){

                if(typeof options === 'object'){
                    ret = jQuery.extend(instance.options,options);
                } else if(options === 'options'){
                    ret = instance.options;
                } else if(typeof instance[method] === 'function'){
                    ret = instance[method].call(instance,options);
                } else {
                    console.error('Sticky2 Element has no option/method named ' + method);
                }
            } else {

//                var parent = null;
                var parent = jQuery(parentName);
                if(parent){
                    parent = self.parent().closest(parent);
                } else {
                    parent = self.parent();
                }

                instance = new Sticky2(self,parent,options || {});
                self.data('sticky2Instance',instance);
                jQuery.fn.sticky2._instances.push(instance);
            }
        });
        return ret || this;
    };

    /**
     * Update the position/offset changed on resize and move, applies to all instances
     */
    var updateAll = function(){
        var len = jQuery.fn.sticky2._instances.length;
        for(var i = 0; i < len; i++){
            jQuery.fn.sticky2._instances[i].update();
        }
    };

    jQuery.fn.sticky2._instances = [];
    jQuery.fn.sticky2.updateAll = updateAll;

    jQuery(win).on({
        'resize':function(){
            // Update the boundaries is the browser window is resized
            updateAll();
        },
        'scroll':function(){
            // Move each unfrozen instance on scroll
            var len = jQuery.fn.sticky2._instances.length;
            for(var i = 0; i < len; i++){
                var element = jQuery.fn.sticky2._instances[i];
                if(!element._frozen){
                    element.moveIt();
                }
            }
        }
    });

    jQuery(win.document).on({
        'ready':function(){
            // Start an interval to check the heights of sticky2 elements and update boundaries if necessary
            win.setInterval(function(){
                requestFrame(function(){
                    var len = jQuery.fn.sticky2._instances.length;
                    for(var i = 0; i < len; i++){
                        var element = jQuery.fn.sticky2._instances[i];
                        if(element._parentHeight !== element.parent[0].offsetHeight){
                            element.update();
                        }
                    }
                });
            },1000);
        }
    })
}(jQuery,window));