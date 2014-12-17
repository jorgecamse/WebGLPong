/****************************************************************************
 * Initial setup
 ****************************************************************************/

var pc_configuration = {'iceServers': [{'url': 'stun:stun.l.google.com:19302'}]};

var pc_constraints = { 'optional': [{'DtlsSrtpKeyAgreement': true}, {'RtpDataChannels': true}]};

// Set up audio and video regardless of what devices are present.
var sdpConstraints = {'mandatory': {'OfferToReceiveAudio':true, 'OfferToReceiveVideo':true }};

// Create a random room if not already present in the URL.
var isInitiator;
var room = window.location.hash.substring(1);
if (!room) {
    room = window.location.hash = randomToken();
}

/****************************************************************************
 * Signaling server 
 ****************************************************************************/

// Connect to the signaling server
var socket = io.connect();

socket.on('ipaddr', function (ipaddr) {
    console.log('Server IP address is: ' + ipaddr);
    updateRoomURL(ipaddr);
});

socket.on('created', function (room, clientId) {
  console.log('Created room', room, '- my client ID is', clientId);
  isInitiator = true;
  grabWebCamVideo();
});

socket.on('join', function (room, clientId) {
    console.log('Another peer made a request to join room', room, 'with client ID', clientId);
    console.log('This peer is the initiator of room', room);
});

socket.on('joined', function (room, clientId) {
  console.log('This peer has joined room', room, 'with client ID', clientId);
  isInitiator = false;
  grabWebCamVideo();
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
    signalingMessageCallback(message);
});

// Join a room
socket.emit('create or join', room);

if (location.hostname.match(/localhost|127\.0\.0/)) {
    socket.emit('ipaddr');
}

/**
 * Send message to signaling server
 */
function sendMessage(message){
    console.log('Client sending message: ', message);
    socket.emit('message', message);
}

/**
 * Updates URL on the page so that users can copy&paste it to their peers.
 */
function updateRoomURL(ipaddr) {
    var url;
    if (!ipaddr) {
        url = location.href
    } else {
        url = location.protocol + '//' + ipaddr + ':2013/#' + room
    }
    roomURL.innerHTML = url;
}

/**************************************************************************** 
 * User media (webcam) 
 ****************************************************************************/

function grabWebCamVideo() {
    console.log('Getting user media (video) ...');
    getUserMedia({video: true}, getMediaSuccessCallback, getMediaErrorCallback);
}

function getMediaSuccessCallback(stream) {
    var streamURL = window.URL.createObjectURL(stream);
    console.log('getUserMedia video stream URL:', streamURL);
    window.localStream = stream; // stream available to console

    localVideo.src = streamURL;
    sendMessage('got user media');
}

function onRemoteStreamAdded(event) {
    var streamURL = window.URL.createObjectURL(event.stream);
    console.log('Remote stream URL:', streamURL);
    window.remoteStream = event.stream; // stream available to console

    remoteVideo.src = streamURL;
}

function getMediaErrorCallback(error){
    console.log("getUserMedia error:", error);
}

/**************************************************************************** 
 * WebRTC peer connection and data channel
 ****************************************************************************/

var peerConn;
var dataChannel;

function signalingMessageCallback(message) {
    if (message === 'got user media') {
        createPeerConnection(isInitiator, pc_configuration, pc_constraints);

    } else if (message.type === 'offer') {
        createPeerConnection(isInitiator, pc_configuration, pc_constraints);

        console.log('Got offer');
        peerConn.setRemoteDescription(new RTCSessionDescription(message), function(){}, logError);

        console.log('Sending answer to peer');
        peerConn.createAnswer(onLocalSessionCreated, logError, sdpConstraints);

    } else if (message.type === 'answer') {
        console.log('Got answer');
        peerConn.setRemoteDescription(new RTCSessionDescription(message), function(){}, logError);

    } else if (message.type === 'candidate') {
        var candidate = new RTCIceCandidate({sdpMLineIndex:message.label,
          candidate:message.candidate});
        peerConn.addIceCandidate(candidate);

    } else if (message === 'bye') {
        // TODO: cleanup RTC connection?
    }
}

