var field = id('socketTestFieldInner');

var socket = io.connect('http://localhost:4000/users');
  //接続確認
  socket.on('namespace!', function(data) {
      console.log(data); 
  });

/* form keyup */
id('formTest').addEventListener('keyup', function(){

  var text = id('formTest').value;
  socket.emit('text send', {textData: text});

},false);

socket.on('text return', function(data) {
  field.innerHTML = data.textData;
});

id('sendMessage').addEventListener('click', function() {
  var userID = id('userID').value !='' ? id('userID').value : '未記入';
  var message = id('message').value !='' ? id('message').value : '未記入';
  var pushTime = new Date();

  //socketでクライアントへ送信
  socket.emit('message send', {pushTime: pushTime, userID: userID, message: message});

},false);

//
socket.on('message return', function(data) {
    console.log(data);

    var pushTime = new Date(data.pushTime);
    var time = pushTime.getHours() + '.' + pushTime.getMinutes() + '.' + pushTime.getSeconds();

    id('stage').innerHTML += '<div><span class="photo"></span><span class="time">'+ time +'</span><span class="users">' + data.userID + '</span><span class="comment">' + data.message + '</span></div>';
  });

//チャット履歴の読み込み
socket.on('chat initial', function(data) {
  console.log(data);

  for(var i=0,n=data.length;i<n;i++) {
    var time = new Date(data[i].pushTime).getHours() + '.' + new Date(data[i].pushTime).getMinutes() + '.' + new Date(data[i].pushTime).getSeconds();
    id('stage').innerHTML += '<div><span class="photo"></span><span class="time">'+ time +'</span><span class="users">' + data[i].userID + '</span><span class="comment">' + data[i].message + '</span></div>';
  }
  
})

function id(id) {
  return document.getElementById(id);
}