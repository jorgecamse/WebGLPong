/**
 * Helper Module
 */
var Helper = (function () {

	var module = {};

	/* Generate random token of numbers and letters */
	function randomToken() {
		return Math.floor((1 + Math.random()) * 1e16).toString(16).substring(1);
	}

	/* Shows a modal window */
	module.showModal = function(content) {
		$("#modal-container").load("../html/views.html #" + content, function(response, status, xhr) {
			if (status == "error") {
				alert("Sorry but there was an error: ");
			};

			$('#'+ content).modal({
				show: true,
				backdrop: 'static'
			});
		});
	};

	/* Shows an alert message */
	module.showAlert = function(content, callback) {
		$("#panel-alerts").load("../html/views.html #" + content, function(response, status, xhr) {
			if (status == "error") {
				alert("Sorry but there was an error: ");
			};

			$('#'+ content).show();

			if(callback){
				callback();
			};
		});
	};

	/* Hides an alert message */
	module.hideAlert = function(id) {
		$('#' + id).hide();
	};

	/* Update room name input with random token */
	module.updatePlaceHolder = function() {
		$('#room').attr("placeholder", randomToken());
	};

	/* Update room url with name inserted */
	module.updateRoomURL = function(room) {
		var roomURL = document.getElementById('url');
	  var url = 'http://' + location.host + '/#' + room;
	  roomURL.href = url;
	  roomURL.innerHTML = url;
	  $('#panel-room').show();
	};

	/* Initializes a spinner */
	module.initSpinner = function() {
		$('#spinner').show();
		$('#spinner').css('width', canvas.width);
		$('#spinner').css('height', canvas.height);
		var opts = {
			lines: 15,
			length: 20,
			width: 9,
			radius: 20,
			color: '#FFF',
			className: 'spinner',
			speed: 2,
			top: 350
		};
		new Spinner(opts).spin(document.getElementById('spinner'));
	};

	/* Hides a spinner */
	module.stopSpinner = function() {
		$('#spinner').hide();
		$('.spinner').remove();
	};

	return module;

}());