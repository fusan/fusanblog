/*
フロントエンドのコントロールはすべてまかなえる。
ajax, view DOM, contoroller function
*/
/* ------------------- global value --------------- */
//var socket = io.connect('http://localhost:3000');
//var socket = io.connect('https://fusanblog.herokuapp.com'); //heroku 用
var socket = io.connect('http://54.92.9.226:3000'); //aws 用
//model.js も変更
var modal = modal;

/* --------  id  global function  ------------- */
function id (selector) {
	return document.getElementById(selector);
}
/* --------  powindow global module  ------------- */
//buttonとpanel を引数で渡し,内部で紐づける。
//type引数を与えてスライド、フェイドなどアクションを帰る。
var popWindow = function(button, panel, panelInnerHtml) {
	button.parentNode.appendChild(panel); //親ノードに配置する場合。
	//button.appendChild(panel); //buttonの直下に配置する場合。

	panel.innerHTML = panelInnerHtml;
	//panel.style.marginLeft = '0px';
	panel.style.position = 'absolute';
	panel.style.width = '0px';
	panel.style.height = '0px';
	panel.style.background = 'gray';
	panel.style.overflow = 'hidden';
	panel.style.webkitTransition = '0.2s ease 0';

	button.addEventListener('click', popup, false);

	function popup(e) {
		e.stopPropagation();
		if(panel.offsetHeight === 0) {
			panel.style.height = '200px';
			panel.style.width = '300px';
		} else {
			panel.style.height = '0px';
			panel.style.width = '0px';
		}
	}
};

/* -------------------- guide bar -----------------*/
//menuのdivとmenuの次にnaviBarのdivを設置
var navigationBar = (function(parent,naviBar) {

	var menu = parent;
	var tab = menu.children;
	var naviBar = naviBar;

	naviBar.style.width = tab[0].offsetWidth + 'px';
	naviBar.style.height = '2px';
	naviBar.style.marginLeft = tab[0].offsetLeft + 'px';
	naviBar.style.background = 'red';
	naviBar.style.webkitTransition = '0.5s ease 0';

	var actionNaviBar = function (i) {
		tab[i].addEventListener('mouseenter', function() {
			var self = this;

			naviBar.style.position = 'absolute';
			naviBar.style.marginLeft = self.offsetLeft + 'px';
			naviBar.style.width = self.offsetWidth + 'px';
			naviBar.style.webkitTransition = '0.5s ease 0';

			if(i % 2 === 0) {
				naviBar.style.background = 'green';
			} else {
				naviBar.style.background = 'red';
			}

		},false);

		/*
		tab[i].addEventListener('click', function() {
			var self = this;
			console.log(self);
			naviBar.style.height = naviBar.style.width =  '4px';
			naviBar.style.webkitTransform = 'translate(' + self.offsetWidth / 2 + 'px' + ',0)';
		}, false);*/
	}

	for(var i=0,n=tab.length;i<n;i++) {
		actionNaviBar(i);
		//for分の中で関数を生成すると参照に行ってしまう。
		//console.log(tab[i].offsetLeft,tab[i].offsetWidth,tab[i].getAttribute('id'));
	}

}(document.getElementById('header'),document.getElementById('naviBar')));

/* -------------- contoroler module --------------- */
//子モジュールはボタンごとに紐付け。
//子モジュールは更に孫関数や孫モジュールを持つ
var routing = (function(buttons) {

	var createRouter = function (selector) {

		id(selector).addEventListener('click',connection ,false);

		function connection() {
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
		}
	};

	for(var i=0,n=buttons.length;i<n;i++) {
		//console.log(buttons[i].getAttribute('id'));
		createRouter(buttons[i].getAttribute('id'));
	}

}(document.getElementsByTagName('button')));

/* -------------- vote page module ----------------------*/
var vote = function() {
	//vote action
	var module = function() {
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
	};

	//create modules
	module.call(id('agree'));
	module.call(id('disagree'));

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
		console.log(stackedChart.children);
		var agreebar  = document.createElement('div');
				agreebar.setAttribute('id','agreebar');
		var disagreebar = document.createElement('div');
				disagreebar.setAttribute('id', 'disagreebar');
		console.log(agreebar, disagreebar);

		stackedChart.appendChild(agreebar);
		stackedChart.appendChild(disagreebar);
		*/

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
};

