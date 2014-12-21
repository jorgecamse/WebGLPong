var Settings = {
	field: {
	    width: 1.0,
	    height: 2.0,
	    texture: 0
	},
	ball: {
	    width: 1.0 / 30.0,
	    speed: 0.008,
	    texture: 1
	},
	paddle: {
	    width: 1.0 / 10,
	    height: 1.0 / 30.0,
	    speed: 0.01,
	    texture1: 2,
	    texture2: 3
	}
}

var textures_source = [
	"./textures/field.jpg",
	"./textures/ball.jpg",
	"./textures/paddle1.jpg",
	"./textures/paddle2.jpg"
];

function start(isInitiator) {
	// Initialize the GL context
	initWebGL();

	// Only continue if WebGL is available and working
	if (gl) {
		initShaders();
		initBuffers();
		initViewport();
		initMatrix();
		loadTextures(textures_source);

		initGame();

		(function animLoop() {
			animateScene();
			if (isInitiator) {
				sendData(paddle1, ball);
			} else{
				sendData(paddle2);
			}
			drawScene();
			requestAnimationFrame(animLoop);
		})();
	}
}

$(document).ready(function() {
	localVideo = document.getElementById('localVideo');
	remoteVideo = document.getElementById('remoteVideo');

	$('#enter').on('click', function(e){
		room = $('#room').val();
		userName = $('#username').val();
		WebRTCPeerStreaming.initPeerIface(room, userName);
	});
});