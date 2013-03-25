var opts = {
	lines: 70, // The number of lines to draw
	length: 1, // The length of each line
	width: 1, // The line thickness
	radius: 100, // The radius of the inner circle
	corners: 0, // Corner roundness (0..1)
	rotate: 0, // The rotation offset
	color: '#06f', // #rgb or #rrggbb
	speed: 1, // Rounds per second
	trail: 20, // Afterglow percentage
	shadow: false, // Whether to render a shadow
	hwaccel: false, // Whether to use hardware acceleration
	className: 'spinner', // The CSS class to assign to the spinner
	zIndex: 2e9, // The z-index (defaults to 2000000000)
	top: 'auto', // Top position relative to parent in px
	left: 'auto' // Left position relative to parent in px
};
var target = document.getElementById('loading');
var spinner = new Spinner(opts).spin(target);

var socket = io.connect('');
socket.on('dashboard', function (data) {
	$('[data="nm-hostname"]').text('@'+data.hostname+', '+data.type+' ('+data.arch+') '+data.release);
	$('#loading').hide();
	$('#processes').empty();
});
socket.on('process', function (data) {
	if ($('tr[id='+data.uid+']').length) {
		$('tr[id='+data.uid+']').html('\
			<td>'+data.pid+'</td>\
			<td>'+data.name+'</td>\
			<td>'+data.cmd+'</td>\
			<td>'+data.state+'</td>\
			<td>'+data.output.substring(0, 100)+'</td>\
			<td>\
				<a href="#" class="btn btn-mini btn-success" onClick="start(\''+data.uid+'\');"><i class="icon-play icon-white"></i></a>\
				<a href="#" class="btn btn-mini btn-warning" onClick="restart(\''+data.uid+'\');"><i class="icon-repeat icon-white"></i></a>\
				<a href="#" class="btn btn-mini btn-danger" onClick="stop(\''+data.uid+'\');"><i class="icon-stop icon-white"></i></a>\
			</td>'
		);
		if (data.state > 0) {
			$('tr[id='+data.uid+']').addClass('error');
		} else if (data.state == 0) {
			$('tr[id='+data.uid+']').addClass('warning');
		}
	} else {
		$('#processes').append('\
			<tr id="'+data.uid+'">\
				<td>'+data.pid+'</td>\
				<td>'+data.name+'</td>\
				<td>'+data.cmd+'</td>\
				<td>'+data.state+'</td>\
				<td>'+data.output.substring(0, 100)+'</td>\
				<td>\
					<a href="#" class="btn btn-mini btn-success" onClick="start(\''+data.uid+'\');"><i class="icon-play icon-white"></i></a>\
					<a href="#" class="btn btn-mini btn-warning" onClick="restart(\''+data.uid+'\');"><i class="icon-repeat icon-white"></i></a>\
					<a href="#" class="btn btn-mini btn-danger" onClick="stop(\''+data.uid+'\');"><i class="icon-stop icon-white"></i></a>\
				</td>\
			</tr>'
		);
	}
});
socket.emit('hello', 'world', function (data) {
	//console.log(data);
});
socket.on('started', function (data) {
	console.log(data);
	if ($('tr[id='+data.uid+']').length) {
		$('tr[id='+data.uid+'] td:nth-child(1)').html(data.pid);
		$('tr[id='+data.uid+'] td:nth-child(2)').html(data.name);
		$('tr[id='+data.uid+']').addClass('success');
		setTimeout(function () {
			$('tr[id='+data.uid+']').removeClass('success');
		}, 1000);
	}
});
socket.on('stopped', function (data) {
	if ($('tr[id='+data.uid+']').length) {
		$('tr[id='+data.uid+'] td:nth-child(1)').html('');
		$('tr[id='+data.uid+'] td:nth-child(2)').html('');
		$('tr[id='+data.uid+']').addClass('warning');
		setTimeout(function () {
			$('tr[id='+data.uid+']').removeClass('warning');
		}, 1000);
	}
});
socket.on('exit', function (data) {
	console.log(data);
	$('tr[id='+data.uid+'] td:nth-child(1)').html('');
	$('tr[id='+data.uid+'] td:nth-child(4)').html(data.code);
	if (data.code == 0 || data.signal == 'SIGTERM') {
		if ($('tr[id='+data.uid+']').length) {
			$('tr[id='+data.uid+']').addClass('warning');
		}
	} else {
		if ($('tr[id='+data.uid+']').length) {
			$('tr[id='+data.uid+']').addClass('error');
		}
	}
});
socket.on('stdout', function (data) {
	if ($('tr[id='+data.uid+']').length) {
		$('tr[id='+data.uid+'] td:nth-child(5)').html(data.data);
	}
});

function start (uid) {
	if ($('tr[id='+uid+']').length) {
		$('tr[id='+uid+']').removeClass();
	}
	socket.emit('start', uid);
	return false;
}

function restart (uid) {
	if ($('tr[id='+uid+']').length) {
		$('tr[id='+uid+']').removeClass();
	}
	socket.emit('restart', uid);
	return false;
}

function stop (uid) {
	if ($('tr[id='+uid+']').length) {
		$('tr[id='+uid+']').removeClass();
	}
	socket.emit('stop', uid);
	return false;
}