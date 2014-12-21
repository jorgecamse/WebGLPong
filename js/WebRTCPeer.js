/**
 * WebRTC Peer module
 */
var WebRTCPeer = (function () {

	var module = {};

	var peer;

	var peerConnection;

	/* Default handler for error callbacks */
	function defaultError(error) {
		if (error) {
			console.log(error.toString(), error);
		}
	};

	/* Send SDP offer to signaling server */
	function sendOffer(description) {
		peer.iface.sendMessage(description);
		console.log('Sended SDP offer:', description);
	};

	/* Send ICE candidate to signaling server */
	function sendCandidate(candidate) {
		var message = {
			type: 'candidate',
			label: candidate.sdpMLineIndex,
			id: candidate.sdpMid,
			candidate: candidate.candidate
    };

		peer.iface.sendMessage(message);
		console.log('Sended ICE candidate:', candidate);
	};

	/* Modify SDP bandwidth */
	function setSdpBandwidth(sdp) {
		var audioBandwidth = 50;
		var videoBandwidth = 5000;

		sdp = sdp.replace(/a=mid:audio\r\n/g, 'a=mid:audio\r\nb=AS:' + audioBandwidth + '\r\n');
		sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + videoBandwidth + '\r\n');

		return sdp;
	};

	/**************************************************************************** 
 	 * Peer Object
 	 ****************************************************************************/
	Peer = function(localVideo, remoteVideo, isInitiator, iface) {
		this.localVideo = localVideo;
		this.remoteVideo = remoteVideo;
		this.isInitiator = isInitiator;
		this.iface = iface;
	};

	/* Create the RTCPeerConnection object and starts the SDP negotiation process */
	Peer.prototype.start = function() {
		console.log('Creating Peer connection as initiator?', this.isInitiator,
			'  config: \'' + JSON.stringify(this.server) + '\';\n' +
			'  constraints: \'' + JSON.stringify(this.options) + '\'.');

		peerConnection = new RTCPeerConnection(this.server, this.options);

		peerConnection.onicecandidate = function(event) {
			console.log('onIceCandidate event:', event);
			if (event.candidate) {
				sendCandidate(event.candidate);
			} else {
				console.log('End of candidates');
			}
		};

		peerConnection.onaddstream = function(event) {
			peer.remoteVideo.src = URL.createObjectURL(event.stream);
    	console.log('Remote stream URL:', peer.remoteVideo.src);
		};

		peerConnection.addStream(peer.stream);

		if (this.isInitiator) {
			peer.dataChannel = peerConnection.createDataChannel("datachannel_" + room, {reliable: false});
			console.log('Created Data Channel ' + peer.dataChannel.label);
			this.addDataChannelListeners(peer.dataChannel);

			this.constraints = {
				mandatory : {
					OfferToReceiveAudio : true,
					OfferToReceiveVideo : true
				}
			};

			peerConnection.createOffer(this.onLocalSession, defaultError, this.constraints);
    } else {
    	peerConnection.ondatachannel = function(event) {
				console.log('onDataChannel event:', event.channel);
				peer.dataChannel = event.channel;
				peer.addDataChannelListeners(peer.dataChannel);
			};
    };
	};

	/* Function invoked when an candidate answer is received */
	Peer.prototype.processCandidateAnswer = function(answer) {
		var candidate = new RTCIceCandidate({
			sdpMLineIndex : answer.label,
			candidate : answer.candidate
		});

		peerConnection.addIceCandidate(candidate, function(){}, defaultError);
	};

	/* Function invoked when requesting it create offers or answers */
	Peer.prototype.onLocalSession = function(description) {
		console.log('Created Local Session');
		description.sdp = setSdpBandwidth(description.sdp);
		peerConnection.setLocalDescription(description, function() {
			console.log('Set Local Description');
		}, defaultError);

		sendOffer(peerConnection.localDescription);
	};

	/* Function invoked when an SDP answer is received */
	Peer.prototype.processSdpAnswer = function(answer) {
		var description = new RTCSessionDescription(answer);

		console.log('SDP answer received, setting remote description');
		peerConnection.setRemoteDescription(description, function(){}, defaultError);
	}

	/* Respond to an offer sent from a remote connection */
	Peer.prototype.doAnswer = function(offer) {
		peerConnection.createAnswer(this.onLocalSession, defaultError, this.constraints);
	}

	/* Data Channel event handlers */
	Peer.prototype.addDataChannelListeners = function(channel) {
		channel.onopen = function () {
			console.log('Data channel state is: ' + channel.readyState);
    };

    channel.onclose = function () {
			console.log('Data channel state is: ' + channel.readyState);
    };

    channel.onmessage =  function (event) {
			console.log('Received message: ' + event.data);
    };
	};

	/* Default user media constraints */
	Peer.prototype.userMediaConstraints = {
		audio : true,
		video : {
			mandatory : {
				maxWidth : 640,
				maxFrameRate : 15,
				minFrameRate : 15
			}
		}
	};

	/* Default ICE server */
	Peer.prototype.server = {
		iceServers : [ {
			url : 'stun:stun.l.google.com:19302'
		} ]
	};

	/* Default options for RTCPeerConnection */
	Peer.prototype.options = {
		optional : [ {
			DtlsSrtpKeyAgreement : true
		},
		{
			RtpDataChannels: true
		}]
	};

	/* Function invoked when passing the local media stream object */
	Peer.prototype.onUserMedia = function(localStream) {
		peer.localVideo.src = URL.createObjectURL(localStream);
		peer.localVideo.muted = true;
		peer.stream = localStream;
		console.log('getUserMedia video stream URL:', peer.localVideo.src);

		peer.iface.sendMessage({
			type: 'media'
		});
	};

	/* Created the Peer object and obtain userMedia */
	module.start = function(localVideo, remoteVideo, isInitiator, iface) {
		peer = new Peer(localVideo, remoteVideo, isInitiator, iface);

		var constraints = peer.userMediaConstraints;

		getUserMedia(constraints, peer.onUserMedia, defaultError);

		return peer;
  };

	return module;
}());