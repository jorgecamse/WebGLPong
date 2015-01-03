/**
 * WebRTCStreaming Module
 */
 var WebRTCStreaming = (function () {

	var module = {};

	var self;

	var connection = null;

	/* Default handler for error callbacks */
	function logError(error) {
  	if (error) {
			console.log(error.toString(), error);
		}
	};

	/* Signaling message received */
	function signalingMessage(message) {
		if (message.type == "media") {
			self.isInitiator = true;
			self.peer.createConnection(self.isInitiator);
			WebGLGame.start(self.peer);
		} else if (message.type == "offer") {
			self.peer.createConnection(self.isInitiator);
	    self.peer.processSdpAnswer(message);
			self.peer.doAnswer();
		} else if (message.type == "answer") {
			self.peer.processSdpAnswer(message);
		} else if (message.type == "candidate") {
			self.peer.processCandidateAnswer(message);
		} else {
			console.log("Invalid message type " + message.type);
		}
  };

	function disconnectPeer() {
		self.peer.closeConnection();
		WebGLGame.stop();
		$('#canvasgl').hide();
		WebGLUtils.clear();
		self.peer.config.remoteVideo.src = '';
		WebGLGame.resetScore();
		Helper.showAlert('alert-waiting');
	};

	/* Signaling server event handlers */
	function addConnectionListeners() {
		connection.on('created', function (room, clientID) {
			console.log('Created room', room, '- my client ID is', clientID);
			Helper.showAlert('alert-waiting');
		});

		connection.on('join', function (room, clientID) {
			console.log('Another peer made a request to join room', room, 'with client ID', clientID);
			console.log('This peer is the initiator of room', room);
		});

		connection.on('joined', function (room, clientID) {
			console.log('This peer has joined room', room, 'with client ID', clientID);
		});

		connection.on('full', function (room) {
			alert('Room "' + room + '" is full.');
			window.location.hash = '';
			window.location.reload();
		});

		connection.on('log', function (array) {
			console.log.apply(console, array);
		});

		connection.on('message', function (message){
			console.log('Client received message:', message);
			signalingMessage(message);
		});

		connection.on('sync', function (message){
			if (message.type == "play") {
				Helper.hideAlert('alert-connected');
				$('#canvasgl').show();
				Helper.stopSpinner();
				WebGLGame.play();
			} else if (message.type == "score") {
				WebGLGame.Scored(message.player);
			} else {
				console.log("Invalid message type " + message.type);
			}
		});

		connection.on('disconnected', function (clientID){
			console.log('Client disconnected:', clientID);
			disconnectPeer();
		});
	};

	function WebRTCIface(opts) {
		self = this;
		var options = opts || {};
		var config = this.config = {
						// The id/element dom element that will hold local video
						localVideo: '',
						// The id/element dom element that will hold remote video
						remoteVideo: '',
						// Default user media constraints
						constraints: {
							audio: true,
							video : {
								mandatory : {
									maxWidth : 320,
									maxHeight : 640,
									maxFrameRate : 15,
									minFrameRate : 15
								}
							}
						}
		};
		this.isInitiator = false;

		// Set config from options
		for (item in options) {
			this.config[item] = options[item];
		};

		// Socket.io connection
    connection = this.connection = io.connect();

    addConnectionListeners();

    this.peer = WebRTCPeer.new(opts);

    this.getLocalVideo();
	};

	/* Connect iface to signaling server */
	WebRTCIface.prototype.joinRoom = function (name) {
		console.log("Creating or joining...");
		this.peer.roomName = name;
		this.connection.emit('create or join', name);
	};

	/* Get a local stream */
	WebRTCIface.prototype.getLocalVideo = function () {
		getUserMedia(this.config.constraints, function(localStream) {
			self.config.localVideo.src = URL.createObjectURL(localStream);
			self.config.localVideo.muted = true;
			self.peer.stream = localStream;
			console.log('getUserMedia video stream URL:', self.config.localVideo.src);
			module.sendMessage({type: 'media'});
		}, logError);
	};

	module.start = function(lvideo, rvideo) {
		var iface = new WebRTCIface({
					localVideo: lvideo,
					remoteVideo: rvideo,
		});
		return iface
	};

	/* Send message to signaling server */
	module.sendMessage = function(message) {
		console.log('Client sending message: ', message);
		connection.emit('message', message);
	};

	module.sendMessageSync = function(message) {
		console.log('Client sending sync message');
		connection.emit('sync', message);
	};

	return module;

}());