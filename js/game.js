var field;
var ball;

function initGame(){
	field = new ObjGraph(Settings.field.width, Settings.field.height, 0.0, 0.0, fieldVertexBuffer,
		fieldVertexIndexBuffer, fieldVertexTextureBuffer, Settings.field.texture,
			fieldVertexNormalBuffer);

	ball = new Ball(Settings.ball.width, Settings.ball.width, 0.0, 0.0, Settings.ball.speed, 
		ballVertexBuffer, ballVertexIndexBuffer, ballVertexTextureBuffer, Settings.ball.texture,
			ballVertexNormalBuffer);
};

function drawScene() {
	// Clear the canvas before we start drawing on it.
	clear();

	// field
	field.draw();

	// ball
	ball.draw();
};