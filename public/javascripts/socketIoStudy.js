var socket = io.connect('https://fusanblog.herokuapp.com/users'); // 'http://localhost:4000/users'
  //接続確認
  socket.on('namespace!', function(data) {
      console.log(data); 
  });

function id(id) {
  return document.getElementById(id);
}