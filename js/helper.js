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

	module.hideAlert = function(id) {
		$('#' + id).hide();
	};

	module.updatePlaceHolder = function() {
		$('#room').attr("placeholder", randomToken());
	};

	module.updateRoomURL = function(room) {
		var roomURL = document.getElementById('url');
	  var url = location.host + '/#' + room;
	  $('#facetime-icon').css('visibility', 'visible');
	  roomURL.innerHTML = url;
	};

	module.initSpinner = function() {
		$('#spinner').show();
		$('#spinner').css('width', canvas.width);
		$('#spinner').css('height', canvas.height);
		var opts = {
			lines: 15,
			length: 20,
			width: 6,
			radius: 20,
			color: '#77D',
			speed: 2,
			top: 350
		};
		new Spinner(opts).spin(document.getElementById('spinner'));
	};

	module.stopSpinner = function() {
		$('#spinner').hide();
		$('.spinner').remove();
	};

	return module;

}());