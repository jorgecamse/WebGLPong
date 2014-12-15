var Settings = {
  field: {
    width: 1.0,
    height: 2.0,
    texture: 0
  }
}

function start() {
	// Initialize the GL context
	initWebGL();

	// Only continue if WebGL is available and working
	if (gl) {
		initShaders();
		initBuffers();
		initViewport();
		initMatrix();
	}
}

$(document).ready(function() {
	start();
});