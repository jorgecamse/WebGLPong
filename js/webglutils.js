var canvas;
var gl;
var glProgram;

var mvMatrix;
var pMatrix;
var normalMatrix;

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


/**
 * Initialize the viewport
 */
function initViewport(){
	gl.viewport(0, 0, canvas.width, canvas.height);
};

function initMatrix() {
	// Create a project matrix with 45 degrees field of view
	pMatrix = mat4.create();
	mat4.perspective(45, canvas.width / canvas.height, 0.1, 100.0, pMatrix);

	// Create a model view matrix with camera at 0, 0.2, −2.5 and rotate 50 degrees around the X axis
	mvMatrix = mat4.create();
	mat4.identity(mvMatrix);
	mat4.translate(mvMatrix, [0.0, 0.2, -2.0]);
	mat4.rotate(mvMatrix, 45, [-1.0, 0.0, 0.0]);

	// Create a normal matrix
	normalMatrix = mat3.create();
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