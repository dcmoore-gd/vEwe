/*!
 * vEwe
 * https://github.com/mattrohland/vEwe
 * 
 * Copyright (c) 2013 Matt Rohland
 * Released under the MIT license
 */
(function(){
	// AMDless define method
	if(typeof define != 'function') define = function(a,b){ window.vEweFactory = b($); };
	
	// AMD define wrapper
	define(
		[
			'3rdparty/jquery'
		],
		function($){ "use strict";

			// View Factory
			// Assists in defining and instantiating Views.
			var VEweFactory = function(){
				return this;
			};
			VEweFactory.prototype = {
				'$': $,
				'create': function(){
					var me = this,
						vEwe;

					return (vEwe = me.define.apply(me, arguments))? new vEwe : false ;
				},
				'define': function(){
					var me = this,
						proto = {},
						inheritanceMethod = 'inherit',
						inheritanceArguments,
						VEwe = function(){ return this; }; // Create vEwe "Class"

					// Process Arguments
					if(arguments.length == 0){
						return false;
					}else if(typeof arguments[0] == 'object'){
						inheritanceArguments = (Array.prototype.slice.call(arguments))
					}else{
						inheritanceMethod = arguments[0]
						inheritanceArguments = (Array.prototype.slice.call(arguments)).slice(1);
					}

					// All items inherit from vEweDefaultPrototype
					inheritanceArguments.unshift({});
					inheritanceArguments.unshift(this.vEweDefaultPrototype);

					// Begin inheritance if we need to
					proto = (typeof inheritanceMethod == 'string')? this[inheritanceMethod].apply(this,inheritanceArguments) : inheritanceMethod.apply(this,inheritanceArguments);

					// All prototypes start from the vEweDefaultPrototype
					VEwe.prototype = proto;
					VEwe.prototype.factory = me;

					// Return "Class" definition
					return VEwe;
				},
				'inherit': function(){
					var extendArgs = (Array.prototype.slice.call(arguments))

					// Runs an extend on all arguments
					return this.$.extend.apply(this,extendArgs);
				},
				'inheritAndMergeEvents': function(){
					// Runs an extend on all arguments
					// Also merges all the events down the inheritance chain
					var i,
						protos = Array.prototype.slice.call(arguments),
						proto,
						events = [];

					for(i in protos){
						if(typeof protos[i]['events'] == 'object')
							events = this._merge(events, protos[i]['events']);
					}
					proto = this.inherit.apply(this, arguments);
					proto['events'] = events;

					return proto;
				},
				'_merge': function(){
					// A basic array merge method that takes an unlimited # of arguments
					var i,
						ii,
						merged = [];

					for(i in arguments){
						for(ii in arguments[i]){
							merged.push(arguments[i][ii]);
						}
					}

					return merged;
				},
				// This is the default vEwe prototype on which all vEwes are based
				'vEweDefaultPrototype': {
					'$': $,
					'selector': 'body',
					'events': [],
					'on': function(){
						this._elementRefresh();
						this._eventsOn();
						this.$el.trigger('vEwe.on');
					},
					'off': function(){
						this._eventsOff();
						this.$el.trigger('vEwe.off');
					},
					'_elementRefresh': function(){
						delete this.element;
						this.element = new Element(this.selector);
						this.$el = this.element.get(); // For shortcut sake.
					},
					'_eventStandardize': function(rawEve){
						var me = this,
							eve = me.factory._merge([], rawEve),
							handlerMaybe = eve[eve.length-1];

						if(typeof handlerMaybe == 'string' && typeof me[handlerMaybe] == 'function')
							eve[eve.length-1] = me[handlerMaybe];

						// In jQuery's on method data is always the second to last argument.
						// More hacktastic than I would like.
						eve.splice(eve.length-1, 0, me);

						return eve;
					},
					'_eventsOn': function(){
						var i,
							eve;

						for(i in this.events){
							eve = this._eventStandardize(this.events[i]);
							this.$el.on.apply(this.$el, eve);
						}
					},
					'_eventsOff': function(){
						var i;
						
						for(i in this.events){
							this.$el.off.apply(this.$el, this.events[i]);
						}
					}
				}
			};


			// Element
			// Enhances the VEwe's top level DOM element.
			// Note: This is currently overkill.
			var Element = function(selector){
				this.options = {
					'selector': selector
				};

				this.findAndSet();
				return this;
			};
			Element.prototype = {
				'$': $,
				'find': function(){
					return this.$(this.options.selector);
				},
				'findAndSet': function(){
					this.$el = this.find();
				},
				'get': function(){
					return this.$el;
				}
			};

			// The VEwe Factory is intended to be sudo singleton in nature
			// so we return an instance
			return new VEweFactory();
		}
	);
})();