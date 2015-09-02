/*
フロントエンドのコントロールはすべてまかなえる。
ajax, view DOM, contoroller function
*/

//var socket = io.connect('http://localhost:4000');
//model.js も変更
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
			//view *変動するviewを増やしたかったらselectorを増やす。
			id('viewHeader').innerHTML = data.header;
			id('viewArea').innerHTML = data.html;

			//コントローラー
			//ES6になったらmoduleにexportする
			//ajaxとviewを組み合わせた関数モジュール群
			if(selector === 'scraping') { scraping(); }
			if(selector === 'upsert') { upsert(); }
			if(selector === 'socket') { socketIo(); }
			if(selector === 'bitcoin') { bitcoin(); }
			if(selector === 'vote') { vote();}
		});
	},false);
}

/* -------------- vote page module ----------------------*/
var vote = (function() {
	//vote action
	var module = (function() {
		//render modules
		module.render = function(agree, disagree) {
			var total = agree + disagree;
			var agreeRatio = (agree / total) * 100;
			var disagreeRatio = (disagree / total) * 100;
			var agreebar = document.getElementById('agreebar');
			var disagreebar = document.getElementById('disagreebar');
			//element を　毎度生成する。

			/*
			console.log(agreebar, disagreebar);
			var stackedChart = document.getElementById('stackedChart');
			//console.log(stackedChart.children);
			var agreebar  = document.createElement('div');
					agreebar.setAttribute('id','agreebar');
			var disagreebar = document.createElement('div');
					disagreebar.setAttribute('id', 'disagreebar');
			//console.log(agreebar, disagreebar);

			stackedChart.appendChild(agreebar);
			stackedChart.appendChild(disagreebar);*/

			agreebar.style.width = agreeRatio + '%';
			disagreebar.style.width = disagreeRatio + '%';

			agreebar.innerHTML = '良い' + agree;
			disagreebar.innerHTML = 'うむ〜' + disagree;

			console.log(total, agreeRatio, disagreeRatio);
		};

		//render pie chart by D3
		module.renderPie = function(agree, disagree) {
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
				        };
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
			};

		//click event
		this.addEventListener('click', function() {
			console.log(this);
			var push = $.ajax({
				type: 'GET',
				url: '/vote/push',
				data: {vote : this.id}
			});

			push.done(function(data) {
				module.render(data.agree, data.disagree);
				module.renderPie(data.agree, data.disagree);
			});

		}, false);
	});

	module.call(id('agree'));
	module.call(id('disagree'));
});

/* -------------- bitcoin page module ------------------ */
var bitcoin = (function() {
	id('getBitcoinData').addEventListener('click', getBitcoinData, false);

	function getBitcoinData() {
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
	}
});

/* -------------- scraping page module ------------------ */
var scraping = function() {
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
		});
	},false);
};

/* --------------- mongoose page module ----------------- */
var upsert = function() {
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
	    		});
    		} else {
    			id('testFileld').innerHTML = '決算期と会社名を必ず入力してください';
    		}
    	},false);
    });
};

