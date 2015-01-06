/**
 * WebGL Game Module
 */
 var WebGLGame = (function () {

	var module = {};

	var objectsGL;

	var peer;

	var running;

	var sources_textures = [
		"./img/textures/field_wall.jpg",
		"./img/textures/field_floor.jpg",
		"./img/textures/ball.jpg",
		"./img/textures/paddle1.jpg",
		"./img/textures/paddle2.jpg"
	];

	/* Load textures images of Gl objects */
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

	/* Draw GL objects in canvas */
	function drawScene() {
		// Clear the canvas before we start drawing on it
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

	/* Update position of GL objects */
	function animateScene(){
		if (peer.isInitiator) {
			objectsGL.ball.move();
			objectsGL.paddle1.move();
			objectsGL.paddle1.logic();
			objectsGL.paddle2.logic();
		}	else {
			objectsGL.paddle2.move();
		};
	};

	/* Send data to another peer */
	function send() {
		var data;

		if (peer.isInitiator) {
			data = {M: [objectsGL.paddle1.posX, objectsGL.ball.posX, objectsGL.ball.posY]};
		} else {
			data = {M: [objectsGL.paddle2.posX]};
		};

		peer.sendData(data);
	};

	/* Update score on the screen */
	function updateScore(ply) {
		$('#' + ply + 'Score').html(parseInt($('#' + ply + 'Score').text()) + 1);
	};

	/* Start the game */
	module.play = function() {
		(function animLoop() {
			animateScene();
			send();
			drawScene();
			running = setTimeout(function() {
				animLoop();
			}, 35);
		})();
	};

	/* Handler data from another peer */
	module.onReceiveData = function(data) {
		if (peer.isInitiator){
			objectsGL.paddle2.posX = data.M[0];
		} else {
			objectsGL.paddle1.posX = data.M[0];
			objectsGL.ball.posX = data.M[1];
			objectsGL.ball.posY = data.M[2];
		};
	};

	/* Update local or remote score */
	module.Scored = function(ply){
		if (peer.isInitiator){
			if (ply == '1') {
				updateScore('local');
			} else {
				updateScore('remote');
			}
		} else {
			if (ply == '1') {
				updateScore('remote');
			} else {
				updateScore('local');
			}
		}
	};

	/* Reset score peers */
	module.resetScore = function(){
		$('#localScore').html('0');
		$('#remoteScore').html('0');
	};

	/* Initialize the game: gl, shaders, matrix, textures and objects */
	module.start = function(p, callback) {

		peer = p;

		function initBrowser(images) {
			// Initialize the GL context
			var gl = WebGLUtils.initWebGL(canvas);

			// Only continue if WebGL is available and working
			if (gl) {
				WebGLUtils.initShaders();
				WebGLBuffers.init();
				WebGLUtils.initViewport();
				if (peer.isInitiator){
					WebGLUtils.initMatrix(-0.38*Math.PI, 0);
				} else {
					WebGLUtils.initMatrix(-0.38*Math.PI, Math.PI);
				}
				WebGLUtils.setupTextures(images);
				objectsGL = WebGLObjects.start(p);

				if (callback){
					callback(({type: 'play'}));
				}
			}
		};

		loadTextures(sources_textures, initBrowser);
	};

	/* Stop the game */
	module.stop = function() {
		clearTimeout(running);
	};

	return module;

}());