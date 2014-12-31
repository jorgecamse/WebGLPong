var Settings = {
	field: {
	    width: 1.0,
	    height: 2.0,
	    texture: 0
	},
	ball: {
	    width: 1.0 / 30.0,
	    speed: 0.01,
	    texture: 2
	},
	paddle: {
	    width: 1.0 / 10,
	    height: 1.0 / 30.0,
	    speed: 0.01,
	    texture1: 3,
	    texture2: 4
	}
}

function enterRoom(room) {
	if (!room) {
		room = $('#room').val();
		if(!room) {
			room = $('#room').attr("placeholder");
		};
	};

	window.location.hash = room;
	$('#modal-index').modal('hide');
	Helper.updateRoomURL(room);

	var nd = WebRTCStreaming.start(localVideo, remoteVideo);
	nd.joinRoom(room);
};

$(document).ready(function() {
	localVideo = document.getElementById('localVideo');
	remoteVideo = document.getElementById('remoteVideo');
	canvas = document.getElementById('canvasgl');

	canvas.width =  window.innerWidth / 1.7;
	canvas.height =  window.innerHeight;

	var room = window.location.hash.substring(1);
	if (!room) {
		Helper.loadModal("modal-index");
	} else {
		enterRoom(room);
	};
});