var router = require('express').Router();
var server = require('http').Server(router);

var events = require('events');
var util = require('util');
var fs = require('fs');

var promise = require('es6-promise').Promise;
//console.log(promise);

router.get('/', function(req, res) {
	console.log('emitter');


	//constractor
	function MyStream () {
		events.EventEmitter.call(this);
	}

	//evenEmitterをMyStreamに継承
	util.inherits(MyStream,events.EventEmitter);

	//メソッド追加
	MyStream.prototype.write = function(data) {
		var sum = 0;
		for(var i=0,n=data.length;i<n;i++) {
			sum += data[i];
		}
		this.emit('data', sum);
	}

	MyStream.prototype.call = function() {

	}

	//インスタンスを生成
	var stream = new MyStream();

	//リスナーと紐つけ
	stream.on('data', function(data) {

		var test = new Promise(function(reslove, reject) {
			return reslove('promise');
		});

		test.then(function (value) {
			// body...
			res.render('emitter', {title: 'eventEmitter', data: value + data.toString()})
			//res.send(data2 + data.toString());
		});
		
	});
	
	stream.write([1,2,100]);

});

router.get('/:id', function(req, res) {
	res.send(req.params);
})

module.exports = router;