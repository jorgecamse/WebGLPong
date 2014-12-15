var fieldVertexBuffer,
	fieldVertexNormalBuffer,
	fieldVertexTextureBuffer,
	fieldVertexIndexBuffer;

/**
 * Sets up all the buffers in the current GL context
 */
function initBuffers(){
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
};

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