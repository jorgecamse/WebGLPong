var canvas;
var gl;

/**
 * Initialize the WebGL context on the canvas
 */
function initWebGL(){
	canvas = document.getElementById("canvasgl");
	try {
		gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
	} catch(e) { }
	               
	if (!gl) {
		alert( "Error: Your browser does not appear to support WebGL.");
	}
}