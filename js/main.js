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

function loadModal(content) {
	$("#modal-container").load("../html/modal.html #" + content, function(response, status, xhr) {
		if ( status == "error" ) {
			alert("Sorry but there was an error: ");
		};

		updatePlaceHolder();

		$('#'+ content).modal({
			show: true,
			backdrop: 'static'
		});
	});
};

function showAlert(content, callback) {
	$("#panel-alerts").load("../html/modal.html #" + content, function(response, status, xhr) {
		if ( status == "error" ) {
			alert("Sorry but there was an error: ");
		};

		$('#'+ content).show();

		if(callback){
			callback();
		};
	});
};

function hideAlert(content) {
	$('#'+ content).hide();
};

var totalTime = 5;

function countDown(){
  document.getElementById('CuentaAtras').innerHTML = totalTime;

  if(totalTime==0){
		hideAlert('alert-connected');
		WebGLGame.play();
	} else {
		totalTime-=1;
		setTimeout("countDown()",1000);
  };
};

function randomToken() {
  return Math.floor((1 + Math.random()) * 1e16).toString(16).substring(1);
}

function updatePlaceHolder() {
	$('#room').attr("placeholder", randomToken());
};

function enterRoom(url) {
	if (!url) {
		room = $('#room').val();
		if(!room) {
			room = $('#room').attr("placeholder");
		};
	};
	window.location.hash = room;
	$('#modal-index').modal('hide');
	updateRoomURL(room);

	WebRTCPeerStreaming.initPeerIface(room);
	WebGLGame.start(canvas);
};

function updateRoomURL(room) {
  var url = location.href + room;
  $('#facetime-icon').css('visibility', 'visible');
  roomURL.innerHTML = url;
}

$(document).ready(function() {
	localVideo = document.getElementById('localVideo');
	remoteVideo = document.getElementById('remoteVideo');
	canvas = document.getElementById('canvasgl');

	canvas.width =  window.innerWidth / 1.7;
	canvas.height =  window.innerHeight;

	roomURL = document.getElementById('url');
	room = window.location.hash.substring(1);
	if (!room) {
		loadModal("modal-index");
	} else {
		enterRoom(room);
	};
});