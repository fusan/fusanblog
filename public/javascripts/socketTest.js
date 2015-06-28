var socket = io.connect('https://fusanblog.herokuapp.com'); //'http://localhost:4000'
    //クライアントからsocketオブジェクトをサーバーにemit　これが最初の挙動
    
    socket.on('news', function (data) {
        console.log(data);
        socket.emit('my other event', { my: 'data' });
      });