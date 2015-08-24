/*
フロントエンドのコントロールはすべてまかなえる。
ajax, view DOM, contoroller function
*/

//var socket = io.connect('http://localhost:4000');
var socket = io.connect('https://fusanblog.herokuapp.com');

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
		if(selector == 'vote') { vote();}
	});

	},false);
}

//vote modele
function vote() {
	//push votes
	var module = (function() {
		this.addEventListener('click', function() {
			var push = $.ajax({
				type: 'GET',
				url: '/vote/push',
				data: {vote : this.id}
			});

			push.done(function(data) {
				render(data.agree, data.disagree);
				renderPie(data.agree, data.disagree);
			});

		}, false);
	});

	module.call(id('agree'));
	module.call(id('disagree'));

	//rendaring module
	function render(agree, disagree) {
		var total = agree + disagree;
		var agreeRatio = (agree / total) * 100;
		var disagreeRatio = (disagree / total) * 100;
		var agreebar = document.getElementById('agreebar');
		var disagreebar = document.getElementById('disagreebar');

		agreebar.style.width = agreeRatio + '%';
		disagreebar.style.width = disagreeRatio + '%';

		agreebar.innerHTML = '良い' + agree;
		disagreebar.innerHTML = 'うむ〜' + disagree;

		console.log(total, agreeRatio, disagreeRatio);
	}

	function renderPie(agree, disagree) {
		var list = [agree, disagree];
		var pieChart = document.getElementById('pieChart');
		var pieChartChild = pieChart.parentNode.children[3].firstChild;

		if(pieChartChild) { pieChart.removeChild(pieChartChild);}

		var svg = d3.select('#pieChart')
								.append('svg')
								.attr({
									position: 'absolute',
									top: 0,
									left: 0,
									width: parseInt(getComputedStyle(pieChart,'').width )+ 'px',
									height: parseInt(getComputedStyle(pieChart,'').height) + 'px'
								});

		var pie = d3.layout.pie().value(function(d) {return d;});

		var arc = d3.svg.arc().innerRadius(40).outerRadius(140);
		var color = ['rgb(252, 82, 82)', 'rgb(23, 128, 204)'];

		svg.selectAll('path')
				.data(pie(list))
				.enter()
				.append('path')
				.attr({
					fill:function(d,i) {
						return color[i];
					},
					'stroke': 'white',
					'transform': 'translate(' + parseInt(getComputedStyle(pieChart,'').width ) / 2 + ',' + parseInt(getComputedStyle(pieChart,'').height) / 2 + ')'
				})
				.transition()
				.duration(400)
				.ease('ease')
				.attrTween('d', function(d,i) {
		      var interpolate = d3.interpolate(
		        {startAngle: 0, endAngle: 0},
		        {startAngle: d.startAngle, endAngle: d.endAngle}
		        );

		      return function(t) {
		          return arc(interpolate(t));
		        }
		      });

				svg.selectAll('text')
					.data(list)
					.enter()
					.append('text')
					.attr({
						transform: function(d) {
			        //console.log(arc.centroid(d));
			        //textPositions.push(arc.centroid(d));
			        return  'translate(' + arc.centroid(d) +')';
			      },
			      'font-size': '1rem',
			      'text-anchor': 'middle',
			      fill: 'black'
					})
					.text(function(d,i) {
						return d;
					});
	}
}

//bitcoin test module
function bitcoin() {

	id('getBitcoinData').addEventListener('click', function() {
		//console.log('/' + this.getAttribute('id'));
		var count = 0;
		(function getBid(url) {
			count++;

			var bitcoin = $.ajax({
				url: '/getBitcoinData',
				type: 'GET'
			});

			bitcoin.done(function(data) {
				//http api
				var ticker = JSON.parse(data);
				//console.log(ticker);
				id('bitcoinStage').innerHTML += ticker.product_code + ':' + ticker.timestamp + ':' +ticker.volume + '<br>';

				//console.log(data);
			}).fail(function(err) {
				//console.log(err.state());
			});

			var timerID = setTimeout(getBid, 1000);
			if(count === 10) {
				clearTimeout(timerID);
			}

		}());
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
			//console.log(data);
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
	//console.log(id('socketTestField').offsetLeft,id('socketTestField').offsetTop);

	/* geo location  */
	id('button').addEventListener('click', getGPS , false);

	socket.on('client push', function(data) {
		//console.log(data[0]);
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

		var photo = photoFile;

		//console.log('<img src="'+photo+'">');
		var pushData = {
			pushTime: pushTime,
			userID: userID,
			message: message,
			photo: photo};

		//console.log(pushData);

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


	var photoData = {};
		photoData.photo = photo;

	//socketに渡す
	image.onload = function() {
		var ratio = 300 / this.naturalWidth;

		photoData.width = this.width = this.naturalWidth * ratio;
		photoData.height = this.height = this.naturalHeight * ratio;

		//console.log(this.width, this.naturalWidth);
		//console.log(this.height, this.naturalHeight);


		this.addEventListener('click', function() {
			var rad = 90;
			//console.log('click');

			$(this).css({
				'-webkit-transform-origin': '50% 50%',
				'-webkit-transform': 'rotate(0deg)'
			}).animate({
				'-webkit-transform-origin': '50% 50%',
				'-webkit-transform': 'rotate(' + rad + 'deg)'
			},500);

		},false);

	}

	console.log(photoData);

	return photoData;

/*
	if(image.naturalWidth > 300) {
		console.log('圧縮');
		var ratio = 300 / image.naturalWidth;

		photoData.width  = image.width = image.naturalWidth * ratio;
		photoData.height = image.height = image.naturalHeight * ratio;
	} else {
		console.log('非圧縮');
		photoData.width  = image.width = image.naturalWidth;
		photoData.height = image.height = image.naturalHeight;
	}*/

	}

//create chat line
function chatline(data,event) {
	//console.log(data.length === 0 ? 'no chat data!' : data);

	id('stage').innerHTML = '';

	for(var i=0,n=data.length ;i<n;i++) {
	  	(function () {
	  		//console.log('socketから受け取るID:', this._id);
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
	    		//console.log( i ,'番目でスライドアップ');
	    	} else {
	    		//id('stage').innerHTML += html;
	    		id('stage').innerHTML = html + id('stage').innerHTML;
	    	}


	    	//console.log('dom生成後にチェック：', document.getElementById(i+ '/' +this._id));
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
				//console.log(data);
			});
		},false);
	}
}

//remove chat
function chatRemove(num) {
	//console.log('削除引数:',num);

	var chats = document.getElementsByClassName('chatRemove');

	for(var i=0,n=chats.length;i<n;i++) {
		var chatRemoveId = chats[i].getAttribute('id').split('/');
			//console.log('削除チャットID', parseInt(chatRemoveId[0]));
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
	//console.log('position');
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
  //console.log(error);
}

function id (selector) {
	return document.getElementById(selector);
}
