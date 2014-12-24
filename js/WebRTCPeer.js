/**
 * WebRTCPeer Module
 */
 var WebRTCPeer = (function () {

	var module = {};

	var self;

	/* Default handler for error callbacks */
	function logError(error) {
		if (error) {
			console.log(error.toString(), error);
		}
	};

	/* Modify SDP bandwidth */
	function setSdpBandwidth(sdp) {
		var audioBandwidth = 50;
		var videoBandwidth = 5000;

		sdp = sdp.replace(/a=mid:audio\r\n/g, 'a=mid:audio\r\nb=AS:' + audioBandwidth + '\r\n');
		sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + videoBandwidth + '\r\n');

		return sdp;
	};

	function WebRTCPeer(opts) {
		self = this;
		var options = opts || {};
		var config = this.config = {
						// Default ICE server
						server: {
								iceServers: [{"url": "stun:stun.l.google.com:19302"}]
						},
						// Default RTCPeerConnection options
						options: {
								optional: [
										{DtlsSrtpKeyAgreement: true},
										{RtpDataChannels: true}
								]
						},
						// Default offer SDP constrains
						constraints: {
								mandatory: {
										OfferToReceiveAudio: true,
										OfferToReceiveVideo: true
								}
						}
		};

		// set options
		for (item in options) {
				this.config[item] = options[item];
		}
	};

	/* Create the RTCPeerConnection and starts the SDP negotiation process */
	WebRTCPeer.prototype.createConnection = function (isInitiator) {
		this.isInitiator = isInitiator;

		Helper.showAlert('alert-connecting');
		console.log('Created Peer connection as initiator?', this.isInitiator,
			'  config: \'' + JSON.stringify(this.config.server) + '\';\n' +
			'  options: \'' + JSON.stringify(this.config.options) + '\'.');

		this.pc = new RTCPeerConnection(this.config.server, this.config.options);

		this.pc.onicecandidate = this.handleIceCandidate;

		this.pc.onaddstream = this.handleAddRemoteStream;

		this.pc.addStream(this.stream);

		if (this.isInitiator) {
			this.dataChannel = this.pc.createDataChannel("datachannel_" + this.roomName, {reliable: false});
			console.log('Created Data Channel ' + this.dataChannel.label);
			this.addDataChannelListeners();

			this.pc.createOffer(this.onLocalSession, logError, this.config.constraints);
		} else {
			this.pc.ondatachannel = this.handleDataChannel;
		};
	};

	/* Send ICE candidate to signaling server */
	WebRTCPeer.prototype.handleIceCandidate = function (event) {
		console.log('onIceCandidate event:', event);
		if (event.candidate) {
			var message = {
				type: 'candidate',
				label: event.candidate.sdpMLineIndex,
				id: event.candidate.sdpMid,
				candidate: event.candidate.candidate
			};
			WebRTCStreaming.sendMessage(message);
			console.log('Sended ICE candidate:', event.candidate);
		} else {
			console.log('End of candidates');
		}
	};

	/* Once remote stream arrives, show it in the remote video element */
	WebRTCPeer.prototype.handleAddRemoteStream = function (event) {
		self.config.remoteVideo.src = URL.createObjectURL(event.stream);
		console.log('Remote stream URL:', self.config.remoteVideo.src);
	};

	/* Function invoked when requesting it create offers or answers */
	WebRTCPeer.prototype.onLocalSession = function(description) {
		console.log('Created Local Session');
		description.sdp = setSdpBandwidth(description.sdp);
		self.pc.setLocalDescription(description, function() {
			console.log('Set Local Description');
		}, logError);

		/* Send SDP offer to signaling server */
		WebRTCStreaming.sendMessage(self.pc.localDescription);
		console.log('Sended SDP offer:', self.pc.localDescription);
	};

	/* Function invoked when an SDP answer is received */
	WebRTCPeer.prototype.processSdpAnswer = function(answer) {
		var description = new RTCSessionDescription(answer);
		console.log('SDP answer received, setting remote description');
		this.pc.setRemoteDescription(description, function(){}, logError);
	};

	/* Respond to an offer sent from a remote connection */
	WebRTCPeer.prototype.doAnswer = function(offer) {
		this.pc.createAnswer(this.onLocalSession, logError, this.config.constraints);
	}

	/* Function invoked when an candidate answer is received */
	WebRTCPeer.prototype.processCandidateAnswer = function(answer) {
		var candidate = new RTCIceCandidate({
			sdpMLineIndex : answer.label,
			candidate : answer.candidate
		});
		this.pc.addIceCandidate(candidate, function(){}, logError);
	};

	/* Data Channel event handlers */
	WebRTCPeer.prototype.addDataChannelListeners = function() {
		self.dataChannel.onopen = function () {
			console.log('Data channel state is: ' + self.dataChannel.readyState);
			WebGLGame.start(function() {
				Helper.showAlert('alert-connected', Helper.countDown);
			});
		};

		self.dataChannel.onclose = function () {
			console.log('Data channel state is: ' + self.dataChannel.readyState);
		};

		self.dataChannel.onmessage =  function (event) {
			var data = JSON.parse(event.data);
			//console.log('Received message: ' + data);

			WebGLGame.onReceiveData(data);
		};
	};

	/* Send Data */
	WebRTCPeer.prototype.sendData = function(data) {
		//console.log('Sending ' + data);
		this.dataChannel.send(JSON.stringify(data));
	};

	/* Processing a new data channel received and setup event handlers */
	WebRTCPeer.prototype.handleDataChannel = function(event) {
		console.log('onDataChannel event:', event.channel);
		self.dataChannel = event.channel;
		self.addDataChannelListeners();
	};

	module.new = function(opts) {
		return new WebRTCPeer(opts);
	}

	return module;

}());