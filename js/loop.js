
//based on https://github.com/jeromeetienne/tquery/blob/master/build/tquery-bundle.js#L40793
function Loop(){
	"use strict";
	this.hooks		= [];
	this.lastTime	= null;
	this.timerId	= undefined;
}

var LoopObject = function(name, callback){
	"use strict";
	console.assert(typeof name === "string");
	this.name		= name;

	console.assert(typeof callback === "function");
	this.callback	= callback;

	this.toString = function(){
		console.log("Callback-> "+this.name);
	};
};

(function(){
	"use strict";
	/**
	 * destructor
	*/
	Loop.prototype.destroy   = function()
	{
		this.stop();
	};

	Loop.prototype.PRE_RENDER	= 0;
	Loop.prototype.ON_RENDER		= 1;
	Loop.prototype.POST_RENDER	= 2;

	////////// Loop Handler //////////

	/**
	 * start looping
	 * 
	 * @returns {Loop} chained API
	*/
	Loop.prototype.start = function()
	{
		if( this.timerId ){
			this.stop();
		}
		this.timerId   = requestAnimationFrame( this._onAnimationFrame.bind(this) );
		// for chained API
		return this;
	};

	/**
	 * stop looping
	 * 
	 * @returns {Loop} chained API
	*/
	Loop.prototype.stop  = function()
	{
		cancelAnimationFrame(this.timerId);
		this.timerId   = null;
		// for chained API
		return this;
	};

	Loop.prototype.isRunning = function() {
		return this.timerId ? true : false;
	};

	Loop.prototype.pauseToggle= function() {
		if( this.isRunning() ){
			this.stop();
		}
		else{
			this.start();
		}
		return this;
	};

	//////// Heart of the loop ////////
	///

	/**
	 * max delta notified by loop callback
	 * @type {Number}
	 */
	Loop.maxDelta    = 1/5;

	Loop.prototype._onAnimationFrame = function()
	{
		// loop on request animation loop
		// - it has to be at the begining of the function
		// - see details at http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
		this.timerId   = requestAnimationFrame( this._onAnimationFrame.bind(this) );

		// tick once
		this.tick();
	};

	Loop.prototype.tick  = function(){
		// update time values
		var now     = DateNow()/1000;
		// init lastTime if needed
		if( !this.lastTime ){
			this.lastTime = now - 1/60;
		}
		// sanity check - honor Loop.maxDelta
		var minLastTime = now - Loop.maxDelta;
		if( this.lastTime < minLastTime ){
			this.lastTime  = minLastTime;
		}
		// compute delta
		var delta   = now - this.lastTime;
		// update lastTime
		this.lastTime  = now;

		// run all the hooks - from lower priority to higher - in order of registration
		for(var priority = 0; priority <= this.hooks.length; priority++){
			if( this.hooks[priority] === undefined ){
				continue;
			}
			var callbackObjs   = this.hooks[priority].slice(0);
			for(var i = 0; i < callbackObjs.length; i++){
				callbackObjs[i].callback(delta, now);
			}
		}
	};

	//////////////////////////////////////////////////////////////////////////////////
	//      Handle the hooks                        //
	//////////////////////////////////////////////////////////////////////////////////


	/**
	 * hook a callback at a given priority 
	 *
	 * @param {Number} priority for this callback
	 * @param {Function} callback the function which will be called function(time){}
	 * @returns {Function} the callback function. usefull for this._$callback = loop.hook(this._callback.bind(this))
	 *                     and later loop.unhook(this._$callback)
	 */
	Loop.prototype.hook = function(priority, callbackObj)
	{
		// handle parameters
		if( typeof priority === "function" || typeof priority === "object" ){
			if( typeof priority === "function" ){
				console.warn("Beware, hook has changed on Loop, use the LoopObject instead of functions");
				callbackObj	= new LoopObject("unknownFunction", callbackObj);
			}
			else{
				console.assert(priority.hasOwnProperty("callback"));

				callbackObj = priority;
			}
			priority	= this.PRE_RENDER;
		}

		this.hooks[priority]	= this.hooks[priority] || [];
		console.assert(this.hooks[priority].indexOf(callbackObj) === -1);

		this.hooks[priority].push(callbackObj);

		return callbackObj;
	};

	/**
	 * unhook a callback at a given priority
	 *
	 * @param {Number} priority for this callback
	 * @param {Function} callback the function which will be called function(time){}
	 * @returns  chained API
	 */
	Loop.prototype.unhook = function(priority, callbackObj)
	{
		// handle arguments polymorphism
		if( typeof priority === "function" || typeof priority === "object" ){
			if( typeof priority === "function" ){
				console.warn("Beware, hook has changed on Loop, use the LoopObject instead of functions");
				callbackObj	= new LoopObject("unknownFunction", callbackObj);
			}
			else{
				console.assert(priority.hasOwnProperty("callback"));
				callbackObj = priority;
			}
			priority	= this.PRE_RENDER;
		}

		var index	= this.hooks[priority].indexOf(callbackObj);
		console.assert(index !== -1);
		this.hooks[priority].splice(index, 1);
		if(this.hooks[priority].length === 0){
			delete this.hooks[priority];
		}
		// for chained API
		return this;
	};

	Loop.prototype.toString = function(){
		for(var i = 0, len = this.hooks.length; i < len; ++i){
			this.hooks[i].toString();
		}
	};


	Loop.prototype.hookPreRender	= function(callbackObj){ return this.hook(this.PRE_RENDER, callbackObj);	};
	Loop.prototype.hookOnRender		= function(callbackObj){ return this.hook(this.ON_RENDER, callbackObj);	};
	Loop.prototype.hookPostRender	= function(callbackObj){ return this.hook(this.POST_RENDER, callbackObj);	};
	Loop.prototype.unhookPreRender	= function(callbackObj){ return this.unhook(this.PRE_RENDER, callbackObj);	};
	Loop.prototype.unhookOnRender	= function(callbackObj){ return this.unhook(this.ON_RENDER, callbackObj);	};
	Loop.prototype.unhookPostRender	= function(callbackObj){ return this.unhook(this.POST_RENDER, callbackObj);	};
})();

/**
 * precise version of Date.now() -
 * It provide submillisecond precision based on window.performance.now() when 
 * available, fall back on Date.now()
 * see http://updates.html5rocks.com/2012/05/requestAnimationFrame-API-now-with-sub-millisecond-precision 
*/
DateNow  = (function(){
	"use strict";
	var p           = window.performance    || {};
	if( p.now )				{return function(){ return p.timing.navigationStart + p.now();			};}
	else if( p.mozNow )		{return function(){ return p.timing.navigationStart + p.mozNow();		};}
	else if( p.webkitNow )	{return function(){ return p.timing.navigationStart + p.webkitNow();	};}
	else if( p.mskitNow )	{return function(){ return p.timing.navigationStart + p.msNow();		};}
	else if( p.okitNow )	{return function(){ return p.timing.navigationStart + p.oNow();			};}
	else     {       return function(){ return Date.now;                 };}
})();