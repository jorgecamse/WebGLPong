/**
 * Helper Module
 */
 var Helper = (function () {

	var module = {};

	function randomToken() {
	  return Math.floor((1 + Math.random()) * 1e16).toString(16).substring(1);
	}

	module.loadModal = function(content) {
		$("#modal-container").load("../html/modal.html #" + content, function(response, status, xhr) {
			if (status == "error") {
				alert("Sorry but there was an error: ");
			};

			module.updatePlaceHolder();

			$('#'+ content).modal({
				show: true,
				backdrop: 'static'
			});
		});
	};

	module.showAlert = function(content, callback) {
		$("#panel-alerts").load("../html/modal.html #" + content, function(response, status, xhr) {
			if (status == "error") {
				alert("Sorry but there was an error: ");
			};

			$('#'+ content).show();

			if(callback){
				callback();
			};
		});
	};

	var totalTime = 5;
	module.countDown = function() {
	  document.getElementById('count').innerHTML = totalTime;

	  if(totalTime == 0){
	  	$('#alert-connected').hide();
			WebGLGame.play();
			totalTime = 5;
		} else {
			totalTime -= 1;
			setTimeout("Helper.countDown()", 1000);
	  };
	};

	module.updatePlaceHolder = function() {
		$('#room').attr("placeholder", randomToken());
	};

	module.updateRoomURL = function(room) {
		var roomURL = document.getElementById('url');
	  var url = location.host + '/#' + room;
	  $('#facetime-icon').css('visibility', 'visible');
	  roomURL.innerHTML = url;
	}

	return module;

}());