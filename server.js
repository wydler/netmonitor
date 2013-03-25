var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	os = require('os'),
	Process = require('./lib/process').Process;

server.listen(8080);

app.use("/assets", express.static(__dirname + '/assets'));

app.get('/', function (req, res) {
	res.sendfile(__dirname + '/index.html');
});

var proc_list = [
	'./bin/smartPioneerBaseServer',
	'htop'
];

var processes = [];

proc_list.forEach(function (item) {
	var proc = new Process(item);
	processes.push(proc);
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

	processes.forEach(function (item) {
		socket.emit('process', item.toJSON());

		item.on('started', function () {
			socket.emit('started', {uid: item._uid, pid: item._pid, name: item._name});
		});

		item.on('stopped', function () {
			socket.emit('stopped', {uid: item._uid});
		});

		item.on('stdout', function (data) {
			socket.emit('stdout', {uid: item._uid, data: data});
		});

		item.on('exit', function (data) {
			socket.emit('exit', {uid: item._uid, code: data.code, signal: data.signal});
		});
	});

	socket.on('hello', function (data, fn) {
		procs.push(data);
		fn(procs);
	});

	socket.on('start', function (uid) {
		processes.forEach(function (item) {
			if (item._uid === uid) {
				item.start();
			}
		});
	});

	socket.on('restart', function (uid) {
		processes.forEach(function (item) {
			if (item._uid === uid) {
				//item.restart();
			}
		});
	});

	socket.on('stop', function (uid) {
		processes.forEach(function (item) {
			if (item._uid === uid) {
				item.stop();
			}
		});
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
	}, 1000);
});