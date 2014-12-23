/**
 * WebRTC Peer Streaming Module
 */
var WebRTCPeerStreaming = (function () {

	var module = {};

	var socket = null;

	var peer;

	/**************************************************************************** 
 	 * Peer Interface
 	 ****************************************************************************/
	PeerIface = function() {

		var that = {};

		/* Signaling server event handlers */
		function addListeners() {
			socket.on('created', function (room, clientID) {
				console.log('Created room', room, '- my client ID is', clientID);
				peer = WebRTCPeer.start(localVideo, remoteVideo, true, that);
			});

			socket.on('join', function (room, clientID) {
				console.log('Another peer made a request to join room', room, 'with client ID', clientID);
				console.log('This peer is the initiator of room', room);
			});

			socket.on('joined', function (room, clientID) {
				console.log('This peer has joined room', room, 'with client ID', clientID);
				peer = WebRTCPeer.start(localVideo, remoteVideo, false, that);
			});

			socket.on('full', function (room) {
				alert('Room "' + room + '" is full. We will create a new room for you.');
				window.location.hash = '';
				window.location.reload();
			});

			socket.on('log', function (array) {
				console.log.apply(console, array);
			});

			socket.on('message', function (message){
				console.log('Client received message:', message);
				signalingMessage(message);
			});
		};

		/* Signaling message received */
		function signalingMessage(message) {
			switch (message.type) {
	      case "media":
	      	peer.start();
	      	break;
	      case "offer":
	      	peer.start();
        	peer.processSdpAnswer(message);
        	peer.doAnswer();
	      	break;
				case "answer":
					peer.processSdpAnswer(message);
					break;
	      case "candidate":
					peer.processCandidateAnswer(message);
	      	break;
	      default:
	        console.log("Invalid message type " + message.type);
    	}
		}

		/* Connect peer to signaling server */
		that.connectPeer = function(room) {
			socket = io.connect();
			addListeners();
			console.log("Creating or joining...");
			socket.emit('create or join', room);
		};

 		/* Send message to signaling server */
		that.sendMessage = function(message) {
			console.log('Client sending message: ', message);
			socket.emit('message', message);
		};

		return that;
  };

	module.initPeerIface = function(room) {
		iface = PeerIface();
		iface.connectPeer(room);

		return iface;
	};

	return module;
}());