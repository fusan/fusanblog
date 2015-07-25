var socket = io.connect('https://fusanblog.herokuapp.com'); //'http://localhost:4000'

/*
フロントエンドのコントロールはすべてまかなえる。
ajax, view DOM, contoroller function 
*/

//ボタンと非同期通信お紐付け
var buttons = document.getElementsByTagName('button');

for(var i=0,n=buttons.length;i<n;i++) {
	//console.log(buttons[i].getAttribute('id'));
	routing(buttons[i].getAttribute('id'));
}

/* contoroler module　*/
function routing(selector) {
	id(selector).addEventListener('click', function() {
	//console.log('/' + selector);
	var view = $.ajax({
		url: '/' + selector,
		type: 'GET'
	});

	view.done(function(data) {
		//console.log(data);
		//view *変動するviewを増やしたかったらselectorを増やす。
		id('viewHeader').innerHTML = data.header;
		id('viewArea').innerHTML = data.html;

		//コントローラー
		//ES6になったらmoduleにexportする
		//ajaxとviewを組み合わせた関数モジュール群
		if(selector == 'scraping') { scraping(); }
		if(selector == 'upsert') { upsert(); }
		if(selector == 'socket') { socketIo(); }
		if(selector == 'bitcoin') { bitcoin(); }
	});

	},false);
}

//bitcoin test module
function bitcoin() {
	
	id('getBitcoinData').addEventListener('click', function() {
		console.log('/' + this.getAttribute('id'));
	
		var bitcoin = $.ajax({
			url: '/' + this.getAttribute('id'),
			type: 'GET'
		});

		bitcoin.done(function(data) {
			var ticker = JSON.parse(data);
			console.log(ticker);
			id('bitcoinStage').innerHTML = ticker.product_code + ticker.timestamp; 
			//console.log(data);
		}).fail(function(err) {
			console.log(err.state());
		});
	},false);
}

/* scraping test module */
function scraping() {
	id('scrape').addEventListener('click',function() {
		//console.log('click');

		var view = $.ajax({
			url: '/scrape',
			type: 'GET',
			data: {'url': id('scrapeURL').value }
		});

		view.done(function(data) {
			//var viewArea = id('viewArea').innerHTML;
			id('viewHeader').innerHTML = data.header;
			id('viewArea').innerHTML = data.html;
			scraping();
			console.log(data);
		});
	},false);
}

/* mongoose test module */
function upsert() {
	$(function() {
    	id('insert').addEventListener('click', function() {
    		var $settlement = $('#settlement');
    		var $company = $('#company');

    		if($settlement.val() !=='' && $company.val() !=='') {

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
	    			//console.log(data);
	    		});
    		} else {
    			$('#testFileld').html('決算期と会社名を必ず入力してください');
    		}
    	},false);
    });
}

/* socket test module */
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
	  	positionX : e.pageX - id('socketTestField').offsetLeft -4,
	  	positionY: e.pageY - id('socketTestField').offsetTop -4
	  });
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
		var userID = id('userID').value !=='' ? id('userID').value : '';
		var message = id('message').value !=='' ? id('message').value : '';
		var photo;
			photoFile === undefined ? photo = '' : photo = photoFile;

		//console.log('<img src="'+photo+'">');
		var pushData = {
			pushTime: pushTime,
			userID: userID,
			message: message,
			photo: photo};

		console.log(pushData);

		//socketでクライアントへ送信
		if(pushData.userID !== '' && pushData.message !== '') {
			id('socketTestFieldInner').innerHTML = '';
			socket.emit('message send', pushData);
		} else {
			alert('must id & message!');
			return;
		}
		
	},false);

	//チャット履歴の読み込み
	socket.emit('chat initial send', {load: 'start'});

	//チャット投稿
	socket.on('message send return', function(data) {
		//console.log(data);
		chatline(data);
	});

	socket.on('db alert', function(data) {
		alert(data.message);
		//var alert = id('alert').innerHTML = '<div>'+ data.message +'</div>';
		//console.log(alert);
	});

	//チャット履歴読み込み
	socket.on('chat initial return', function(data) { 
		//console.log(data);
		chatline(data); });
	
	//チャット削除後
	socket.on('chat remove return', function(data) { 
		//console.log(data); 
		chatline(data);
	});

	// 参考　http://www.html5.jp/canvas/ref/HTMLCanvasElement/toDataURL.html
	// canvasで画像圧縮　> 　toDataURLメソッドで　data:URLに変換　> socketに渡す。
	var reader = new FileReader();

	id('photo').addEventListener('change', file, false);
	reader.addEventListener('load', fileCheck,false);

	function file(e) {
		var target = e.target;
		var files = target.files;

		//文字データにする
 		reader.readAsDataURL(files[0]);　
	}

	function fileCheck() {
		//アップロード前のチェック
		photoFile = imgThumnail(reader.result);
	}
}

