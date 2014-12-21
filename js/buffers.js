/**
 * Buffers Module
 */
var Buffers = (function () {

	var module = {};

	var fieldVertexBuffer,
		fieldVertexNormalBuffer,
		fieldVertexTextureBuffer,
		fieldVertexIndexBuffer;

	var ballVertexBuffer,
		ballVertexNormalBuffer,
		ballVertexTextureBuffer,
		ballVertexIndexBuffer;

	function calculateVertexNormal(vertex, vertexIndex){
		var vertexNormals = [];

		for(var i=0; i<vertexIndex.length; i+=3) {
		  var a = vertexIndex[i];
		  var b = vertexIndex[i + 1];
		  var c = vertexIndex[i + 2];

		  //normal is the cross-product
		  var v1 = [
			vertex[a*3] - vertex[b*3],
			vertex[a*3 + 1] - vertex[b*3 + 1],
			vertex[a*3 + 2] - vertex[b*3 + 2],
		  ];
		  var v2 = [
			vertex[a*3] - vertex[c*3],
			vertex[a*3 + 1] - vertex[c*3 + 1],
			vertex[a*3 + 2] - vertex[c*3 + 2],
		  ];

		  var cross = [
				  v1[1]*v2[2] - v1[2]*v2[1],
				  v1[2]*v2[0] - v1[0]*v2[2],
				  v1[0]*v2[1] - v1[1]*v2[0]
		  ];

		  //same value for each of the three vertices
		  vertexNormals.push.apply(vertexNormals, cross);
		  vertexNormals.push.apply(vertexNormals, cross);
		  vertexNormals.push.apply(vertexNormals, cross);
		}

		return vertexNormals;
	};

	/**
	 * Sets up all the buffers in the current GL context
	 */
	module.init = function() {

		var gl = WebGLUtils.getGL();

		/****************************************************************************
		* Field
		****************************************************************************/
		var fw = Settings.field.width / 2.0;
		var fh = Settings.field.height  / 2.0;
		var fd = Settings.field.width  / 10.0;

		// Field position buffer
		var fieldVertex = [
			// Front face
			-fw, -fh,  0.0,
			fw, -fh,  0.0,
			fw,  fh,  0.0,
			-fw,  fh,  0.0,

			// Back face
			-fw, -fh, -fd,
			-fw,  fh, -fd,
			fw,  fh, -fd,
			fw, -fh, -fd,

			// Top face
			-fw,  fh, -fd,
			-fw,  fh,  0.0,
			fw,  fh,  0.0,
			fw,  fh, -fd,

			// Bottom face
			-fw, -fh, -fd,
			fw, -fh, -fd,
			fw, -fh,  0.0,
			-fw, -fh,  0.0,

			// Right face
			fw, -fh, -fd,
			fw,  fh, -fd,
			fw,  fh,  0.0,
			fw, -fh,  0.0,

			// Left face
			-fw, -fh, -fd,
			-fw, -fh,  0.0,
			-fw,  fh,  0.0,
			-fw,  fh, -fd
		];
		fieldVertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, fieldVertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fieldVertex), gl.STATIC_DRAW);

		// Field index buffer
		var fieldVertexIndex = [
			8,  9,  10,		8,  10, 11,		// top
			12, 13, 14,		12, 14, 15,		// bottom
			16, 17, 18,		16, 18, 19,		// right
			20, 21, 22,		20, 22, 23		// left
		];
		fieldVertexIndexBuffer = gl.createBuffer();
		fieldVertexIndexBuffer.number_vertex_points = fieldVertexIndex.length;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, fieldVertexIndexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(fieldVertexIndex), gl.STATIC_DRAW);

		// Field normal buffer
		var fieldVertexNormals = calculateVertexNormal(fieldVertex, fieldVertexIndex);

		fieldVertexNormalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, fieldVertexNormalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fieldVertexNormals), gl.STATIC_DRAW);

		// Field texture buffer
		var fieldVertexTexture = [
			// Front
			0.0,  0.0,
			1.0,  0.0,
			1.0,  1.0,
			0.0,  1.0,
			// Back
			0.0,  0.0,
			1.0,  0.0,
			1.0,  1.0,
			0.0,  1.0,
			// Top
			0.0,  0.0,
			1.0,  0.0,
			1.0,  1.0,
			0.0,  1.0,
			// Bottom
			0.0,  0.0,
			1.0,  0.0,
			1.0,  1.0,
			0.0,  1.0,
			// Right
			0.0,  0.0,
			1.0,  0.0,
			1.0,  1.0,
			0.0,  1.0,
			// Left
			0.0,  0.0,
			1.0,  0.0,
			1.0,  1.0,
			0.0,  1.0
		];
		fieldVertexTextureBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, fieldVertexTextureBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(fieldVertexTexture), gl.STATIC_DRAW);

		/****************************************************************************
		* Ball
		****************************************************************************/

		var bw = Settings.ball.width / 2.0;
		var bd = Settings.ball.width;

		// Ball position buffer
		var ballVertex = [
		  // Front face
		  -bw, -bw,  0.0,
		   bw, -bw,  0.0,
		   bw,  bw,  0.0,
		  -bw,  bw,  0.0,

		  // Back face
		  -bw, -bw, -bd,
		  -bw,  bw, -bd,
		   bw,  bw, -bd,
		   bw, -bw, -bd,

		  // Top face
		  -bw,  bw, -bd,
		  -bw,  bw,  0.0,
		   bw,  bw,  0.0,
		   bw,  bw, -bd,

		  // Bottom face
		  -bw, -bw, -bd,
		   bw, -bw, -bd,
		   bw, -bw,  0.0,
		  -bw, -bw,  0.0,

		  // Right face
		   bw, -bw, -bd,
		   bw,  bw, -bd,
		   bw,  bw,  0.0,
		   bw, -bw,  0.0,

		  // Left face
		  -bw, -bw, -bd,
		  -bw, -bw,  0.0,
		  -bw,  bw,  0.0,
		  -bw,  bw, -bd
		];
		ballVertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, ballVertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ballVertex), gl.STATIC_DRAW);

		// Ball index buffer
		var ballVertexIndex = [
			0,  1,  2,      0,  2,  3,    // front
			4,  5,  6,      4,  6,  7,    // back
			8,  9,  10,     8,  10, 11,   // top
			12, 13, 14,     12, 14, 15,   // bottom
			16, 17, 18,     16, 18, 19,   // right
			20, 21, 22,     20, 22, 23    // left
		];
		ballVertexIndexBuffer =gl.createBuffer();
		ballVertexIndexBuffer.number_vertex_points = ballVertexIndex.length;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, ballVertexIndexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(ballVertexIndex), gl.STATIC_DRAW);

		// Ball normal buffer
		var ballVertexNormals = calculateVertexNormal(ballVertex, ballVertexIndex);

		ballVertexNormalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, ballVertexNormalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ballVertexNormals), gl.STATIC_DRAW);

		// Ball texture buffer
		var ballVertexTexture = [
			// Front
			0.0,  0.0,
			1.0,  0.0,
			1.0,  1.0,
			0.0,  1.0,
			// Back
			0.0,  0.0,
			1.0,  0.0,
			1.0,  1.0,
			0.0,  1.0,
			// Top
			0.0,  0.0,
			1.0,  0.0,
			1.0,  1.0,
			0.0,  1.0,
			// Bottom
			0.0,  0.0,
			1.0,  0.0,
			1.0,  1.0,
			0.0,  1.0,
			// Right
			0.0,  0.0,
			1.0,  0.0,
			1.0,  1.0,
			0.0,  1.0,
			// Left
			0.0,  0.0,
			1.0,  0.0,
			1.0,  1.0,
			0.0,  1.0
		];
		ballVertexTextureBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, ballVertexTextureBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(ballVertexTexture), gl.STATIC_DRAW);

		/****************************************************************************
		* Paddle
		****************************************************************************/

		var pw = Settings.paddle.width / 2.0;
		var ph = Settings.paddle.height / 2.0;
		var pd = Settings.paddle.height;


		// Paddle position buffer
		var paddleVertex = [
			// Front face
			-pw, -ph,  0.0,
			pw, -ph,  0.0,
			pw,  ph,  0.0,
			-pw,  ph,  0.0,

			// Back face
			-pw, -ph, -pd,
			-pw,  ph, -pd,
			pw,  ph, -pd,
			pw, -ph, -pd,

			// Top face
			-pw,  ph, -pd,
			-pw,  ph,  0.0,
			pw,  ph,  0.0,
			pw,  ph, -pd,

			// Bottom face
			-pw, -ph, -pd,
			pw, -ph, -pd,
			pw, -ph,  0.0,
			-pw, -ph,  0.0,

			// Right face
			pw, -ph, -pd,
			pw,  ph, -pd,
			pw,  ph,  0.0,
			pw, -ph,  0.0,

			// Left face
			-pw, -ph, -pd,
			-pw, -ph,  0.0,
			-pw,  ph,  0.0,
			-pw,  ph, -pd
		];
		paddleVertexBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, paddleVertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(paddleVertex), gl.STATIC_DRAW);

		// Paddle index buffer
		var paddleVertexIndex = [
			0,  1,  2,      0,  2,  3,    // front
			4,  5,  6,      4,  6,  7,    // back
			8,  9,  10,     8,  10, 11,   // top
			12, 13, 14,     12, 14, 15,   // bottom
			16, 17, 18,     16, 18, 19,   // right
			20, 21, 22,     20, 22, 23    // left
		];
		paddleVertexIndexBuffer = gl.createBuffer();
		paddleVertexIndexBuffer.number_vertex_points = paddleVertexIndex.length;
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, paddleVertexIndexBuffer);
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(paddleVertexIndex), gl.STATIC_DRAW);

		// Paddle normal buffer
		var paddleVertexNormals = calculateVertexNormal(paddleVertex, paddleVertexIndex);

		paddleVertexNormalBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, paddleVertexNormalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(paddleVertexNormals), gl.STATIC_DRAW);

		// Paddle texture buffer
		var paddleVertexTexture = [
			// Front
			0.0,  0.0,
			1.0,  0.0,
			1.0,  1.0,
			0.0,  1.0,
			// Back
			0.0,  0.0,
			1.0,  0.0,
			1.0,  1.0,
			0.0,  1.0,
			// Top
			0.0,  0.0,
			1.0,  0.0,
			1.0,  1.0,
			0.0,  1.0,
			// Bottom
			0.0,  0.0,
			1.0,  0.0,
			1.0,  1.0,
			0.0,  1.0,
			// Right
			0.0,  0.0,
			1.0,  0.0,
			1.0,  1.0,
			0.0,  1.0,
			// Left
			0.0,  0.0,
			1.0,  0.0,
			1.0,  1.0,
			0.0,  1.0
		];
		paddleVertexTextureBuffer = gl.createBuffer();
		gl.bindBuffer(gl.ARRAY_BUFFER, paddleVertexTextureBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(paddleVertexTexture), gl.STATIC_DRAW);
	};

	return module;

}());