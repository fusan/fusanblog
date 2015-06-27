var router = require('express').Router();
var server = require('http').Server(router);

router.get('/', function(req, res, next) {
	res.render('socket', {title: 'socket.io'});
  //res.send('../views/index.ejs');
});

/*
io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

users.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

*/
/*var http = require('http')(express);
var io = require('socket.io').(router);

io.on('connection', function(socket){
  console.log('a user connected');
});*/

/* GET users listing. */


module.exports = router;
