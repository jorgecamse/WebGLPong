var field;

function initGame(){
	field = new ObjGraph(Settings.field.width, Settings.field.height, 0.0, 0.0, fieldVertexBuffer,
		fieldVertexIndexBuffer, fieldVertexTextureBuffer, Settings.field.texture,
			fieldVertexNormalBuffer);
};

function drawScene() {
	// Clear the canvas before we start drawing on it.
	clear();

	field.draw();
};