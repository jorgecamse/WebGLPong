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

function loadContent(content) {
	$("#modal-container").load("../html/modal.html #" + content, function(response, status, xhr) {
		if ( status == "error" ) {
			alert("Sorry but there was an error: ");
		};

		$('#'+ content).modal({
			show: true,
			backdrop: 'static'
		});
	});
};

function enterRoom() {
	room = $('#room').val();
	$('#modal-index').modal('hide');
	WebRTCPeerStreaming.initPeerIface(room);
	WebGLGame.start(canvas);
};

$(document).ready(function() {
	localVideo = document.getElementById('localVideo');
	remoteVideo = document.getElementById('remoteVideo');
	canvas = document.getElementById('canvasgl');

	loadContent("modal-index");
});