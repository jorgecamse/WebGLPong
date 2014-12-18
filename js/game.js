var field;
var ball;
var paddle1;
var paddle2;

function initGame(){
	field = new ObjGraph(Settings.field.width, Settings.field.height, 0.0, 0.0, fieldVertexBuffer,
		fieldVertexIndexBuffer, fieldVertexTextureBuffer, Settings.field.texture,
			fieldVertexNormalBuffer);

	ball = new Ball(Settings.ball.width, Settings.ball.width, 0.0, 0.0, Settings.ball.speed, 
		ballVertexBuffer, ballVertexIndexBuffer, ballVertexTextureBuffer, Settings.ball.texture,
			ballVertexNormalBuffer);

	paddle1 = new Paddle(Settings.paddle.width, Settings.paddle.height, 0.0,
		-Settings.field.height / 2.0 + 3*Settings.paddle.height, Settings.paddle.speed,
			paddleVertexBuffer, paddleVertexIndexBuffer, paddleVertexTextureBuffer, 
				Settings.paddle.texture1, paddleVertexNormalBuffer);

	paddle2 = new Paddle(Settings.paddle.width, Settings.paddle.height, 0.0,
		Settings.field.height / 2.0 - 5*Settings.paddle.height, Settings.paddle.speed,
			paddleVertexBuffer, paddleVertexIndexBuffer, paddleVertexTextureBuffer,
				Settings.paddle.texture2, paddleVertexNormalBuffer);
};

function drawScene() {
	// Clear the canvas before we start drawing on it.
	clear();

	// field
	field.draw();

	// ball
	ball.draw();

	// paddle 1
	paddle1.draw();

	// paddle 2
	paddle2.draw();
};

function animateScene(){
	if (isInitiator) {
		ball.move();
		paddle1.move();
		paddle1.logic();
		paddle2.logic();
	} else {
		paddle2.move();
	}
}