//check before uploading image 
function imgThumnail(photo) {

	id('socketTestFieldInner').innerHTML = '';

	var image = new Image();
		image.src = photo;

	var caution = document.createElement('span'),
		text = document.createTextNode('よかったら送信ボタン押してね！');
	
	caution.appendChild(text);

	id('socketTestFieldInner').appendChild(image);
	id('socketTestFieldInner').appendChild(caution);

	//socketに渡す。
	var photoData = {};
		photoData.photo = photo;

	if(image.width > 300) {
		var ratio = 300 / image.width;

		photoData.width  = image.width = image.width * ratio;
		photoData.height = image.height = image.height * ratio;
	} else {
		photoData.width = image.width;
		photoData.height = image.height;
	}

	console.log(photoData);

	return photoData;
}

//create chat line
function chatline(data,event) {
	console.log(data.length === 0 ? 'no chat data!' : data);

	id('stage').innerHTML = '';

	for(var i=0,n=data.length ;i<n;i++) {
	  	(function () {
	  		console.log('socketから受け取るID:', this._id);
	  		//console.log(i,n);

	  	  	var date = new Date(this.pushTime);
	  	  	var time = date.getHours() + '.' + date.getMinutes() + '.' + date.getSeconds();

	  	  	var html = '<div><span class="profile"></span><span class="users">' + this.userID + '</span>';
	  	  		html += '<span class="time">'+ time +'</span><span class="comment">' + this.message + '</span>';
	  	  		this.photo === undefined ? html +='' : html += '<span class="photoFrame"  id="'+ this._id +'"><img src="'+ this.photo.photo +'" width="'+ this.photo.width +'" height="'+ this.photo.height +'"></span>';
	  	  		html += '<span id="' + i + '/' + this._id +'" class="chatRemove" onclick="chatRemove('+ i +');"><img src="./images/icon_check_alt.svg"></span></div>';

	    	
	    	if(i == n-1) {
	    		//id('stage').innerHTML += html; 
	    		id('stage').innerHTML = html + id('stage').innerHTML;
	    		id(i+'/'+this._id).parentNode.setAttribute('class', 'newChat');
	    		console.log( i ,'番目でスライドアップ');
	    	} else {
	    		//id('stage').innerHTML += html;	
	    		id('stage').innerHTML = html + id('stage').innerHTML;
	    	}


	    	console.log('dom生成後にチェック：', document.getElementById(i+ '/' +this._id));
	  	}).call(data[i],i);
	}

	id('message').value = '';
	id('userID').value = '';
	id('photo').value = '';

	//画像　download 
	var imgs = document.getElementsByClassName('photoFrame');
	imgDownload(imgs);
}

//download image
function imgDownload(imgs) {
	
	//console.log(imgs.length);
	for(var i=0,n=imgs.length; i<n; i++) {
		imgs[i].addEventListener('click', function() {
			//console.log(this.id);
			var download = $.ajax({
				url: '/download/' + this.id,
				type: 'GET'
			});

			download.done(function(data) {
				console.log(data);
			});
		},false);
	}
}

//remove chat
function chatRemove(num) {
	console.log('削除引数:',num);

	var chats = document.getElementsByClassName('chatRemove');

	for(var i=0,n=chats.length;i<n;i++) {
		var chatRemoveId = chats[i].getAttribute('id').split('/');
			console.log('削除チャットID', parseInt(chatRemoveId[0]));
		//console.log('チャットID:', chats[i].getAttribute('id'));
		if(num === parseInt(chatRemoveId[0])) {
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

//get gps data
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

function id (selector) {
	return document.getElementById(selector);
}