/* --------------- socket test module -------------------- */
var socketIo = function() {

	var field = id('testField');
	var photoFile;


	/* geo location */
	var geolocationModule = function(){

		(function createMapTab() {
			var geolocation = $.ajax({
					url: '/socket/geolocation',
					type: 'GET'
				});

			geolocation.done(function(data){
				field.innerHTML = data;
				createGoogleMap();
			});
		}());

		function createGoogleMap() {
			//get gps postion
			id('getPosition').addEventListener('click', getGPS , false);

			function getGPS() {
				var count = 0;
				var duration = 1000;

			(function getPositionByTime() {
					count++;
					console.log(count);
					navigator.geolocation.getCurrentPosition(successFunc, errFunc);

					var timerID = setTimeout(getPositionByTime, duration);

					function successFunc(position) {
						var data = position.coords;
						var geoData = [{latitude: data.latitude}, {logitude: data.longitude},{time: new Date()}];

						socket.emit('server push', geoData);
						socket.on('client push', function(data) {
								var presentLocation = id('presentLocation');

								field.style.boxShadow = '0 0 2px green';

								presentLocation.innerHTML  = '緯度：' + data[0].latitude; // prependの時に追加 + '<br>' + field.innerHTML;
								//presentLocation.style.marginTop = '0.5rem';
								//presentLocation.style.webkitTransition = '1.2s ease 0';

								/* current positon marker
								var latlng = new googele.maps.LatLng(data[0].latitude, data[0].longitude);
								var marker = new googele.maps.Marker({
									map: map,
									postion: latlng
								});*/
							});
					}

					function errFunc(error) {
						//console.log(error);
					}

					if(count == 20) {
						count = 0;
						clearTimeout(timerID);
					}
				}());
			};

			//create google map
			var map = new google.maps.Map(document.getElementById('googleMap'), {
				center: {lat: 35.7033, lng: 139.5809},
				zoom: 15
			});
		}
	};

	/* present text  */
	var presentTextMoudule = function() {

		(function presentTextTab(){

			var realtimeInputText = $.ajax({
					url: '/socket/realtimeInputText',
					type: 'GET'
				});

			realtimeInputText.done(function(data) {

				field.innerHTML = data;

				id('formTest').addEventListener('keyup', emitFormText, false);

				function emitFormText(){
					var text = id('formTest').value;

					socket.emit('text send', {textData: text});
					socket.on('text return', function(data) {
						field.style.boxShadow = '0 0 1px red';
						id('textarea').innerHTML = data.textData;
					});
				}
			});
		}());
	};

	/* mousemove event */
	var ballModule = function(){

		field.innerHTML = '<div id="testFieldInner"><span id="dot"></span></div>';

		field.addEventListener('mousemove', moveBall, false);

		function moveBall(e) {
		  //console.log(e.pageX, e.pageY);
		  socket.emit('mousemove', {
		  	positionX : e.pageX - id('testField').offsetLeft -4,
		  	positionY: e.pageY - id('testField').offsetTop -4
		  });

			socket.on('mousemove return', function(data) {
					var dot = id('dot');

					dot.style.position = 'relative';
					dot.style.top = data.positionY + 'px';
					dot.style.left = data.positionX + 'px';
			});
		}
	};

	var modules = [geolocationModule,presentTextMoudule, ballModule];

	for(var i=0,n=modules.length; i<n;i++) {
		document.querySelectorAll('.subModules')[i].addEventListener('click',modules[i], false);
	}

	/* chat system */
	id('sendMessage').addEventListener('click', function() {

		var pushTime = new Date();
		var userID = id('userID').value !=='' ? id('userID').value : '';
		var message = id('message').value !=='' ? id('message').value : '';
		var photo;

		photoFile === undefined ? photo = '' : photo = photoFile;

		//console.log('<img src="'+photo+'">');
		var pushData = {};
				pushData.pushTime = pushTime;
				pushData.userID = userID;
				pushData.message = message;
				pushData.photo = photo;

		//socketでクライアントへ送信
		if(pushData.userID !== '' && pushData.message !== '') {
			id('testField').innerHTML = '';
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
};

//check before uploading image
function imgThumnail(photo) {

	id('testField').innerHTML = '';

	var image = new Image();
		image.src = photo;

	var caution = document.createElement('span'),
		text = document.createTextNode('よかったら送信ボタン押してね！');

	caution.appendChild(text);

	id('testField').appendChild(image);
	id('testField').appendChild(caution);


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
	};

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

	var chat = (function (i) {
		//console.log('socketから受け取るID:', this._id);
		//console.log(i,n);
			var date = new Date(this.pushTime);
			var time = date.getHours() + '.' + date.getMinutes() + '.' + date.getSeconds();

			var html = '<div><span class="profile"></span><span class="users">' + this.userID + '</span>' +
								'<span class="time">'+ time +'</span><span class="comment">' + this.message + '</span>';

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
	});

	for(var i=0,n=data.length ;i<n;i++) {
	  	chat.call(data[i],i);
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

function id (selector) {
	return document.getElementById(selector);
}
