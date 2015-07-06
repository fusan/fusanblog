function id (selector) {
	return document.getElementById(selector);
}

var socket = io.connect('http://localhost:4000' || 'https://fusanblog.herokuapp.com'); // || 
    //クライアントからsocketオブジェクトをサーバーにemit　これが最初の挙動
    
    socket.on('news', function (data) {
        console.log(data);
        socket.emit('my other event', { my: 'data' });
      });

/*
フロントエンドのコントロールはすべてまかなえる。
ajax, view DOM, contoroller function 
*/

//ボタンと非同期通信お紐付け
var buttons = document.getElementsByTagName('button');

for(var i=0,n=buttons.length;i<n;i++) {
	console.log(buttons[i].getAttribute('id'));
	change(buttons[i].getAttribute('id'));
}

/* id をリンクアドレスにして非同期アクセス　*/
function change(selector) {
	id(selector).addEventListener('click', function() {
	//console.log('/' + selector);
	var view = $.ajax({
		url: '/' + selector,
		type: 'GET'
	});

	view.done(function(data) {

		//view *変動するviewを増やしたかったらselectorを増やす。
		id('viewHeader').innerHTML = data.header;
		id('viewArea').innerHTML = data.html;

		//コントローラー
		//本来はモジュールで外に出した方がわかりやすい。es6以降に成る。
		//コントローラーを増やすことで機能を使いできる。
		if(selector == 'scraping') { scraping(); }
		if(selector == 'upsert') { upsert(); }
		if(selector == 'socket') { socketIo();}

		console.log(selector +'ヘッダーとボディ', data);
	});

	},false);
}

function scraping() {
	id('scrape').addEventListener('click',function() {
		console.log('click');

		var view = $.ajax({
			url: '/scrape',
			type: 'GET',
			data: {'url': id('scrapeURL').value }
		})

		view.done(function(data) {
			//var viewArea = id('viewArea').innerHTML;
			id('viewHeader').innerHTML = data.header;
			id('viewArea').innerHTML = data.html;
			scraping();
			console.log(data);
		});
	},false);
}

function upsert() {
	$(function() {
    	id('insert').addEventListener('click', function() {
    		var $settlement = $('#settlement');
    		var $company = $('#company');

    		if($settlement.val() !='' && $company.val() !='') {

    			var test = $.ajax({
	    			url: '/insert',
	    			type: 'GET',
	    			data: {
	    				settlement: $settlement.val(),
	    				company: $company.val(),
	    				sales: $('#sales').val()
	    			}
	    		});

	    		test.done(function(data) {
	    			var $ul = $('<ul>');
	    				$ul.append('<span>' + data[0].company + '</span>');

	    			for(var i=0,n=data.length; i<n; i++) {
	    				data[i].sales === null ? data[i].sales = 0 : data[i].sales = data[i].sales;
	    				var $li = $('<li>').append('<span>'+ data[i].settlement + ':' + data[i].sales +'</span>');
	    				$ul.append($li);
	    			}

	    			$('#testFileld').html($ul);
	    			console.log(data);
	    		});
    		} else {
    			$('#testFileld').html('決算期と会社名を必ず入力してください');
    		}
    	},false);
    });
}

//socket test page
function socketIo() {
	var field = id('socketTestField');
	var photoFile;

	//console.log(field.currentStyle || document.defaultView.getComputedStyle(field, '').left);
	console.log(id('socketTestField').offsetLeft,id('socketTestField').offsetTop);

	/* geo location  */
	id('button').addEventListener('click', getGPS , false);

	socket.on('client push', function(data) {
		console.log(data[0]);
		id('socketTestField').style.boxShadow = '0 0 2px green';
	    field.innerHTML  = '緯度：' + data[0].latitude + '<br>' + field.innerHTML;
	  });

	/* mousemove event */
	field.addEventListener('mousemove', function(e) {
	  //console.log(e.pageX, e.pageY);
	  socket.emit('mousemove', {
	  	positionX : e.pageX - id('socketTestField').offsetLeft,
	  	positionY: e.pageY - id('socketTestField').offsetTop});
	},false);

	socket.on('mousemove return', function(data) {
	  $(function() {
		$('#dot').css({
		  	position: 'relative',
		  	top: data.positionY,
		  	left: data.positionX
		  });
		});
	});

	/* form realtime exist  */
	id('formTest').addEventListener('keyup', function(){

	  var text = id('formTest').value;
	  socket.emit('text send', {textData: text});

	},false);

	socket.on('text return', function(data) {
		id('socketTestField').style.boxShadow = '0 0 1px red';
	  	field.innerHTML = data.textData;
	});

	/* chat system */
	id('sendMessage').addEventListener('click', function() {
		var pushTime = new Date();
		var userID = id('userID').value !='' ? id('userID').value : '未記入';
		var message = id('message').value !='' ? id('message').value : '未記入';
		var photo = photoFile;

		console.log('<img src="'+photo+'">');

		var pushData = {pushTime: pushTime, userID: userID, message: message, photo: photo};

		//socketでクライアントへ送信
		socket.emit('message send', pushData);
	},false);

	//チャット履歴の読み込み
	socket.emit('chat initial send', {load: 'start'});

	//チャット投稿
	socket.on('message return', function(data) {　
		//console.log(data);
		chatline(data);  });

	//チャット履歴読み込み
	socket.on('chat initial return', function(data) { 
		//console.log(data);
		chatline(data); });
	
	//チャット削除後
	socket.on('chat remove return', function(data) { 
		//console.log(data); 
		chatline(data);
	});

	//画像投稿
	// 参考　http://www.html5.jp/canvas/ref/HTMLCanvasElement/toDataURL.html
	// canvasで画像圧縮　> 　toDataURLメソッドで　data:URLに変換　> socketに渡す。
	var reader = new FileReader();

	id('photo').addEventListener('change', file, false);
	//reader.addEventListener('load', fileCheck,false); file使用

	function file(e) {
		var target = e.target;
		var files = target.files;

		var blob_url = window.URL.createObjectURL(files[0]);
		console.log(blob_url);

		photoFile = imageMin(blob_url);

 		/*file 使用
 		reader.readAsDataURL(files[0]);　
		console.log(files[0]);
		*/
	}

	/*file 使用
	function fileCheck() {
		//アップロード前のチェック
		photoFile = imageMin(reader.result);
		console.log('圧縮画像データ', photoFile);
	}
	*/
	  
}

