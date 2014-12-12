function start() {
	// Initialize the GL context
  	initWebGL();

	// Only continue if WebGL is available and working
	if (gl) {
		initShaders();
	}
}

$(document).ready(function() {
	start();
});