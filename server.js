var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	os = require('os');

server.listen(8080);

app.use("/assets", express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

io.sockets.on('connection', function (socket) {
	procs = new Array();

	socket.emit('dashboard', 
		{
			hostname: os.hostname(),
			type: os.type(),
			platform: os.platform(),
			arch: os.arch(),
			release: os.release()
		}
	);
	socket.on('hello', function (data, fn) {
		procs.push(data);
		fn(procs);
	});

	setInterval(function () {
		socket.emit('system', 
			{
				uptime: os.uptime(),
				loadavg: os.loadavg(),
				totalmem: os.totalmem(),
				freemem: os.freemem(),
				cpus: os.cpus()
			}
		);
	}, 2000);
});