/* --------------- socket test module -------------------- */
var socketIo = function() {

	var field = id('testField');
	//geo location
	var geolocationModule = function() {
		var createMapTab = function () {
			var geolocation = $.ajax({
					url: '/socket/geolocation',
					type: 'GET'
				});

			geolocation.done(function(data){
				console.log(data);
				field.innerHTML = data;
				createGoogleMap();
			});
		}();

		var createGoogleMap = function() {
			//get gps postion
			id('getRoot').addEventListener('click', getRoot, false);
			id('getPosition').addEventListener('click', getPosition,  false);

			//create google map
			var map = new google.maps.Map(document.getElementById('googleMap'), {
				center: {lat: 35.7033, lng: 139.5809},
				zoom: 18
			});

			//marker list
			var markerList = new google.maps.MVCArray();

			//contens line initialize
			socket.emit('init pin', 'init');
			socket.on('init pin return', function(data) {

				presentLocation.innerHTML = setMarkerContents(data);
				removeMarker(document.querySelectorAll('.removeData'), markerList);

			});

			//set marker
			function setMarker(json) {
				for(var i=0,n=json.length;i<n;i++) {
					var currentPosition = new google.maps.LatLng(json[i].latitude, json[i].longitude);
					var marker = new google.maps.Marker({ position: currentPosition, visible: true, clickable: true ,draggable: true });

					markerList.push(marker);
					marker.setMap(map);
				}
			}
			//set contets
			function setMarkerContents(json) {
				var output = '';

				for(var i=0,n=json.length;i<n;i++) {
					//display deta 編集して見た目およくできる。
					output += 'No. :' + json[i].id + '<br>' +
									'訪問日' + json[i].date + '<br>' +
									'緯度：' + json[i].latitude + '<br>' +
									'経度：' + json[i].longitude + '<br>' +
									'コメント：' + json[i].comment + '<br>' +
									'<span id="' + json[i]._id + '" class="removeData"> × </span><br>';
				}
				return output;
			}

			//remove marker
			function removeMarker(target, markerArray) {

				/*markerArray.foreach(function(marker, i) {
					marker.setMap(null);
				});*/

				for(var i=0,n=target.length; i<n; i++) {
					 remove(target[i],i);
				}

				function remove(target, i) {

					target.addEventListener('click', function() {
						var id = target.getAttribute('id');
						console.log(id);

						socket.emit('remove marker', id );
						socket.on('remove marker return', function(data) {

							console.log('json after remove >', data);

							presentLocation.innerHTML = setMarkerContents(data);
							setMarker(data);

							removeMarker(document.querySelectorAll('.removeData'), markerList);
						});

					},false);
				}
			};

			//create marker
			function createNewPoint(data) {
				socket.emit('new marker send', data);
				socket.on('new marker return', function(data) {

					//create marker
					console.log('json after inport >', data, data.length);

					presentLocation.innerHTML = setMarkerContents(data);
					setMarker(data);

					removeMarker(document.querySelectorAll('.removeData'), markerList);
				});
			}

			//get root
			function getRoot() {
				var count = 0;
				var maxCount = 20;
				var duration = 1000; //呼び出し間隔
				var presentLocation = id('presentLocation'); //表示部

				(function getPositionByTime() {
						count++;

						//console.log(count);
						navigator.geolocation.getCurrentPosition(successFunc, errFunc);

						var timerID = setTimeout(getPositionByTime, duration);

						function successFunc(position) {
							var data = position.coords;
							var geoData = { latitude: data.latitude, longitude: data.longitude, time: new Date()};

							socket.emit('server push', geoData);
							socket.on('client push', function(data) {
								console.log(data);
								field.style.boxShadow = '0 0 2px green';

								presentLocation.innerHTML  = '緯度：' + data.latitude + '<br>' +
																							'経度：' + data.longitude + '<br>' +
																							'取得時刻：' + data.time; // prependの時に追加 + '<br>' + field.innerHTML;

							});
						}

						function errFunc(error) {
							var err_msg = "";
						  switch(error.code)
						  {
						    case 1:
						      err_msg = "位置情報の利用が許可されていません";
						      break;
						    case 2:
						      err_msg = "デバイスの位置が判定できません";
						      break;
						    case 3:
						      err_msg = "タイムアウトしました";
						      break;
						  }
						}

						if(count === maxCount) {
							count = 0;
							clearTimeout(timerID);
						}

					}());
				};

			//current positon once
			function getPosition() {
				navigator.geolocation.getCurrentPosition(successFunc, errFunc);

				function successFunc(position) {
					var modal = document.getElementById('modal');
					var data = position.coords;
					var geoData = { latitude: data.latitude, longitude: data.longitude };

					map.panTo(new google.maps.LatLng(geoData.latitude, geoData.longitude));

					modal.innerHTML = '<div><span>一言コメント：</span><input name="comment" type="text" id="markerComment" value="test">' +
														'<button id="submitComment">メモ</button></div>';

					modal.style.height = '100%';
					modal.style.webkitTransition = '0.3s ease 0';

					id('submitComment').addEventListener('click', function(e) {
						var data = {};
						data.geoData = geoData;
						data.comment = id('markerComment').value;

						createNewPoint(data);

						modal.style.height = '0px';
						modal.style.webkitTransition = '0.3s ease 0';
					});

					modal.children[0].addEventListener('click', function(e) {
						e.stopPropagation();
					});

					modal.addEventListener('click', function(e) {
						//e.stopPropagation();
						modal.style.height = '0px';
						modal.style.webkitTransition = '0.3s ease 0';
					});

				}

				function errFunc(error) {
					var err_msg = "";
				  switch(error.code)
				  {
				    case 1:
				      err_msg = "位置情報の利用が許可されていません";
				      break;
				    case 2:
				      err_msg = "デバイスの位置が判定できません";
				      break;
				    case 3:
				      err_msg = "タイムアウトしました";
				      break;
				  }
					console.log(err_msg);
				}

			}
		};
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
	var ballModule = function() {

		field.innerHTML = '<div id="lineX"></div><div id="lineY"></div><span id="dot"></span>';

		field.addEventListener('mousemove', moveBall, false);

		function moveBall(e) {
		  //console.log(e.pageX, e.pageY);
		  socket.emit('mousemove', {
		  	positionX : e.pageX - id('testField').offsetLeft -4,
		  	positionY: e.pageY - id('testField').offsetTop -4
		  });

			socket.on('mousemove return', function(data) {
					var dot = id('dot');
					var lineX = id('lineX');
					var lineY = id('lineY');

					dot.style.top = data.positionY + 'px';
					dot.style.left = data.positionX + 'px';

					lineX.style.marginTop = data.positionY - dot.offsetHeight / 2 - lineX.style.borderWidth + 'px';
					lineX.innerHTML = data.positionY + 'px';

					lineY.style.marginLeft = data.positionX + dot.offsetWidth / 2 + 'px';
					lineY.innerHTML = data.positionX + dot.offsetWidth / 2 + 'px';
			});
		}
	};

	var modules = [geolocationModule,presentTextMoudule, ballModule];

	for(var i=0,n=modules.length; i<n;i++) {
		document.querySelectorAll('.subModules')[i].addEventListener('click',modules[i], false);
	}

	/* chat module */
	var chatModule = function() {
		// 参考　http://www.html5.jp/canvas/ref/HTMLCanvasElement/toDataURL.html
		var photoFile;
		var chat = function() {

			//chat line initialize
			socket.emit('chat initial send', {load: 'start'});
			socket.on('chat initial return', function(data) {
				chatline(data);
			});

			//表示上限アラート
			socket.on('db alert', function(data) {
				alert(data.message);
			});


			var panelInnerHtml = '<input type="text" name="userID" value="" placeholder="Chat ID" id="userID">' +
												'<input type="text" name="message" value="" placeholder="コメント" id="message">' +
												'<input type="file" accept="image/*" name="photo" id="photo" multiple>' +
												'<button id="sendMessage">送信</button>';

			popWindow(id('messageCard'), document.createElement('div'),panelInnerHtml);

			var reader = new FileReader();

			id('photo').addEventListener('change', file, false);
			reader.addEventListener('load', fileCheck,false);

			//generate file object
			function file(e) {
				var target = e.target;
				var files = target.files;
				//文字データにする
				reader.readAsDataURL(files[0]);
			}

			//アップロード前のチェック
			function fileCheck() {
				photoFile =  imgThumnail(reader.result);
			}

			//check before uploading image
			function imgThumnail(photo) {

				id('testField').innerHTML = '';

				var image = new Image();
						image.src = photo;

				var caution = document.createElement('span');
						caution.textContent = 'よかったら送信ボタン押してね！';

				id('testField').appendChild(image);
				id('testField').appendChild(caution);

				var photoData = {};
						photoData.photo = photo;

				//socketに渡す
				image.onload = function() {
					console.log('写真', this);
					var ratio = 300 / this.naturalWidth;

					photoData.width = this.width = this.naturalWidth * ratio;
					photoData.height = this.height = this.naturalHeight * ratio;

					this.addEventListener('click', function() {
						var rad = 90;

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
				}
				*/

			}


			id('sendMessage').addEventListener('click', sendMessage, false);

			function sendMessage() {

				var pushData = {};
						pushData.pushTime = new Date();
						pushData.userID = id('userID').value ||  '';
						pushData.message = id('message').value || '';

						if( photoFile !== '') { pushData.photo = photoFile; }

				console.log(pushData);

				if(pushData.userID !== '' && pushData.message !== '') {
					id('testField').innerHTML = '';
					socket.emit('message send', pushData);
					socket.on('message send return', function(data) {
						console.log('サーバーからのデータ',data);
						chatline(data);
					});
				} else {
					alert('must id & message!');
					return;
				}

				photoFile = '';
			}
		}();

		//create chat line
		var chatline = function(data) {

			//initialize
			id('stage').innerHTML = '';
			id('message').value = '';
			id('userID').value = '';
			id('photo').value = '';

			//create chat
			var createChat = function () {
				var date = new Date(this.pushTime);
				var time = date.getHours() + '.' + date.getMinutes() + '.' + date.getSeconds();
				var html = '<div><span class="profile"></span><span class="users">' + this.userID + '</span>' +
									'<span class="time">'+ time +'</span><span class="comment">' + this.message + '</span>';

									this.photo === undefined ? html +='' : html += '<span class="photoFrame"  id="'+ this._id +'"><img src="'+this.photo.photo +'" width="'+ this.photo.width +'" height="'+ this.photo.height +'"></span>';

									html += '<span id="' + this._id + '" class="removeChat"><img src="./images/icon_check_alt.svg"></span></div>';

				id('stage').innerHTML = html + id('stage').innerHTML;
			};

			for(var i=0,n=data.length ;i<n;i++) {
					createChat.call(data[i]);
			}

			//remove chat
			var removeChat = function () {
				var chats = document.querySelectorAll('.removeChat');

				for(var i=0,n=chats.length;i<n;i++) {
					remove(chats[i]);
				}

				function remove(target) {
					target.addEventListener('click', function() {
						//クライアントで処理したうえでサーバーに返信。
						var id = target.getAttribute('id');
						var parent = target.parentNode;
								parent.parentNode.removeChild(parent);
						//console.log(id, target.parentNode);
						socket.emit('chat remove', id);
						socket.on('chat remove return', function(data) {
							console.log(data);
						});
					},false);
				}
			}();

			//画像　download
			//var imgs = document.getElementsByClassName('photoFrame');
			//download image
			/*function imgDownload(imgs) {
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
			}*/
		}
	}();
}; //socket end

/* -------------- bitcoin page module ------------------ */
var bitcoin = function() {
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
};

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
