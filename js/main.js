var Settings = {
  field: {
    width: 1.0,
    height: 2.0,
    texture: 0
  }
}

var textures_source = [
	"./textures/field.jpg"
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