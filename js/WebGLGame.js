/**
 * WebGL Game Module
 */
 var WebGLGame = (function () {

	var module = {};

	var objectsGL;

	var sources_textures = [
		"./textures/field.jpg",
		"./textures/ball.jpg",
		"./textures/paddle1.jpg",
		"./textures/paddle2.jpg"
	];

	function loadTextures(sources, callback){
		var images = [];
		var loadedImages = 0;
		var numImages = 0;
		for(var src in sources) {
			numImages++;
		}
		for(var src in sources) {
			images[src] = new Image();
			images[src].onload = function() {
				if(++loadedImages >= numImages) {
					callback(images);
				}
			}
			images[src].src = sources[src];
		}
	};

	function drawScene() {
		// Clear the canvas before we start drawing on it.
		WebGLUtils.clear();

		// field
		objectsGL.field.draw();

		// ball
		objectsGL.ball.draw();

		// paddle 1
		objectsGL.paddle1.draw();

		// paddle 2
		objectsGL.paddle2.draw();
	};

	function animateScene(){
		objectsGL.ball.move();
		objectsGL.paddle1.move();
		objectsGL.paddle2.move();
		objectsGL.paddle1.logic();
		objectsGL.paddle2.logic();
	};

	function updateScene() {
		(function animLoop() {
			animateScene();
			drawScene();
			requestAnimationFrame(animLoop);
		})();
  };

	module.start = function(canvas) {

		function initBrowser(images) {
			// Initialize the GL context
			var gl = WebGLUtils.initWebGL(canvas);

			// Only continue if WebGL is available and working
			if (gl) {
				WebGLUtils.initShaders();
				WebGLBuffers.init();
				WebGLUtils.initViewport();
				WebGLUtils.initMatrix();
				WebGLUtils.setupTextures(images);
				objectsGL = WebGLObjects.start();
				updateScene();
			}
		};

		loadTextures(sources_textures, initBrowser);
  };

  return module;

}());