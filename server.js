var os = require('os');
var static = require('node-static');
var http = require('http');
var socketIO = require('socket.io');

var file = new(static.Server)();
var app = http.createServer(function (req, res) {
  file.serve(req, res);
}).listen(process.env.PORT);

console.log('Server ready in http://localhost:' + process.env.PORT);

var io = socketIO.listen(app);
io.sockets.on('connection', function (socket){

	// convenience function to log server messages on the client
	function log(){
		var array = [">>> Message from server: "];
	  	for (var i = 0; i < arguments.length; i++) {
	  		array.push(arguments[i]);
	  	}
	    socket.emit('log', array);
	}

	socket.on('message', function (message) {
		log('Client said: ', message);
		socket.broadcast.in(socket.room).emit('message', message); // should be room only
	});

	socket.on('create or join', function (room) {
		var numClients = io.sockets.clients(room).length;

		socket.room = room;

		log('Room ' + room + ' has ' + numClients + ' client(s)');
		log('Request to create or join room', room);

		if (numClients == 0){
			socket.join(room);
			socket.emit('created', room, socket.id);
		} else if (numClients == 1) {
			io.sockets.in(room).emit('join', room, socket.id);
			socket.join(room);
			socket.emit('joined', room, socket.id);
		} else { // max two clients
			socket.emit('full', room);
		}
		socket.emit('emit(): client ' + socket.id + ' joined room ' + room);
		socket.broadcast.emit('broadcast(): client ' + socket.id + ' joined room ' + room);
	});
});