//画像圧縮
function imageMin(photo) {
	id('socketTestFieldInner').innerHTML = '';
	var canvas = document.createElement('canvas');

	var ctx = canvas.getContext('2d');

	if(!canvas || !canvas.getContext('2d')) {
			console.log('no canvas');
	}

	id('socketTestFieldInner').appendChild(canvas);

	var canvasWidth = (id('socketTestFieldInner').currentStyle || document.defaultView.getComputedStyle(id('socketTestFieldInner'), '')).width;
	var canvasHeight = (id('socketTestFieldInner').currentStyle || document.defaultView.getComputedStyle(id('socketTestFieldInner'), '')).height;

	canvas.width = parseInt(canvasWidth);
	canvas.height = parseInt(canvasHeight);
	//console.log(canvasWidth, canvasHeight);
	//ctx.strokeRect(0,0,canvasWidth,canvasHeight);

	var img = new Image();
		img.src = photo;

	img.onload = function() {
			//ロードしないと取れない。
			console.log('元データ幅',img.width,'元データ高さ', img.height);
			var ratio = img.width / img.height;

			if( img.width > img.height) { 
				console.log('横長');
				ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width / ratio, canvas.height);
			} else { 
				console.log('縦長');
				ctx.drawImage(img, 0, 0, img.width, img.height, 0, 0, canvas.width * ratio, canvas.width);
			}
			//ctx.fillStyle = 'white';
			//ctx.strokeStyle = 'gray';
			//ctx.fillText('問題なければ送信', 10,150);
		}

		//canvasを画像データに変換
		var minPhoto = canvas.toDataURL();

		//socketに渡す。
		return minPhoto;
		//console.log(photoFile);
}

function chatline(data) {
	console.log(data.length == 0 ? 'no chat data!' : data);

	id('stage').innerHTML = '';

		for(var i=0,n=data.length ;i<n;i++) {
		  	(function () {
		  		console.log('socketから受け取るID:', this._id);

		  	  	var date = new Date(this.pushTime);
		  	  	var time = date.getHours() + '.' + date.getMinutes() + '.' + date.getSeconds();

		  	  	var html = '<div><span class="profile"></span><span class="users">' + this.userID + '</span>';
		  	  		html += '<span class="time">'+ time +'</span><span class="comment">' + this.message + '</span>';
		  	  		html += '<span><img src="'+ this.photo +'"></span>';
		  	  		html += '<span id="' + i + '/' + this._id +'" class="chatRemove" onclick="chatRemove('+ i +');">Re</span></div>';

		    	id('stage').innerHTML += html;

		    	console.log('dom生成後にチェック：', document.getElementById(i+ '/' +this._id));

		  	  	//id(this._id).addEventListener('click', chatRemove, false);
		  	}).call(data[i],i);
		}
}

//chat 削除
function chatRemove(num) {
	//console.log('チャットナンバリング:',num);

	var chats = document.getElementsByClassName('chatRemove');

	for(var i=0,n=chats.length;i<n;i++) {
		//console.log('チャットID:', chats[i].getAttribute('id'));
		if(num == i) {
			var chatRemoveId = chats[i].getAttribute('id').split('/');
			console.log(chatRemoveId);
			socket.emit('chat remove', {id: chatRemoveId[1]});
		}
	}
	
	/*
	触れた要素のid,classを取得
	取得idをsocket.emitする
	サーバーで削除操作する　idをmongodbに通知、コールバックでsodket.emitする。
	サーバーから受けたデータを元に削除する。
	
	一番早いのはクライアントで削除をして、サーバーで削除操作、確認をする。
	削除できないときだけ通知をクライアントに送り、クライアントでは未削除理由とチャットの復活作業をす
	復活作業はmongoのコールバックで条件分岐して返す。
	*/
}

//gps情報
function getGPS() {
	console.log('position');
	var count = 0;
	function getPositionByTime() {
		    count++;
		    navigator.geolocation.getCurrentPosition(successFunc, errFunc);

		    var timerID = setTimeout(getPositionByTime, 1000);

		    if(count == 10) {
		      count = 0;
		      clearTimeout(timerID);
		    }
		  }
	getPositionByTime();
}

function successFunc(position) {
  var data = position.coords;
  var geoData = [{latitude: data.latitude}, {logitude: data.longitude},{time: new Date()}];
  socket.emit('server push', geoData);
}

function errFunc(error) {
  console.log(error);
}

/*
//数値配列のループ処理　ES6
var array = [1,2,3,100,200,300];
for (var i in array) {
    console.log(array[i] + ':' +i);
}

//文字列配列のループ処理 ES6
var srtingArray = ['fusan','youtan','umhan','kimutan','chantiver'];
for (var value of srtingArray) {
    console.log(value);
}
*/