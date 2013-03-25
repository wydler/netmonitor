var spawn = require('child_process').spawn,
	  fs = require('fs'),
	  events = require('events'),
	  util = require('util'),
	  crypto = require('crypto');

var Process = function Process(cmd) {
	events.EventEmitter.call(this);

	this._uid = crypto.randomBytes(8).toString('hex');
  this._proc = null;
  this._pid = '';
  this._name = '';
  this._cmd = cmd;
  this._state = '';
  this._output = '';
};
util.inherits(Process, events.EventEmitter);

Process.prototype.toJSON = function() {
	return {
		uid: this._uid,
		pid: this._pid,
		name: this._name,
		cmd: this._cmd,
		state: this._state,
		output: this._output
	}
}

Process.prototype.start = function() {
	if (this._pid == '') {
		this._proc = spawn(this._cmd);
	  this._pid = this._proc.pid;
	  this._name = '';
	  this._state = '';
	  this._output = '';

	  var file = fs.readFileSync('/proc/'+this._pid+'/stat');
	  var data = file.toString();
	  this._name = data.split(/ +/)[1].replace(/\(/, '').replace(/\)/, '');

	  var self = this;
	  this._proc.stdout.on('data', function (data) {
	  	self._output = data.toString();
	  	self.emit('stdout', data.toString());
		})
		this._proc.on('exit', function (code, signal) {
	  	self._state = code;
	  	self._pid = '';
	  	self.emit('exit', {code: code, signal: signal});
		})

		this.emit('started');
	}
}

Process.prototype.stop = function() {
	if (this._pid != '') {
		this._proc.kill();
		this._pid = '';
		this.emit('stopped');
	}
}

Process.prototype.restart = function() {
	// TODO
}

exports.Process = Process;