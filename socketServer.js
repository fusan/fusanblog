exports.listen = function(server) {

  var io = require('socket.io').listen(server);
  var io2 = io.of('/list');

  var validator = require('validator');

  io.on('connection', function (socket) {
    console.log('index connected');

    socket.on('bitcoin data send' ,function(data) {
      socket.emit('bitcoin data send return', data);
    });

    /*
    //get bitcoindata by server side
    var PubNub = require('pubnub');

    var pubnub = PubNub({
        subscribe_key: "sub-c-52a9ab50-291b-11e5-baaa-0619f8945a4f"
    });

    pubnub.subscribe({
        channel: "lightning_ticker_BTC_JPY",
        message: function (data) {
            console.log(data);
            socket.emit('bitcoin send', data);
        }
    });
    */

    socket.on('mvc push', (data) => {
      socket.emit('mvc push return',data );
    });

    socket.on('init pin', function (data) {

      Marker.find({}, function(err, data) {
        console.log(data);
        socket.emit('init pin return', data);
        socket.broadcast.emit('init pin return', data);
      });

    });

    socket.on('bitcoin send', function(data) {
      console.log(data);
    });

    //create marker  / save database
    socket.on('new marker send', function(data) {
      //データベースに格納する際にナンバリングする。
      //promise で格納後クライアントにemitする。
      //下のidプロパティーは擬似できなもの。
      data.id = Math.floor(Math.random() * 1000);
      data.latitude = data.geoData.latitude;
      data.longitude = data.geoData.longitude;

      var marker = new Marker(data);

      marker.save(function(err) {
        if(err) throw err;
        //console.log(data.id);

        Marker.find({}, function(err, data) {
          console.log(data);
          socket.emit('new marker return',data);
          socket.broadcast.emit('new marker return',data);
        });
      });
    });

    //remove marker / remove to Merker model
    socket.on('remove marker', function (data) {
      //console.log('remove retun',data);

      Marker.remove({_id: data}, function(err) {
        if(err) throw err;

        Marker.find({}, function(err, data) {
          socket.emit('remove marker return', data);
          socket.broadcast.emit('remove marker return', data);
          //reload 処理を書く
        });
      });
    })

    //mouseposition realtime
    socket.on('mousemove', function(data) {
      //console.log(data);
      socket.emit('mousemove return', data);
      socket.broadcast.emit('mousemove return', data);
    });

    socket.on('server push', function(data) {
        console.log(data);

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
          socket.broadcast.emit('chat initial return', data);
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
    socket.on('chat remove', function(id) {
      //console.log(data);
      Chat.remove({_id: id}, function(err) {
        if(err) throw err;

        Chat.find({_id: id}, function(err, data) {
          //console.log(data.length === 0);
          if(data.length === 0) {
            socket.emit('chat remove return',id);
            socket.broadcast.emit('chat remove return',id);
          }
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
