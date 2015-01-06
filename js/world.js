var World;
(function(){
    "use strict";

    /**
     * world
     * @param {[type]} opt [description]
     */
    World = function(opt){
        var that = this;

        this.clock      = new THREE.Clock();
        this.clock.start();

        /////////////
        ///SCENE
        /////////////
        this.scene      = new THREE.Scene();

        /////////////
        ///RENDERER
        /////////////
        var canvas    = opt.canvas || document.getElementsByTagName("canvas")[0];
        this.renderer = new THREE.WebGLRenderer( { 
            canvas                : canvas,
            antialias             : opt.renderer.antialias,
            preserveDrawingBuffer : true, // to allow screenshot
            alpha                 : true } );
        this.renderer.setClearColor( 0x72A2DF, 1 );
        this.setSizeRenderer(opt.windowWidth, opt.windowHeight);

        /////////////
        ///LOOP
        /////////////
        this.loop    = new Loop();

        /////////////
        ///CAMERA
        /////////////
        this.camera = new THREE.PerspectiveCamera(
                opt.camera.fov,
                opt.windowWidth / opt.windowHeight,
                opt.camera.near,
                opt.camera.far );

        this.camera.position.copy( opt.camera.position );
        this.camera.lookAt(opt.camera.lookAt);
        this.scene.add(this.camera);    

        this.loop.hookOnRender(new LoopObject("updateWorld", that.update.bind(that)));
    };


    World.prototype.destroy = function(){
        // destroy the loop
        this.loop.destroy();

        delete this.camera;
        delete this.scene;
        delete this.clock;

        var parent  = this.renderer.domElement.parentElement;
        if(parent !== undefined){
            parent.removeChild(this.renderer.domElement);
        }
        delete this.renderer;
    };

    /**
     * start looping
     */
    World.prototype.start    = function()
    {
        this.loop.start();
        return this;// for chained API
    };

    /**
     * stop looping
     */
    World.prototype.stop = function()
    {
        this.loop.stop();
        return this;// for chained API
    };

    World.prototype.setSizeRenderer = function(rendererWidth, rendererHeight){
        this.renderer.setSize( rendererWidth, rendererHeight );
    };

    World.prototype.getScene = function() { return this.scene; };
    World.prototype.getRenderer = function() { return this.renderer; };
    World.prototype.getCamera = function() { return this.camera; };
    World.prototype.getClock = function() { return this.clock; };

    /**
     * main loop rendering
     * @return {[type]} [description]
     */
    World.prototype.update = function(delta) {
        //GetDelta updates the clock which is used in avatar animations
        this.clock.getDelta();
        
        THREE.AnimationHandler.update( delta );
        this.renderer.render( this.scene, this.camera );
    };
})();