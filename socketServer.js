exports.listen = function(server) {

  var io = require('socket.io').listen(server);
  var io2 = io.of('/users');

  var validator = require('validator');

  io.on('connection', function (socket) {
    console.log('index connected');

    //mouseposition realtime
    socket.on('mousemove', function(data) {
      //console.log(data);
      socket.emit('mousemove return', data);
      socket.broadcast.emit('mousemove return', data);
    });

    socket.on('server push', function(data) {
        //console.log(data);
        socket.emit('client push', data);
        socket.broadcast.emit('client push', data);
    });

    //リアルタイムテキスト
    socket.on('text send', function(data) {
      console.log(data);

      socket.emit('text return', data);
      socket.broadcast.emit('text return', data); 
    });

    //チャット履歴の読み込み
    socket.on('chat initial send' ,function(data) {

      if(data.load == 'start') {

        Chat.where().limit(100).exec(function(err, data) {


          socket.emit('chat initial return', data);
       });
      }
    });
    
    //chat message
    socket.on('message send', function(data) {
      //console.log('chat',data);

      var log = {};
        log.pushTime = data.pushTime;
        log.userID = data.userID;
        log.message = validator.escape(data.message);
        log.photo = data.photo;

        console.log(log);

      Chat.count({}, function(err, data) {
        console.log(data);
        if(data < 10) {
          var chat = new Chat(log);

          chat.save(function(err) {

              if(err) throw err;
              sendChat();
            });
          } else {

            sendChat();
            socket.emit('db alert', {message : 'db arraive upper limit'}); 
          }
      });
    });

    function sendChat() {
      Chat.find({}, function(err, data) {

        console.log('送信内容：',data);
        socket.emit('message send return', data);
        socket.broadcast.emit('message send return', data);
      });
    }

    //chat remove
    socket.on('chat remove', function(data) {
      //console.log(data);
      Chat.remove({_id: data.id}, function(err) {
        if(err) throw err;
        console.log('remove collection',data);
        Chat.find({}, function(err, data) {
          socket.emit('chat remove return',data);
          socket.broadcast.emit('chat remove return',data);
        });
      });
    });

    socket.on('bitcoin', function(data) {
      var promise = new Promise(function(resolve, reject) {
        request('https://api.bitflyer.jp/v1/getticker', function(err, res, body) {
          if (!err && res.statusCode == 200) {
              resolve(body);
            }
        });
      });

      promise.then(function(value) {
        res.send(value);
      });
    });

  });

  //name space
  io2.on('connection', function(socket) {
    console.log('namespace ok');
  });
};
