var canvas;
var gl;
var glProgram;

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
};

/**
 * Initialize the shaders
 */
function initShaders(){
	var vs_source = getShader('vertex.vs');
	var fs_source = getShader('fragment.fs');

	//compile shaders
	var vertexShader = makeShader(vs_source, gl.VERTEX_SHADER);
	var fragmentShader = makeShader(fs_source, gl.FRAGMENT_SHADER);

	// Create the shader program
	glProgram = gl.createProgram();

	//attach and link shaders to the program
	gl.attachShader(glProgram, vertexShader);
	gl.attachShader(glProgram, fragmentShader);
	gl.linkProgram(glProgram);

	// If creating the shader program failed, alert
	if (!gl.getProgramParameter(glProgram, gl.LINK_STATUS)) {
	    alert("Unable to initialize the shader program.");
	}

	// use program
	gl.useProgram(glProgram);

	// set attributes
	glProgram.vertexPositionAttribute = gl.getAttribLocation(glProgram, "aVertexPosition");
	gl.enableVertexAttribArray(glProgram.vertexPositionAttribute);

	glProgram.vertexTextureAttribute = gl.getAttribLocation(glProgram, "aVertexTexture");
	gl.enableVertexAttribArray(glProgram.vertexTextureAttribute);

	glProgram.vertexNormalAttribute = gl.getAttribLocation(glProgram, "aVertexNormal");
	gl.enableVertexAttribArray(glProgram.vertexNormalAttribute);

	// set uniforms
	glProgram.pMatrixUniform = gl.getUniformLocation(glProgram, "uPMatrix");
	glProgram.mvMatrixUniform = gl.getUniformLocation(glProgram, "uMVMatrix");
	glProgram.normalMatrixUniform = gl.getUniformLocation(glProgram, "uNormalMatrix");
	glProgram.samplerUniform = gl.getUniformLocation(glProgram, "uSampler");
};

/**************************************************************************** 
 * Aux functions, mostly UI-related
 ****************************************************************************/

// Get shader sources with jQuery Ajax
function getShader(name){
	var source;

	$.ajax({
	    async: false,
	    url: './shader/' + name,
	    success: function (data) {
			source = data.firstChild.textContent;
	    },
	    dataType: 'xml'
	});
	return source;
};

function makeShader(src, type){
	//compile the vertex shader
	var shader = gl.createShader(type);

	gl.shaderSource(shader, src);
	gl.compileShader(shader);

	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
		alert("Error compiling shader: " + gl.getShaderInfoLog(shader));
	}
	return shader;
};