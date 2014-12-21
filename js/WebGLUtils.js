/**
 * WebGL Utils Module
 */
var WebGLUtils = (function () {

	var module = {};

	var canvas;
	var gl;
	var glProgram;

	var stack = [];
	var matrixGL = {
		empty: true
	};

	var texturesGL = [];

	/* Get shader sources with jQuery Ajax */
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

	/**
	 * Initialize the WebGL context on the canvas
	 */
	module.initWebGL = function(canvasgl) {
		canvas = canvasgl;
		try {
			gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
		} catch(e) { }
		               
		if (!gl) {
			alert( "Error: Your browser does not appear to support WebGL.");
		}

		return gl;
	};

	/**
	 * Initialize the shaders
	 */
	module.initShaders = function() {
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
	module.initViewport = function() {
		gl.viewport(0, 0, canvas.width, canvas.height);
	};

	/**
	 * Clear the canvas before we start drawing on it
	 */
	module.clear = function() {
		gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
		gl.enable(gl.DEPTH_TEST); // Enable depth testing
		gl.clearDepth(1.0);			// Clear everything
		gl.depthFunc(gl.LEQUAL);	// Near things obscure far things
	};

	/**
	 * Initialize project, model view and normal matrix
	 */
	module.initMatrix = function() {
		// Create a project matrix with 45 degrees field of view
		matrixGL.p = mat4.create();
		mat4.perspective(45, canvas.width / canvas.height, 0.1, 100.0, matrixGL.p);

		// Create a model view matrix with camera at 0, 0.2, −2.5 and rotate 50 degrees around the X axis
		matrixGL.mv = mat4.create();
		mat4.identity(matrixGL.mv);
		mat4.translate(matrixGL.mv, [0.0, 0.2, -2.0]);
		mat4.rotate(matrixGL.mv, 45, [-1.0, 0.0, 0.0]);

		// Create a normal matrix
		matrixGL.n = mat3.create();

		matrixGL.empty = false;
	};

	/**
	 * Push the model view matrix on to the stack
	 */
	module.pushMatrix = function() {
		var matrix = mat4.create();
		mat4.set(matrixGL.mv, matrix);
		stack.push(matrix);
	};

	/**
	 * Pop on the stack back to the model view matrix
	 */
	module.popMatrix = function() {
		if (stack.length == 0)
			throw "Stack is empty";

		matrixGL.mv = stack.pop();
	};

	/**
	 * Setup textures
	 */
	module.setupTextures = function(images) {
		for (i = 0; i < images.length; i++) {
			gl.activeTexture(gl.TEXTURE0 + i);
			texturesGL[i] = gl.createTexture();
			gl.bindTexture(gl.TEXTURE_2D, texturesGL[i]);
			gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
			gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
			gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

			if( !gl.isTexture(texturesGL[i]) ) {
				console.error("Error: Texture is invalid");
			}
		}
	};

	module.getGL = function() {
		if (!gl)
			throw ("GL is not initialized");

		return gl;
  };

  module.getGLProgram = function() {
		if (!glProgram)
			throw ("GLProgram is not initialized");

		return glProgram;
  };

  module.getGLTextures = function() {
		if (texturesGL.length == 0)
			throw ("Textures are not initialized");

		return texturesGL;
  };

  module.getMatrix = function() {
		if (matrixGL.empty)
			throw ("Matrix is not initialized");

		return matrixGL;
  };

	return module;
}());