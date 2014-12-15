var Settings = {
	field: {
	    width: 1.0,
	    height: 2.0,
	    texture: 0
	},
	ball: {
	    width: 1.0 / 30.0,
	    speed: 0.008,
	    texture: 1
	},
	paddle: {
	    width: 1.0 / 10,
	    height: 1.0 / 30.0,
	    speed: 0.01,
	    texture1: 2,
	    texture2: 3
	}
}

var textures_source = [
	"./textures/field.jpg",
	"./textures/ball.jpg"
];

function start() {
	// Initialize the GL context
	initWebGL();

	// Only continue if WebGL is available and working
	if (gl) {
		initShaders();
		initBuffers();
		initViewport();
		initMatrix();
		loadTextures(textures_source);

		initGame();

		(function animLoop() {
			drawScene();
			requestAnimationFrame(animLoop);
		})();
	}
}

$(document).ready(function() {
	start();
});