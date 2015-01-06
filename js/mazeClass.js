var MazeClass;
(function(){
	"use strict";
	MazeClass = function(){
		this.world = new World({
			screenshot		: false,
			fullscreen		: false,
			antialias		: true,
			cameraNear		: 1,
			cameraFar		: 1000,
			stats			: true,
			windowWidth		: window.innerWidth,
			windowHeight	: window.innerHeight,
			camera : {
				fov			: 45,
				near		: 0.01,
				far			: 10000,
				position	: new THREE.Vector3(),
				lookAt		: new THREE.Vector3()
			},
			renderer : {
				antialias	: true,
			}
		} ).start();

		var geometry = new THREE.BoxGeometry( 1, 1, 1 );
		var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
		var cube = new THREE.Mesh( geometry, material );
		this.world.getScene().add( cube );
	};
})();