function createPeerConnection(isInitiator, config, constraints) {
    try {
        console.log('Creating Peer connection as initiator?', isInitiator,
          '  config: \'' + JSON.stringify(config) + '\';\n' +
          '  constraints: \'' + JSON.stringify(constraints) + '\'.');

        peerConn = new RTCPeerConnection(config, constraints);
    } catch (e) {
        console.log('Failed to create PeerConnection, exception: ' + e.message);
        alert('Cannot create RTCPeerConnection object.');
          return;
    }

    // send any ice candidates to the other peer
    peerConn.onicecandidate = onIceCandidate;

    peerConn.onaddstream = onRemoteStreamAdded;

    peerConn.addStream(window.localStream);

    if (isInitiator) {
        try {
            console.log('Creating Data Channel');
            dataChannel = peerConn.createDataChannel("dataGame", {reliable: false});
        } catch (e) {
          alert('Failed to create data channel. ' +
                'You need Chrome M25 or later with RtpDataChannel enabled');
          console.log('createDataChannel() failed with exception: ' + e.message);
        }
        onDataChannelCreated(dataChannel);

        console.log('Creating an offer');
        var cons = getOfferConstraints();
        console.log('Sending offer to peer, with constraints: \n' +
        '  \'' + JSON.stringify(cons) + '\'.');

        peerConn.createOffer(onLocalSessionCreated, logError, cons);
    } else {
        peerConn.ondatachannel = onReceiveDataChannel;
    }
}

function onLocalSessionCreated(desc) {
    console.log('local session created:', desc);
    desc.sdp = setBandwidth(desc.sdp);
    peerConn.setLocalDescription(desc, function () {
        console.log('sending local desc:', peerConn.localDescription);
        sendMessage(peerConn.localDescription);
    }, logError);
}

function onDataChannelCreated(channel) {
    console.log('onDataChannelCreated:', channel);

    channel.onopen = function () {
        console.log('Data channel state is: ' + channel.readyState);
        start(isInitiator);
    };

    channel.onclose = function () {
        console.log('Data channel state is: ' + channel.readyState);
    };

    channel.onmessage =  function (event) {
        //console.log('Received message: ' + event.data);
        var data = JSON.parse(event.data);
        paddle1.posX = data.M[0];
        ball.posX = data.M[1];
        ball.posY = data.M[2];
    };
}

function onIceCandidate(event) {
    console.log('onIceCandidate event:', event);
    if (event.candidate) {
        sendMessage({
            type: 'candidate',
            label: event.candidate.sdpMLineIndex,
            id: event.candidate.sdpMid,
            candidate: event.candidate.candidate
        });
    } else {
        console.log('End of candidates.');
    }
}

function onReceiveDataChannel(event) {
    console.log('Receive Channel Callback:', event.channel);
    dataChannel = event.channel;
    onDataChannelCreated(dataChannel);
}

/**************************************************************************** 
 * Aux functions, mostly UI-related
 ****************************************************************************/

function getOfferConstraints() {
    var constraints = {'optional': [], 'mandatory': {'MozDontOfferDataChannel': true}};
    // temporary measure to remove Moz* constraints in Chrome
    if (webrtcDetectedBrowser === 'chrome') {
        for (var prop in constraints.mandatory) {
          if (prop.indexOf('Moz') !== -1) {
            delete constraints.mandatory[prop];
          }
        }
    }
    constraints = mergeConstraints(constraints, sdpConstraints);
    return constraints;
}

function mergeConstraints(cons1, cons2) {
    var merged = cons1;
    for (var name in cons2.mandatory) {
        merged.mandatory[name] = cons2.mandatory[name];
    }
    merged.optional.concat(cons2.optional);
    return merged;
}

var videoBandwidth = 5000;
function setBandwidth(sdp) {
    //sdp = sdp.replace(/a=mid:audio\r\n/g, 'a=mid:audio\r\nb=AS:' + audioBandwidth + '\r\n');
    sdp = sdp.replace(/a=mid:video\r\n/g, 'a=mid:video\r\nb=AS:' + videoBandwidth + '\r\n');
    return sdp;
}

function sendData(p, b) {
    var data = JSON.stringify({'M': [p.posX, b.posX, b.posY]});
    //console.log('Sending ' + data);
    dataChannel.send(data);
}

function randomToken() {
    return Math.floor((1 + Math.random()) * 1e16).toString(16).substring(1);
}

function logError(err) {
    console.log(err.toString(), err);
}

$(document).ready(function() {
	roomURL = document.getElementById('url'),
	localVideo = document.getElementById('localVideo');
    remoteVideo = document.getElementById('remoteVideo');
});