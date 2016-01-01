/* ------------------- global value --------------- */
var socket = io.connect('http://localhost:3000');
//var socket = io.connect('https://fusanblog.herokuapp.com'); //heroku 用
//var socket = io.connect('http://54.92.9.226:3000'); //aws 用
//model.js も変更
/*
window.addEventListener('load', function() {

  var holidays = ['12/31','1/1','1/2', '1/3'];

  var today = `${new Date().getMonth() + 1}/${new Date().getDate()}`;

  var inner = document.createElement('div');

  for(var i=0,n=holidays.length;i<n;i++) {
    if(today === holidays[i]) modal_controller(true, document.body, inner);
  }

  var days = function () {
    var data = '';
    for(var i=0,n=holidays.length;i<n;i++) {
      data += holidays[i];
    }
    return data;
  }();

  inner.style.margin = '0 auto';
  inner.innerHTML = `<h4>年末年始営業時間のご案内</h4>
  <p>昨年中は大変お世話になりました。<br>新年は１月４日から営業いたします。<br>休業日${days}</p>`;

},false);
*/
/* --------- modal contoroller ----------------------------*/
//htmlファイルのbodyの最後にmodalようのdiv要素を配置すればどこでも浸かる。
var modal_controller = function modal_controller(flag, outer, inner, style) {

  style = '' || {};
  style.width = '' || window.innerWidth;
  style.height = '' || window.innerHeight;
  style.Yscale = '' || 0.8;
  style.Xscale = '' || 0.4;

  outer.appendChild(inner);

  outer.style.background = 'rgba(0,0,0,0.16)';
  outer.style.transition = '0.3s ease 0';
  inner.style.background = 'white';

  outer.addEventListener('mousedown', close, false);
  inner.addEventListener('mousedown', stop_bubble, false);

  flag ? open() : close();

  function open(e) {
    outer.style.height = `${style.height}px`;
    outer.style.width = `${style.width}px`;
    inner.style.height = `${style.height * style.Yscale}px`;
    inner.style.width = `${style.width * style.Xscale}px`;
    inner.style.opacity = '1';
  }

  function close(e) {
    outer.style.height = inner.style.height = 0;
    outer.style.width = inner.style.width = `${style.width}px`;
    inner.style.opacity = '0';
  }

  function stop_bubble(e) { e.stopPropagation(); }

//end
};

/* --------  judge userAgent --------------------- */
//https://w3g.jp/blog/js_browser_sniffing2015
var _ua = function _ua(u){
  return {
    Tablet:(u.indexOf("windows") != -1 && u.indexOf("touch") != -1)
      || u.indexOf("ipad") != -1
      || (u.indexOf("android") != -1 && u.indexOf("mobile") == -1)
      || (u.indexOf("firefox") != -1 && u.indexOf("tablet") != -1)
      || u.indexOf("kindle") != -1
      || u.indexOf("silk") != -1
      || u.indexOf("playbook") != -1,
    Mobile:(u.indexOf("windows") != -1 && u.indexOf("phone") != -1)
      || u.indexOf("iphone") != -1
      || u.indexOf("ipod") != -1
      || (u.indexOf("android") != -1 && u.indexOf("mobile") != -1)
      || (u.indexOf("firefox") != -1 && u.indexOf("mobile") != -1)
      || u.indexOf("blackberry") != -1
  }
}(window.navigator.userAgent.toLowerCase());

/* --------  id  global function  ----------------- */
function id(selector) {
	return document.getElementById(selector);
}

/* --------  powindow global module  ------------- */
//buttonとpanel を引数で渡し,内部で紐づける。
//type引数を与えてスライド、フェイドなどアクションを帰る。
var popWindow = function popWindow(button, panel, inner, option) {

  button.parentNode.appendChild(panel); //親ノードに配置する場合。
	//button.appendChild(panel); //buttonの直下に配置する場合。
	panel.innerHTML = inner;

	panel.style.position = 'absolute';
	panel.style.height = '0px';
  panel.style.background = option.bg || 'gray';
  panel.style.overflow = 'hidden';
  panel.style.webkitTransition = '0.2s ease 0';

  var remove_button = document.createElement('span');
      remove_button.textContent = '▲';
      remove_button.style.position = 'absolute';
      remove_button.style.top = remove_button.style.right = '0';
      remove_button.style.color = 'red';

  panel.appendChild(remove_button);

  if(_ua.Mobile || _ua.Tablet) {

    button.addEventListener('touchstart', toggle, false);
    remove_button.addEventListener('touchstart', toggle, false);

  } else {

    button.addEventListener('click', toggle, false);
    remove_button.addEventListener('click', toggle, false);

  }

	if(option.type === 'show') {

		panel.style.width = '0px';

	} else if(option.type === 'slide') {

		panel.style.width = `${option.w}px`;

	} else {

		panel.style.width = `${option.w}px`;

	}

	function toggle(e) {

		e.stopPropagation();

		if(panel.offsetHeight === 0) {

			panel.style.height = `${option.h}px`;
			panel.style.width = `${option.w}px`;
      this.style.color = 'red';

			if(option.type === 'fadeIn') {

				panel.style.opacity = '1';
			}

		} else {

			panel.style.height = '0px';
      this.style.color = 'white';

			if(option.type === 'show') {

				panel.style.width = '0px';

			} else if(option.type === 'slide') {

				panel.style.width = `${option.w}px`;

			} else if(option.type === 'fadeIn') {

				panel.style.width = `${option.w}px`;
				panel.style.opacity = '0';

			}
		}
	}
//end
};

/* ----------- guide bar module -----------------*/
//menuのdivとmenuの次にnaviBarのdivを設置
var navigationBar = function(parent,naviBar) {

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
//end
}(document.getElementById('header'),document.getElementById('naviBar'));

/* ------------- mail module ----------------------------- */
var mail = function mail(button) {

  var flag = true,
      send_data = {};
  var modal_inner = document.createElement('div');
      modal_inner.style.padding = '4px';
  var check = document.createElement('input');
      check.setAttribute('type', 'button');
      check.value = '確認';
  var send = document.createElement('input');
      send.setAttribute('type', 'button');
      send.value = '送信';
  var correct = document.createElement('input');
      correct.setAttribute('type', 'button');
      correct.value = '訂正';

  button.addEventListener('mousedown', open, false);
  check.addEventListener('mousedown',checks, false);
  send.addEventListener('mousedown',sendmail, false);
  correct.addEventListener('mousedown',open, false);

  //メールフォーム開く
  function open() {

    modal_controller(flag, modal, modal_inner);

    modal_inner.innerHTML =
      `<h4 id="mail_title">メッセージ</h4>
      <div><input type="text" id="id" placeholder="123" value="${send_data.id || ''}"></div>
      <div><input type='email' id='email' placeholder="sample@gmail.com" value="${send_data.email || ''}"></div>
      <div><input type="text" id="subject" placeholder="タイトル" value="${send_data.subject || ''}"></div>
      <div><textarea id="html" rows="30" cols="40" placeholder="希望内容">${send_data.html || ''}</textarea></div>`;

    modal_inner.appendChild(check);

  }

  //内容確認
  function checks() {

    send_data.id = document.getElementById('id').value;
    send_data.email = document.getElementById('email').value;
    send_data.subject = document.getElementById('subject').value;
    send_data.html = document.getElementById('html').value;

    modal_inner.innerHTML =
      `<div id="id">${send_data.id}</div>
      <div id="email">${send_data.email}</div>
      <div id="subject">${send_data.subject}</div>
      <div id="html">${send_data.html}</div>`;

    modal_inner.appendChild(send);
    modal_inner.appendChild(correct);

  }

  //メール送信
  function sendmail() {

    modal_controller(false, modal, modal_inner);

    var mail = $.ajax({
      url: '/mail',
      type: 'GET',
      data: {
        id: send_data.id,
        email: send_data.email,
        subject: send_data.subject,
        html: send_data.html
      }
    });

    mail.done(function (data) {
      alert(data);
    });

  }
//end
}(document.getElementById('open_mail_form'));

/* -------------- contoroler module --------------- */
var routing = function(buttons) {

	var createRouter = function (selector) {

		document.getElementById(selector).addEventListener('click',connection ,false);

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
        if(selector === 'experiment') experiment();
				if(selector === 'scraping') scraping();
				//if(selector === 'upsert') upsert();
				if(selector === 'socket') socketIo();
				if(selector === 'bitcoin') bitcoin();
				if(selector === 'vote') vote();
        if(selector === 'reserveSystem') reserveSystem(document.getElementById('stage'));
        if(selector === 'reserveSystem2') reserveSystem2(document.getElementById('stage'));
        if(selector === 'stock') stock();
        if(selector === 'ui') ui();

			});
		}
	};

	for(var i=0,n=buttons.length;i<n;i++) {
		createRouter(buttons[i].getAttribute('id'));
	}
//end
}(document.getElementsByTagName('button'));

/* --------------- mongoose page module ------------ */
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
	    				$ul.append(`<span>${data[0].company}</span>`);

	    			for(var i=0,n=data.length; i<n; i++) {
	    				data[i].sales === null ? data[i].sales = 0 : data[i].sales = data[i].sales;
	    				var $li = $('<li>').append(`<span>${data[i].settlement}:${data[i].sales}</span>`);
	    				$ul.append($li);
	    			}

	    			$('#testFileld').html($ul);
	    		});
    		} else {
    			id('testFileld').innerHTML = '決算期と会社名を必ず入力してください';
    		}
    	},false);
    });
//end
};

/* --------------- test filed ---------------------- */
var experiment = function experiment() {

  /* mvc model */
  var mvc = function mvc(stage, dbType) {
    var input = document.createElement('input');
    var display = document.createElement('span');
        input.setAttribute('type', 'text');
        input.id = 'view';
        display.id = 'display';

    var history = []; //change storage
    var data_for_socket = {};

    stage.appendChild(input);
    stage.appendChild(display);

    input.addEventListener('keyup',contoroller, false);

    function contoroller(e) {
      console.log(this.value);
      var text;

      if(this.value === 'fusan') {
        text = this.value + 'さん';
      } else {
        text = this.value;
      }

      model(text,e,'server');

    }

    function model(data,e,dbType) {
      //データストレージ呼び出し、挿入
      var text, color;
      text = color = data;

      if(dbType === 'local') { //localStorage histroryArray insert iterable by chance event
        window.localStorage.setItem('text', text);
        window.localStorage.setItem('color', color);
        text = window.localStorage.getItem('text');
        color = window.localStorage.getItem('color');
        console.log('local');
      }

      if(dbType === 'server') { //socket history timestamp <- e.object
        data_for_socket.timestamp = e.timeStamp;
        data_for_socket.data = data;
        //console.log(e.timeStamp);
        socket.emit('mvc push', data_for_socket);
        socket.on('mvc push return', function(data) {
          console.log(data);
        });
      }

      view(text, color);
    }

    function view(text, color) {
      display.textContent = text;
      display.style.color = color;
    }
  //end
  }(document.getElementById('experiment_stage'), 'localStorage');

  /* 背景　*/
  var snow = function snow(stage) {
    var window_w = window.screen.width;
    var window_h = window.screen.height;

    stage.style.position = 'relative';

    var Snow = function Snow(dom,w,h,bg) {
      var _h = Math.random() * window_h;
      var _w = Math.random() * window_w;
      //console.log(h,w,Math.random(),_h,_w);
      console.log(bg);
      this.name = name;
      this.count = 0;

      this.dom = document.createElement(dom);
      this.w = w;
      this.h = h;
      this.dom.style.position = 'absolute';
      this.dom.style.width = `${w}px`;
      this.dom.style.height =`${h}px`;
      this.dom.style.background = 'gray';
      //this.dom.style.background = `url(${bg})`;
      this.dom.style.top =`${_h}px`;
      this.dom.style.left =`${_w}px`;

    };

    Snow.prototype.add = function() {
      //console.log(this.dom);
      stage.appendChild(this.dom);

    };

    //落下を表現
    Snow.prototype.fall = function() {
      this.count += 1;
      var timerID = setTimeout(fall, 1000);

      if(this.dom.style.top > window.offsetHeight) {
        clearTimeout(timerID);
      }
    };

    //デバイスの加速度をとって揺れる。
    Snow.prototype.move = function() {};

    for(var i=0,n=10;i<n;i++) {
      var s = new Snow('div',30 ,30 ,'../imgaes/icon_pin.svg');
      s.add();
    }

    /*
    divでスクリーンサイズを10分割
    奇数階の部分だけスローにダウン、偶数回少し早めにダウン。
    div inner　を　揺れるアニメーションをつける。
    二つのアニメーション制御
    scaleを使ってevenだけ少し小さくして奥行き感を出す。
    ランダムで生成しても良い。
    */
  //end
  }(document.body);

  /* neuron test */
  var neuron = function neuron() {
    var u = function(x1, x2, b) {
      var _w1 = 1.3, _w2 = 1.3;
      return _w1 * x1 + _w2 * x2 + b;
    }

    var f = function(u) {
      return Math.min(1,Math.max(0,u));
    }

    var params = [[0,0,0], [1,1,0], [0,0,1]];

    for (var i = 0; i < params.length; i++) {
      var results = f(u(params[i][0],params[i][1],params[i][2])) === 0 ? '抑制' : '亢進';
      console.log('neuron test',results );
    }
  //end
  }();

  var nets = function nets() { //伝播力　infulence ノード数　nodes
    var Net = function Net(infulence, nodes) {
      this.infulence = infulence;
      this.nodes = nodes;
    };

    Net.prototype.call = function call() {
      console.log(this.infulence, this.nodes);
    }

    var net = new Net(3,6);
    net.call();
  //end
  }();
//end
};

/* -------------- scraping page module ------------ */
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
//end
};

/* -------------- socket test module -------------- */
var socketIo = function() {
	var module = {};
			module.field = document.getElementById('testField');

	/* ================= geo location ================= */
	module.geolocationModule = function geolocationModule() {
		var createMapTab = function () {
			var geolocation = $.ajax({
					url: '/socket/geolocation',
					type: 'GET'
				});

			geolocation.done(function(data){
				//console.log(data);
				module.field.innerHTML = data;
				createGoogleMap();
			});
		}();

		var createGoogleMap = function createGoogleMap() {
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
          var date = new Date(json[i].date);
					//display deta 編集して見た目およくできる。
					output += '<div class="wrap"><div>No.' + json[i].id + '</div>'
								+ '<div>' + date.getFullYear() + '.' +date.getMonth() + '.' + date.getDate() +'</div>'
								+	'<div>緯度' + json[i].latitude.toFixed(2) + '</div>'
								+	'<div>経度' + json[i].longitude.toFixed(2) + '</div>'
								+	'<div>' + json[i].comment + '<span id="' + json[i]._id + '" class="removeData"> × </span>' + '</div></div>';
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
						//console.log(id);

						socket.emit('remove marker', id );
						socket.on('remove marker return', function(data) {

							//console.log('json after remove >', data);

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
					//console.log('json after inport >', data, data.length);

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
								//console.log(data);
								module.field.style.boxShadow = '0 0 2px green';

								presentLocation.innerHTML  = '緯度：' + data.latitude + '<br>' +
																							'経度：' + data.longitude + '<br>' +
																							'取得時刻：' + data.time; // prependの時に追加 + '<br>' + module.field.innerHTML;

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
          //console.log('success');
					var modal = document.getElementById('modal');
					var data = position.coords;
					var geoData = { latitude: data.latitude, longitude: data.longitude };

					map.panTo(new google.maps.LatLng(geoData.latitude, geoData.longitude));

					modal.innerHTML = '<div><span>一言コメント：</span><input name="comment" type="text" id="markerComment" value="test">' +
														'<button id="submitComment">メモ</button></div>';
          console.log(modal);
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
          //console.log(error);
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
	//geolocationModule
	};
	/* ================= mousemove event ================= */
	module.ballModule = function ballModule() {

		module.field.innerHTML = '<div id="lineX"></div><div id="lineY"></div><span id="dot"></span>';
    if(module.field.firstChild.getAttribute('id') === 'lineX') {
      module.field.addEventListener('mousedown', branch, false);
  		module.field.addEventListener('mouseup', branch, false);
    }

    var dot = document.getElementById('dot');
    var lineX = document.getElementById('lineX');
    var lineY = document.getElementById('lineY');

    dot.style.left = dot.style.top = 0;
    //dot.style.transform = 'translate(20px)';

    function branch(e) {
      e.stopPropagation();
      e.preventDefault();

      if(e.type === 'mousedown') {
        module.field.addEventListener('mousemove', branch, false);
      } else if(e.type === 'mousemove') {

      } else if(e.type === 'mouseup') {
        module.field.removeEventListener('mousemove', branch, false);
      }
      console.log(e.type);
      move(e);
    }

		function move(e) {
		  //console.log(e.pageX, e.pageY);
  		socket.emit('mousemove', {
  		  positionX : e.pageX - id('testField').offsetLeft -4,
  		  positionY: e.pageY - id('testField').offsetTop -4
  		});

			socket.on('mousemove return', function(data) {
        //console.log(data.positionY);

				//dot.style.webkitTransform = 'translateY(' + data.positionY + 'px)';
				//dot.style.webkitTransform = 'translateX(' + data.positionX + 'px)';
        dot.style.top = data.positionY + 'px';
				dot.style.left = data.positionX + 'px';

				lineX.style.top = data.positionY - dot.offsetHeight + 'px';
				lineX.innerHTML = data.positionY + 'px';

				lineY.style.left = data.positionX + dot.offsetWidth / 2 + 'px';
				lineY.innerHTML = data.positionX + dot.offsetWidth / 2 + 'px';
			});
		}
	//ballModule
	};
	/* ================= routing  ================= */
	module.routing = function routing() {
		var flag;
		var modules = [module.geolocationModule,module.ballModule];

		//ボタンとページの紐付け
		function createSubRouter(button,page) {
			//console.log(button, page);
			button.addEventListener('click',function() {

				if( button.getAttribute('id') === page.name ) {
					flag = true;
					page();
				} else {
					flag = false;
				}

			}, false);
		}

		for(var i=0,n=modules.length; i<n;i++) {
			createSubRouter(document.querySelectorAll('.subModules')[i], modules[i]);
		}
	//routing
	}();
	/* ================= chat module ================= */
	module.chatModule = function chatModule() {
		// http://www.html5.jp/canvas/ref/HTMLCanvasElement/toDataURL.html
		var photoFile;

		var chat = function chat() {
			//chat line initialize
			var initialize = function initialize() {
				socket.emit('chat initial send', {load: 'start'});
				socket.on('chat initial return', function(data) {
					chatline(data);
				});

				//表示上限アラート
				socket.on('db alert', function(data) {
					alert(data.message);
				});
			//initialize
			}();

			//add chat
			var addChat = function addChat() {

				var button = id('messageCard');
				var popup = document.createElement('div');
				var html = '<input type="text" name="userID" value="" placeholder="Chat ID" id="userID">'
								  + '<input type="text" name="message" value="" placeholder="コメント" id="message">'
									+ '<input type="file" accept="image/*" name="photo" id="photo" multiple>'
									+ '<button id="sendMessage">送信</button>';

        var option = {};
            option.type = 'slide';
            option.bg = 'rgba(0,0,0,0.08)';
            option.w = option.h = 200;

				popWindow(button, popup, html, option);
			//pushChat
			}();

			//send chat
			var pushChat = function pushChat() {

				if(_ua.Mobile || _ua.Tablet) {
					id('sendMessage').addEventListener('touchstart', push, false);
				} else {
					id('sendMessage').addEventListener('click', push, false);
				}

				function push() {
					var message = {};
							message.pushTime = new Date();
							message.userID = id('userID').value ||  '';
							message.message = id('message').value || '';

					if( photoFile !== '') { message.photo = photoFile; }

					if(message.userID !== '' && message.message !== '') {
						module.field.innerHTML = '';

						socket.emit('message send', message);
						socket.on('message send return', function(data) {
							//console.log('サーバーからのデータ',data);
							chatline(data);
						});
					} else {
						alert('must id & message!');
						return;
					}

					photoFile = '';

				}
			//pushChat
			}();
			//create file object
			var createFile = function createFile() {
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
					photoFile = thumnail(reader.result);
				}

				//check before uploading image
				function thumnail(photo) {

					module.field.innerHTML = '';

					var image = new Image();
							image.src = photo;

					module.field.appendChild(image);

					var photoData = {};
							photoData.photo = photo;

					//socketに渡す
					image.onload = function() {
						//console.log('写真', this);
						var ratio = 300 / this.naturalWidth;
						var rad = 0;

						photoData.width = this.width = this.naturalWidth * ratio;
						photoData.height = this.height = this.naturalHeight * ratio;

						if(_ua.Mobile || _ua.Tablet) {
							rotate(this, 'touchstart');
						} else {
							rotate(this, 'click');
						}

						function rotate(target, event) {
							target.addEventListener( event, function() {
								//console.log(target);
								rad += 90;
								target.style.webkitTransition = '1s ease 0';
								target.style.webkitTransformOrigin = '50% 50%';
								target.style.webkitTransform = 'rotate(' + rad + 'deg)';

							},false);
						}

					};
					return photoData;
				}
			//createFile end
			}();
		//chat end
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
			//createChat end
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
							//console.log(data);
						});
					},false);
				}
			//removeChat end
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
		//chatline end
		};
	//moduel.chatModule
	}();
//end
};

/* -------------- bitcoin page module ------------ */
var bitcoin = function() {

  var volume, caution, arr = ['日','月','火','水','木','金','土'];;　//timeline用
  //chart用 d 描画高さ　h 表示高さ pt 上のり代 pb 下のり代　maxData 最大値　minData 最小値　(h - pt -pb = d) ->  (maxData - minData)
  var count = 0, newData, oldData, maxData = 50000 , minData = 43000, h, d, dt, db, pt, pb, v;
  var stage = document.getElementById('bitcoinStage'),
      stopButton = document.getElementById('stopButton'),
      timelineOuter = document.createElement('div'),
      timeline = document.createElement('div'),
      chartOuter = document.createElement('div'),
      chart = document.createElement('canvas'),
      guide_line = document.createElement('canvas');

  //guide line
  if(!guide_line || !guide_line.getContext) { return false; }
  var ctx2 = guide_line.getContext('2d');

  //chart area
  if(!chart || !chart.getContext) { return false; }
  var ctx = chart.getContext('2d');

  //set style css
  stage.style.width = '100%';
  stage.style.height = '20rem';
  stage.style.overflow = 'hidden';
  stage.style.boxShadow = '0 0 1px gray';

  timelineOuter.setAttribute('id','timelineOuter');
  timelineOuter.style.float = 'left';
  timelineOuter.style.width = '50%';
  timelineOuter.style.height = '100%';
  timelineOuter.style.color = 'white';
  timelineOuter.style.background = 'black';
  timelineOuter.style.perspective = 500;

  stopButton.style.background = 'rgba(0,0,0,.08)';
  stopButton.style.display = 'inline-block';
  stopButton.style.width = stopButton.style.height = stopButton.style.lineHeight = '1.2rem';
  stopButton.style.borderRadius = '100%';
  stopButton.style.textAlign = 'center';

  chartOuter.setAttribute('id','chartOuter');
  chartOuter.style.float = 'left';
  chartOuter.style.width = '50%';
  chartOuter.style.height = '100%';
  chartOuter.style.background = 'white';
  chartOuter.style.color = 'red';
  chartOuter.style.position = 'relative';

  stage.appendChild(timelineOuter);
  timelineOuter.appendChild(timeline);

  stage.appendChild(chartOuter);
  chartOuter.appendChild(chart);
  chartOuter.appendChild(guide_line);

  chart.height = chartOuter.offsetHeight;
  chart.width = chartOuter.offsetWidth;
  chart.style.background = 'green';
  //console.log(chart);

  guide_line.height = chartOuter.offsetHeight;
  guide_line.width = chartOuter.offsetWidth;
  guide_line.style.background = 'transparent';
  guide_line.style.position = 'absolute';
  guide_line.style.left = guide_line.style.top = 0;
  //console.log(guide_line);

  //display data
  h = chart.offsetHeight; //表示領域
  pt = pb = h * 0.1;
  d = h - pt - pb; //表示高さ
  dt = pt;
  db = d + pt;
  v = d / (maxData - minData); //値をpxに変換する比率
  //console.log(h,d,dt,db,v);


  //drag bar
  timelineOuter.addEventListener('mouseenter', timelineFn, false);
  function timelineFn(e) {
    //console.log(window.getComputedStyle(chartOuter,'').width);
    var right_end = this.offsetLeft + this.offsetWidth;
    var startX = e.pageX - right_end;
    var borderwidth = 8;

    timelineOuter.style.borderRight = `${borderwidth}px solid red`;
    //左半分のボーダーを透明にすると、imageborderを使うとbodyから離れて見える。
    //timelineOuter.style.paddingRight = '5px';

    timelineOuter.addEventListener('mousemove', width_control, false);
    function width_control(e) {
      console.log(parseInt(window.getComputedStyle(stage,'').width), e.pageX - this.offsetLeft, parseInt(window.getComputedStyle(stage,'').width) - (e.pageX - this.offsetLeft));
      timelineOuter.style.width = `${e.pageX - this.offsetLeft}px`;
      chartOuter.style.width = `${parseInt(window.getComputedStyle(stage,'').width) - (e.pageX - this.offsetLeft)}px`;

    }

    timelineOuter.addEventListener('mouseleave', width_control_stop, false);
    function width_control_stop(e) {
      //console.log('mouseout');
      timelineOuter.style.borderRight = '';
      startX = '';

    }

  }


  //get bitcoindata
  var pubnub = PUBNUB({
      subscribe_key: "sub-c-52a9ab50-291b-11e5-baaa-0619f8945a4f",
      publish_key: 'demo'    // only required if publishing
  });

  pubnub.subscribe({
    channel: "lightning_ticker_BTC_JPY",
    message: function(data) {
      creatChartLine(data);
    }
   });

   //draw ticker chart
   function creatChartLine(data) {
      var now = new Date(data.timestamp);
      var day = now.getDay();
      var realtime = `${(now.getMonth() + 1)}/${now.getDate()}　${now.getHours()}:${now.getMinutes()}:${now.getSeconds()} ${arr[day]}　`;

      if(volume !== data.volume) {
        volume = data.volume;
        caution = '↑';
        //console.log('volume up');
      } else {
        caution = '';
      }

      //ticker display
      timeline.innerHTML = `${ realtime} ${data.ltp}　${volume.toFixed(2)} ${caution}<br>`
                          + timeline.innerHTML;

      newData = (data.ltp - minData) * v + pb;
      //console.log(newData);

      createTicker();

      //insert database
      //sendDB(data)
   }

   //ticker function ----------> ＊candleの場合はcountを変える。
   function createTicker() {

      if(count === 'stop') {

        return;

       } else　if(count === 0) {

        ctx.beginPath();
        ctx.moveTo(0,h - newData);
        ctx.lineTo(0,h - newData);
        ctx.stroke();

        oldData = newData;
        count += 1;

      }　else {
        console.log(h,h - newData);
        ctx.beginPath();
        ctx.moveTo(count,h - oldData);
        count += 1;
        ctx.lineTo(count,h - newData);
        ctx.stroke();

        oldData = newData;

      }
    };

   //guide
   guide_line.addEventListener('mousemove', function(e) { guide(e, chartOuter, this); }, false);
   function guide(e, parent, canvas) {
     //console.log(parent.offsetWidth, stage.offsetWidth - timelineOuter.offsetWidth);
     ctx2.clearRect(0,0,parent.offsetWidth,parent.offsetHeight);

     ctx2.beginPath();
     var baseline = -(e.pageY - chartOuter.offsetTop - chartOuter.offsetHeight) - pb;
     console.log(baseline / v + maxData, pb / v);

     //x scale
     ctx2.moveTo(0,e.pageY　- parent.offsetTop);
     ctx2.lineTo(parent.offsetWidth, e.pageY- parent.offsetTop);
     ctx2.fillText(`${(baseline / v + maxData).toFixed(0)}`, 5, e.pageY　- parent.offsetTop - 2 );

     //y scale
     ctx2.moveTo(e.pageX - parent.offsetLeft,0);
     ctx2.lineTo(e.pageX - parent.offsetLeft, parent.offsetHeight);
     ctx2.fillText(`${e.pageX - parent.offsetLeft}`, e.pageX - parent.offsetLeft + 2, 10);

     ctx2.stroke();
   }



   //socket
   function sendDB(data) {
      socket.emit('bitcoin data send', data);
      socket.on('bitcoin data send return', function(data) {
        console.log(data);
      });
    }

   stopButton.addEventListener('mousedown', stopTicker, false);

   function stopTicker() {
     console.log('stop');
     count === 'stop';
       pubnub.unsubscribe({
         channel: "lightning_ticker_BTC_JPY"
       });
   }
//end
};

/* -------------- vote page module --------------- */
var vote = function() {
	//vote action
	var module = function() {
		//click event
		this.addEventListener('click', function() {
			//console.log(this);
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

		agreebar.style.width = agreeRatio + '%';
		disagreebar.style.width = disagreeRatio + '%';

		agreebar.innerHTML = '良い' + agree;
		disagreebar.innerHTML = 'うむ〜' + disagree;

		//console.log(total, agreeRatio, disagreeRatio);
	};

	//render pie chart by D3
	module.renderPie = function(agree, disagree) {
		var list = [agree, disagree];
		var pieChart = document.getElementById('pieChart');
		var pieChartChild = pieChart.parentNode.children[2].firstChild;

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
//end
};

/*-------------- reserve system ------------------ */
//複数のエレメントを一つの関数で制御
//顧客の来店時間、滞在時間などをデータ化しやすい
var reserveSystem = function reserveSystem(stage) {

	var module = {};
	var staffs, shift;
	var reserves = [];
	var reservedTable = {};
	var column, line, blocks, flag,
			interval = 15,
      businessHours = 11,
			reservedColor = 'rgb(203, 203, 203)', noReservedColor = 'transparent';

			staffs = ['fujii', 'yuoko', 'umeki'].length; //３名
			shift = businessHours * (60 / interval) + 1; //15分　×　１１時間

			reservedTable.width = stage.offsetWidth;
			reservedTable.height = stage.offsetHeight;

			line = reservedTable.height / staffs; //スタッフ数
			column = reservedTable.width / shift; //時間幅 * ヘッダー行分の調整

			//剰余で配置ルールを設定
			blocks = staffs * shift;

	//予約クラス
	var Reserve = function Reserve() {
		this.reservedID = '';
		this.id = [];
		this.times = [];
		this.name = '';
		this.no = '';
		this.menu = '';
		this.minutes = this.times.length * interval;
	};

	module.initialize = function initialize(staffs) {
		//フォーム生成　=> テーブル生成　=> データ読み込み　=> スタイル生成
    var callInitialDB = function callInitialDB() {
      inStore({});
    //callInitialD
    };

		var createForm = function createForm() {
			if(!document.getElementById('formUnit')) {
				var formUnit = document.createElement('div');
						formUnit.setAttribute('id', 'formUnit');

				var allClear = document.createElement('button');
						allClear.setAttribute('id', 'reserveDataAllClear');
						allClear.textContent = 'all clear';

				var staff = document.createElement('select');
						staff.setAttribute('name', 'staffs');

				var openTime = document.createElement('select');
						openTime.setAttribute('name', 'openTime');

				var closeTime = document.createElement('select');
						closeTime.setAttribute('name', 'closeTime');

				for(var i=0,n=3;i<n;i++) {
					var option = document.createElement('option');
					var value = i +1;
							option.setAttribute('value', value);
							option.textContent = value + '名';
							staff.appendChild(option);
				}

				var initTime = new Date(1990,12,30,12,00,00);

				for(var i=0,n=(12 * 4); i<n; i++) {
					var time = new Date(initTime.getTime() + 1000 * 60 * interval * i);
					var hour = time.getHours();
					var minutes = time.getMinutes();
					//console.log(time.getHours());
					var option = document.createElement('option');
							option.setAttribute('value', time);
							option.textContent = `${hour}:${minutes}`;

							openTime.appendChild(option);
							//closeTime.appendChild(option);
					}

				for(var i=0,n=(12 * 4); i<n; i++) {
					var time = new Date(initTime.getTime() + 1000 * 60 * interval * i);
					//console.log(time.getHours());
					var option = document.createElement('option');
							option.setAttribute('value', time);
							option.textContent = time.getHours() + ':' + time.getMinutes();

							//openTime.appendChild(option);
							closeTime.appendChild(option);
					}

				allClear.addEventListener('click', function() {

          var _allClear = $.ajax({
            url: '/allClear',
            type: 'GET',
            data: { data: 'allClear'}
          });

          _allClear.done(function(data) {
            console.log(data);
            alert('all clear');

            stage.innerHTML = '';
            module.initialize();
          });

				}, false);

				staff.addEventListener('change', function() {
					//console.log(this.value, reserves);
					stage.innerHTML = '';
					staffs = this.value * 1;

					createGrid(staffs * shift,stage,controler);
					inStore({});
				}, false);

				stage.parentNode.appendChild(formUnit);
				formUnit.parentNode.appendChild(allClear);
				formUnit.parentNode.appendChild(staff);
				formUnit.parentNode.appendChild(openTime);
				formUnit.parentNode.appendChild(closeTime);

			}
		//createForm
		};

		var createGrid = function createGrid(blocks,stage,controler) {

			var date = new Date(1990,12,30,12,00,00);
      var count = 0;
      var staffNames = ['fujii', 'umeki', 'chiba'];
			var block = function block(i,time,controler) {

				var block = document.createElement('div');
						block.setAttribute('id', 'no_' + i);
						block.style.width = column + 'px';
						block.style.height = line + 'px';
						block.style.float = 'left';
						block.style.boxShadow = '0 0 1px gray';
						block.style.fontSize = '0.5rem';
						block.textContent = time.getHours() + ':' + time.getMinutes(); //i % shift;

						block.addEventListener('mousedown', controler, false);
						block.addEventListener('mouseenter', controler, false);
						block.addEventListener('mouseup', controler, false);

						stage.appendChild(block);
			};

			for(var i=0,n=blocks; i<n; i++) {
				var time = new Date(date.getTime() + 1000 * 60 * 15 * (i % shift));

				if(i % shift === 0) {
          var _id = 'head_' + count;
					var head = document.createElement('div');
              head.setAttribute('id', _id);
							head.textContent = (function() {
                return staffNames[count];
              }());
							head.style.width = column + 'px';
							head.style.height = line + 'px';
							head.style.float = 'left';
							head.style.boxShadow = '0 0 1px white';
							head.style.background = 'rgba(0,0,0,0.32)';
							head.style.fontSize = '0.5rem';

							stage.appendChild(head);

							block(i,time,controler);

              setName(document.getElementById(_id));

              count++;

				} else if(i % shift === (shift - 1)) {
					continue;
				} else {
						block(i,time,controler);
				}
			}

      function setName(target) {
        //1,フォームで名前をインプット　=> 2,changeeventで配列のpush => 3,formの値を変更 idをもとに変更。changeevent
        //1,input form は名前欄をクリックで生成する。　promptを使う。 値を配列に上書き。
        target.addEventListener('mousedown', function() {
          /*　promptの立ち上げ　 => 配列変更処理　=> idのvalueを変更(this)　*/
          var oldValue = this.innerHTML;
          var newValue = prompt('名前を入れてください。', '藤井');

          this.innerHTML = newValue;

          for(var i=0,n=staffNames.length;i<n;i++) {

            console.log(staffNames[i] === oldValue);

            if(staffNames[i] === oldValue) {
              staffNames.splice(i, newValue);
              console.log('変更後', staffNames);
            }

          }

          //console.log(this, newValue);
        }, false);

      }
		//createGrid
		};

    var init = new Promise(function(resolve, reject) {
      callInitialDB();
      resolve('ok');
    });

    init.then(function(v) {
      createGrid(blocks,stage,controler);
      resolve(v);
    });

    init.then(function(v) {
      createForm();
      resolve(v);
    });
	//initialize end
	};

	module.initialize();

  //branch event type
	function controler(e) {
		e.preventDefault();
		e.stopPropagation();

		if(e.type === 'mousedown' || e.type === 'touchstart') {
			//console.log('start', grid);
			flag = true;
			reserve = new Reserve();
			branch(e);
		} else if (e.type === 'mouseenter' || e.type === 'touchmove') {
			//console.log('times', grid);
			if(flag) {
				branch(e);
			} else {
				return;
			}

		} else if(e.type === 'mouseup' || e.type === 'touchend') {
			//console.log('end', grid);
			flag = false;
			branch(e);
		}

		function branch(e) {

			if(e.target.style.background !== reservedColor) {

        e.type === 'mouseup' || e.type === 'touchend' ?
        e.target.style.background = noReservedColor : e.target.style.background = reservedColor;

				reserve.times.push(e.target.textContent);
				reserve.id.push(e.target.id);

			} else {

				//e.type === 'mouseup' || e.type === 'touchend' ?
        //e.target.style.background = reservedColor : e.target.style.background = noReservedColor;

				if(e.type === 'mouseup' || e.type === 'touchend') {　popup();　}
        //if(e.type === 'mousedown' || e.type === 'touchstart') {　removeGrid(e.target);　}

				if(e.target.getAttribute('class') === null) console.log('予約ユニット', e.target.getAttribute('class'), '予約時間',e.target.id);

			}
		//branch
		}

  //controler
	}

	/* idがリロードの旅に生成されるので次は違ってしまう。生成順番をidにする。*/
	function removeGrid(removeDOM) {
    //削除確認画面　=>
    console.log('remove', removeDOM);

		//削除確認を挟む
		var RemoveCheckWindow = function RemoveCheckWindow(object) {
			this.object = object;
			this.keyObject = {
				reservedID: '予約番号',
				id: '制御ID',
				times: '予約枠',
				name: '名前',
				no: '会員番号',
				menu: 'メニュー',
				minutes: '時間'
			};
		};

		RemoveCheckWindow.prototype.showData = function showData() {
			console.log(this);
		};

		RemoveCheckWindow.prototype.remove = function remove() {
			console.log(removeDOM); //第二引数を元に配列から削除, 第一引数で不削除の際css変更に使う。
		};

		RemoveCheckWindow.prototype.open = function open() {
				//昭和信用金庫
			var checkWindow = document.createElement('div');
					checkWindow.setAttribute('id','checkWindow');
					checkWindow.style.position = 'absolute';
					checkWindow.style.padding = '0.5rem';
					checkWindow.style.top = '0';
					checkWindow.style.width = '300px';
					checkWindow.style.height = stage.offsetHeight + 'px';
					checkWindow.style.background = 'rgba(0,0,0,.5)';
					checkWindow.style.webkitTransition = '1s ease 0';

			var alertCaution = document.createElement('ul');
					alertCaution.style.fontSize = '0.8rem';
					alertCaution.style.background = 'white';

			var agree = document.createElement('button');
					agree.textContent = 'remove!';

			var disagree = document.createElement('button');
					disagree.textContent = 'not remove!';

			for(var key in this.object) {
				//console.log(this.object[key]);
				var data = document.createTextNode(this.keyObject[key] + ':' + this.object[key]);
				var alertCautionList = document.createElement('li');
						alertCautionList.style.listStyleType = 'none';

						alertCautionList.appendChild(data);
						alertCaution.appendChild(alertCautionList);
			}

			checkWindow.appendChild(alertCaution);
			checkWindow.appendChild(agree);
			checkWindow.appendChild(disagree);
			stage.appendChild(checkWindow);

			check(agree, checkWindow, removeDOM);
			check(disagree, checkWindow, removeDOM);

		};

		function check(target, checkWindow, touchGrid) {
			//クリックしたDOMのclassNAmeとreserves.reservrfIDが一致したら配列からその予約データを削除。
			target.addEventListener('click', remove, false);

			function remove(e) {
				e.stopPropagation();
				e.preventDefault();

				if(target.innerHTML === 'remove!') {  //remove reserve data
					console.log('remove!');
          var _remove = $.ajax({
            url: '/removeReserve',
            type: 'GET',
            data: { data: removeDOM }
          });

          _remove.done(function(data) {
            console.log(data);
            stage.innerHTML = '';
            module.initialize();
          });

				} else {  //not remove reserve data
					console.log('not remove!');
					//console.log(touchGrid.id,removeDOM.getAttribute('class'));
					touchGrid.style.background = reservedColor;
				}

				checkWindow.parentNode.removeChild(checkWindow);
			//remove end
			}
		//check end
		}

		for(var i=0;i<reserves.length;i++) {
			if(removeDOM * 1 === reserves[i].reservedID) {
				//console.log('this ID removing!', reserves[i].reservedID, i);
				if(!document.getElementById('checkWindow')) {
					var removeCheckWindow = new RemoveCheckWindow(reserves[i]);
							removeCheckWindow.open(); //データウィンドウを生成
							removeCheckWindow.showData(); //データオブジェクトをコンソール
							removeCheckWindow.remove(); //agreeした時の処理 => 背景を透明に => localStoragをアップデート。
																					//disagree の時は 背景を元に戻す。 idを利用することで元に戻す。
				}
			}
		}
	//removeGrid end
	}

	function popup() {
		stage.style.position = 'relative';

		var inputWindow = document.createElement('div');
		var no = document.createElement('input');
				no.setAttribute('type', 'text');
				no.setAttribute('placeholder', 'NO.');
				no.setAttribute('size', '5');

		var name = document.createElement('input');
				name.setAttribute('type', 'text');
				name.setAttribute('placeholder', 'NAME');
				name.setAttribute('size', '10');

		var menu = document.createElement('select');
				menu.setAttribute('name', 'menu');

		var menus = ['整体','マッサージ','アロマオイル','ホットストーン'];
		for(var i=0,n=menus.length;i<n;i++) {
			var option = document.createElement('option');
					option.setAttribute('value', menus[i]);
					option.textContent = menus[i];
					menu.appendChild(option);
		}

		var minutes = document.createElement('div');
				minutes.textContent = reserve.times.length * interval;

		var submit = document.createElement('button');
				submit.textContent = '確定';

				stage.appendChild(inputWindow);
				inputWindow.appendChild(no);
				inputWindow.appendChild(name);
				inputWindow.appendChild(menu);
				inputWindow.appendChild(minutes);
				inputWindow.appendChild(submit);

		inputWindow.style.webkitTransition = '0.3s ease 0';
		inputWindow.style.position = 'absolute';
		inputWindow.style.padding = '0.5rem';
		inputWindow.style.top = '0';
		inputWindow.style.width = '200px';
		inputWindow.style.height = '200px';
		inputWindow.style.background = 'rgba(0,0,0,.5)';
		inputWindow.style.color = 'gary';

		minutes.style.color = 'white';

		inputWindow.addEventListener('click', function(e) {
			e.stopPropagation();
		}, false);

		submit.addEventListener('click', function(e) {
      //console.log(e.target);
			e.stopPropagation();
			//e.preventDefault();
			reserve.reservedID = e.timeStamp;
			reserve.no = no.value;
			reserve.name = name.value;
			reserve.menu = menu.value;
			reserve.minutes = reserve.times.length * interval;

      inStore(reserve);

			inputWindow.parentNode.removeChild(inputWindow);

		}, false);
	//popup
	}

  function inStore(reserveData) {
    console.log('request type', reserveData);
    var _reserved = $.ajax({
      url: '/inStore',
      type: 'GET',
      data:reserveData
    });

    _reserved.done(function(data) {
      //response
      console.log('response type', data);
      isReservedStyle(data);

      //local push
      reserves = data;
      console.log('格納配列', reserves);
    });

    //paint color & set tag
  	function isReservedStyle(arr) {
      console.log('style', arr);
  		for(var i=0,n=arr.length;i<n;i++) {
  			for(var j=0,m=arr[i].id.length;j<m;j++) {
  				var reservedGrid = document.getElementById(arr[i].id[j]);
          //console.log(arr[i].id, arr[i].id[j]);
  				reservedGrid.style.background = reservedColor;
  				reservedGrid.setAttribute('class', arr[i].reservedID);

  				if(j === m -1) {
            //console.log(arr[i], arr[i].id[j]);
  					reservedTag(arr[i], arr[i].id[j]);
  				}
  			}
  		}
  	//isReservedStyle end
  	}

    function reservedTag(arr, id) {
      console.log('tag', arr, arr.id.length);
      var no = arr.no || '_',
          name = arr.name || '_' ,
          menu = arr.menu ,
          minutes = arr.minutes,
          appendedDOM = document.getElementById(id);

      var tag = document.createElement('div');
          tag.textContent = 'No.' + no + ':' + name + ':' + menu + minutes;
          tag.style.position = 'relative';
          tag.style.margin = '0 0 0 -' + (arr.id.length - 1) * 82 + '%';
          tag.style.padding = '0.2rem';
          tag.style.width = arr.id.length * 64 + '%';
          tag.style.height = '1rem';
          tag.style.color = 'black';
          tag.style.background = 'white';

      var rmTag = document.createElement('div');
          rmTag.setAttribute('id', no + menu);
          rmTag.style.position = 'absolute';
          rmTag.style.left = rmTag.style.top = '-0.5rem';
          rmTag.style.width = rmTag.style.height = '1rem';
          rmTag.style.background = 'red';
          rmTag.style.borderRadius = '100%';

          //console.log(appendedDOM.childNodes.length);
          tag.appendChild(rmTag);
          if(appendedDOM.childNodes.length < 2)　appendedDOM.appendChild(tag);
          //console.log('reservedTag',appendedDOM, no ,name ,minutes);
      rmTag.parentNode.addEventListener('click', function(e) {
        e.stopPropagation();
        e.preventDefault();
      }, false);

      rmTag.addEventListener('click', function(e){
        e.stopPropagation();
        console.log(this.parentNode.parentNode.getAttribute('class'));
        removeGrid(this.parentNode.parentNode.getAttribute('class'));

        console.log('remove!', arr);
      },false);
    //reservedTag
    }

  };

	return module;
//end
};

/*-------------- customer page ------------------- */
//calenderを呼び出す。　サーバーの空き状況をjsonで返す。 それを元に calender画面の生成。
//管理画面であらかじめ空き時間を設定する。　日付と部屋数のテーブルを生成。　空き枠管理　予約状況確認　在庫登録
//login処理後管理画面の再呼び出しをする。　ajax
//progress 予約進捗を表示
var reserveSystem2 = function reserveSystem2(stage) {

  var calendar = document.createElement('section');
  var call_admin = document.createElement('button');
  var progress = document.createElement('section');
  var progress_body = document.createElement('div');
  var progress_tab = document.createElement('div');

  stage.appendChild(calendar);
  progress.appendChild(progress_body);
  progress.appendChild(progress_tab);

  stage.parentNode.appendChild(call_admin);
  stage.parentNode.appendChild(progress);

  stage.style.height = '500px';
  stage.style.boxShadow = '0 0 0 transparent';
  stage.style.overflow = 'hidden';

  //予約カレンダー
  calendar.style.width = `${stage.offsetWidth - 0.5}px`;
  calendar.style.height = `${stage.offsetHeight}px`;
  calendar.style.float = 'left';
  calendar.style.background = 'white';
  calendar.style.borderBottom = '1px solid gray';

  call_admin.textContent = '管理画面';

  //進捗表示
  var pww = 300,pwh = 300,pwp = 0;

  progress.style.padding = `${pwp}px`;
  progress.style.width = `${pww - pwp * 2}px`;
  progress.style.height = `${stage.offsetHeight}px`;
  progress.style.top = `${stage.offsetTop}px`;
  progress.style.left = `${stage.offsetLeft + stage.offsetWidth - pww}px`;
  progress.style.position = 'absolute';
  progress.style.boxShadow = '0 0 1px gray';
  //progress.style.background = 'rgba(255, 248, 227, 0.43)';

  progress_body.style.background = 'rgba(255, 255, 255)';
  progress_body.id = 'progress_body';

  /* to client  */
  var calendar_module = function calendar_module(stage) {
    var this_month = [], next_month = [], prev_month = [], months = [];
    var days = ['日','月','火','水','木','金','土'],
        today = new Date(),
        day;
    var ids = [];

    //adjust first day in this Month 月初の日付からカレンダーを生成。
    console.log(today.getDate(),today.getDate() !== 1);
    if(today.getDate() !== 0) {
      day = today.getTime() - today.getDate() * 1000 * 60 * 60 * 24;
      day = new Date(day);
    } else {
      day = today.getTime();
      day = new Date(day);
    }

    //データ加工とカレンダー生成　controller
    (function create_data() {

      day = day.getTime();
      day += 1000 * 60 * 60 *24;
      day = new Date(day);

      new Promise(function(resolve,reject) {
        //to Array カレンダーデータ整形
        if(day.getMonth() === today.getMonth()) {

          this_month.push(day);
          create_data();

        } else if(day.getMonth() === 0 || today.getMonth() + 1 === day.getMonth()){

          next_month.push(day);
          create_data();

        } else {

          resolve('ok');
        }

      }).then(function(v) {
        //to view function　ビジュアライズ
        months.push(days.concat(this_month),days.concat(next_month));
        visualize(45,1);

        console.log(months);

      }).catch(function(reject) {
        console.log(reject);
      });

    }());

    //カレンダービジュアル化　---------   visualize calendar
    function visualize(blockSize, blockMargin) {

      for(var j=0,m=months.length;j<m;j++) {

        var calendar = document.createElement('section');
        var calendar_title = document.createElement('div');

        stage.appendChild(calendar);
        calendar.appendChild(calendar_title);

        calendar.style.width = `${(blockSize + blockMargin) * 8}px`;
        calendar.style.height = `${(blockSize + blockMargin) * 9}px`;
        calendar.classList.add('calendar');

        for(var i=0,n=months[j].length;i<n;i++) {

          var block = document.createElement('div');
          var block_head = document.createElement('div');

          block.appendChild(block_head);

          block.style.width = block.style.height = `${blockSize}px`;
          block.style.margin = `${blockMargin}px`;
          block.style.padding = 0;
          block.style.float = 'left';

          block_head.style.width = `${blockSize}px`;
          block_head.style.height = block_head.style.lineHeight = `${blockSize * 0.4}px`;
          block_head.style.textAlign = 'center';

          //ヘッダー行　月、火、水....
          if(typeof months[j][i] === 'string') {

            block.textContent = months[j][i];
            block.classList.add('calendar_header');

          //日付行
          } else {

            /* -------- style -------------- */
            //月タイトル
            if(i === n - 1) calendar_title.textContent = `${months[j][i].getMonth() + 1}月`;

            //月初の左マージン
            if(i === 7) block.style.marginLeft = `${(blockSize + blockMargin * 2) * months[j][i].getDay()}px`;

            block_head.textContent = months[j][i].getDate(); //曜日　days[months[j][i].getDay()] +
            block.setAttribute('id', `${months[j][i].getFullYear()}_${months[j][i].getMonth() + 1}_${months[j][i].getDate()}`);
            console.log(months[j][i].getMonth() + 1);

            //日曜日のスタイル //他の曜日のスタイル
            months[j][i].getDay() === 0 ? block_head.classList.add('sun') : block_head.classList.add('other');

            //本日のスタイル
            var today_check = new Date(months[j][i]).getMonth().toString() + new Date(months[j][i]).getDate().toString() === today.getMonth().toString() + today.getDate().toString();
            if(today_check) block_head.style.background = 'rgba(11, 175, 245, 0.71)';

            //空き枠表示を追加
            var stock = document.createElement('div');
                stock.classList.add('stock_c');

                stock.style.width = `${blockSize}px`;
                stock.style.height = stock.style.lineHeight = `${blockSize * 0.6 }px`;

                block.appendChild(stock);

            /* --------- data ---------------- */

            //for server push data
            var id = `${months[j][i].getFullYear()}_${months[j][i].getMonth() + 1}_${months[j][i].getDate()}`;
            ids.push(id);

            //idsをサーバーに一括送信してデータベースに格納する。
            if(j === m -1 && i === n - 1) { get_reserve_data(ids); }

            get_info(block);
          }

          calendar.appendChild(block);

        }
      }
    }

    //初期データを取得　-------- get server data
    function get_reserve_data(id_array) {
      //console.log(id_array);
      var get_reserve_data = $.ajax({
        url:'/reserveSystem2/admin/get_reserve',
        type: 'GET',
        data: { reserve_id: id_array }
      });

      get_reserve_data.done(function(data) {
        //枠数反映
        realtime_block_count(data);
      });
    }

    //予約数をdivに挿入
    function realtime_block_count(d) {
      //console.log(d);
      for(var i=0,n=d.length;i<n;i++) {

        var bn = document.getElementById(d[i].reserve_id).children[1];
        d[i].reserve_nums === undefined ? bn.innerHTML = '' : bn.innerHTML = d[i].reserve_nums;

      }
    }

    //日付DOMからデータを取得　----- get infomation from day dom block
    function get_info(dom) {
      dom.addEventListener('mousedown', get, false);
      function get(e) {
        //e.preventDefault();
        e.stopPropagation();
        tooltip(this);
        progress_body.innerHTML = '';
      }
    }

    //予約数を決める　------ open change window
    function tooltip(dom) {
      //console.log(dom.id, dom.children[1].innerHTML);
      var id = dom.id;
      var num = dom.children[1].innerHTML;
      var date = dom.children[0].innerHTML

      if(!document.getElementById('info_window') && num > 0) {

        var html = `<div class="form_head">${date}日の予約</div>
                    <div class="form_data">予約ID：<input id="reserve_id" type="text" value="${id}" size="10" disabled></div>
                    <div class="form_data">枠数：<input id="reserve_nums" type="text" value="${num}" size="10"></div>
                    <div class="form_data"><input type="button" value="枠数確定" id="decide_date"><input type="button" value="キャンセル" id="cancel_date"></div>`;

        var info_window = document.createElement('div');
            info_window.setAttribute('id', 'info_window');

            //dom.appendChild(info_window);
            progress.appendChild(info_window);

            //style
            info_window.style.width = info_window.style.height = '100%';
            info_window.style.background = 'white';
            info_window.style.color = 'gray';
            info_window.style.boxShadow = '0 0 1px black';

            console.log(info_window);

            info_window.innerHTML = html;

            //stopPropagation　バブリングブロック
            info_window.addEventListener('mousedown', function(e) {　e.stopPropagation();　}, false);

            console.log(push_data);

            //insert db データベースに送信
            push_data.check_data(document.getElementById('decide_date'), document.getElementById('cancel_date'), document.getElementById('reserve_nums'), document.getElementById('reserve_id'),dom);

      } else if(num > 0){

        document.getElementById('info_window').parentNode.removeChild(document.getElementById('info_window'));

      } else {
        alert('ごめんね');
      }

    }

    //サーバーへデータを送るモジュール
    var push_data = function push_data() {
      var module = {};
          module.reserve = {};
          module.customer = {};

      //予約枠数データ更新　------- push server
      module.check_data = function check_data(submit,cancel,nums,id,dom) {
        module.reserve.reserve_id = id.value;
        module.reserve.reserve_nums = nums.value;

        //データベースへpush
        submit.addEventListener('mousedown', controller, false);
        cancel.addEventListener('mousedown', controller, false);

        function controller() {

          document.getElementById('info_window').parentNode.removeChild(document.getElementById('info_window'));

          document.getElementById('modal').innerHTML = '';

          if(this.id === 'decide_date') to_progress(dom);

        }

      }

      //予約情報を確認画面にプールする。
      function to_progress(dom) {

        var num = module.reserve.reserve_nums;
        var id = module.reserve.reserve_id;

        //reserve sustomer を紐付ける //利用履歴を参照する際にidで引っ張り出せる。
        //メンバー一意のナンバーはマングースで自動生成する_idを使う。
        //リターンする際に番号を通知。　mailで会員なんばーを返信。
        //maito module　を挟む サーバー側で。
        module.customer.id = module.reserve.reserve_id;

        progress_body.innerHTML = `<div class="form_head">確認画面</div>
                                  <div class="form_data">${id.split('_')[1]}月${id.split('_')[2]}日</div>
                                  <div class="form_data">予約数 ${num} </div><div class="form_data">予約枠ID ${id}</div>`;

        progress_tab.innerHTML = `<div class="form_data"><button id="login_cancel">戻る</button><button id="login">次</button></div>`;

        document.getElementById('login').addEventListener('mousedown',open_panel_in_customer, false);
        document.getElementById('login_cancel').addEventListener('mousedown',open_panel_in_customer, false);

        //会員情報を確認する。
        //会員であれば認証するして確認画面を立ち上げてメーラーを立ち上げる。　情報プールに挿入して確定する。
        //非会員であれば情報入力画面の立ち上げ、確認画面を立ち上げて確定ボタンを押す。　情報プールにデータを挿入して確定する。

        function open_panel_in_customer() {
          //console.log('customer data', data);
          var flag = true;
          var modal = document.getElementById('modal');
          var modal_inner = document.createElement('div');

          if(this.id === 'login_cancel') {
            progress_body.innerHTML = progress_tab.innerHTML = '';
            flag = false;
          }

          //modal open
          modal_controller(flag, modal, modal_inner);
          modal_html(flag);

          //リザーブデータと顧客情報紐付けて渡す。サーバーで顧客情報とレザーブデータをつなぎ合わせる。
          //サーバーで二つのデータベースを常に紐付けてクライアントに返す。

          function modal_html(f) {
            var html = `<h2>顧客情報</h2>
                        <div>予約ID:${module.reserve.reserve_id}<u>データの受け渡し。</u></div>
                        <div>名前<input type="text" placeholder="山田　貴之" id="name" class="customer_data"></div>
                        <div>フリガナ<input type="text" placeholder="ヤマダ　タカユキ" id="ruby" class="customer_data"></div>
                        <div>郵便番号<input type="text" placeholder="123-4567" id="post_no" class="customer_data"></div>
                        <div>住所<input type="text" placeholder="東京都渋谷区０−０−０" id="address" class="customer_data"></div>
                        <div>電話番号<input type="text" placeholder="080-0000-0000" id="tel" class="customer_data"></div>
                        <button id="to_info_win">確認</button>`;

            modal_inner.innerHTML = html;

            //get form data
            document.getElementById('name').addEventListener('change', get_value, false);
            document.getElementById('ruby').addEventListener('change', get_value, false);
            document.getElementById('post_no').addEventListener('change', get_value, false);
            document.getElementById('address').addEventListener('change', get_value, false);
            document.getElementById('tel').addEventListener('change', get_value, false);

            //modal close
            document.getElementById('to_info_win').addEventListener('mousedown', close, false);

          }

          function get_value() {　module.customer[this.id] = this.value;　}

          function close() {
            flag = false;
            modal_controller(flag, modal, modal_inner);
            modal_html(flag);

            progress_body.innerHTML += `<div class="form_data">名前：${module.customer.name}</div><div class="form_data">フリガナ：${module.customer.ruby}</div>
                                        <div class="form_data">郵便番号：${module.customer.post_no}</div><div class="form_data">住所：${module.customer.address}</div>
                                        <div class="form_data">電話番号：${module.customer.tel}</div>`;

            progress_tab.innerHTML = `<button id="decide">決定</button><button id="cancel_decide">キャンセル</button>`;

            document.getElementById('decide').addEventListener('mousedown', send_data, false);

            document.getElementById('cancel_decide').addEventListener('mousedown', send_data, false);

            modal_inner.innerHTML = '';

            console.log(module);

          }

          function send_data() {

            if(this.id === 'decide') push_db(module.reserve, module.customer);
            progress_body.innerHTML = progress_tab.innerHTML = '';

          }
        }
      }

      return module;
    }();

    function push_db(reserve_obj, customer_obj) {
      //ajaxでデータ送信
      console.log('server push',reserve_obj,customer_obj);

      var push_reserve_data = $.ajax({
        url: '/reserveSystem2/admin/check_reserve',
        type: 'GET',
        data: { reserve_obj, customer_obj }
      });

      push_reserve_data.done(function(data) {
        console.log(data);
        //枠数反映
        realtime_block_count(data);

      });
    }
    //end
  }(calendar);

  /* to admin -------- 管理画面呼び出し　------ */
  //管理画面おスクリプト ----------- >>> index2.js
  call_admin.addEventListener('mousedown', open_admin, false);

  function open_admin() {
      window.open('/reserveSystem2/admin','admin');
      document.addEventListener('DOMContentLoaded', function() {console.log('loaded');}, false);
  }
//end
};

/* ------------ stock data visualize  ----------- */
var stock = function stock() {
  //console.log('stock');
  new Promise(function(resolve, reject) {
    var popup = document.createElement('div');
    var html = `<!--　取得　-->
      <section id="dataInput">
      <input type="text" name="ticker_no" value="" placeholder="証券コード" id="ticker_no">
      <input type="submit" name="send_ticker_no" value="データ収集" id="send_ticker_no">
      </section>`;

      var option = {};
          option.type = 'slide';
          option.bg = 'rgba(0,0,0,0.08)';
          option.w = 200;
          option.h = 100;

    popWindow(document.getElementById('addFinanceData'), popup, html, option);

    resolve('ok');
  }).then(function (v) {
    document.getElementById('send_ticker_no').addEventListener('click', getFinanceData, false);

    function getFinanceData() {
      var stock = $.ajax({
        url: '/stock/getFinanceData',
        type: 'GET',
        data: { ticker_no: document.getElementById('ticker_no').value}
      });

      stock.done(function(data) {
        console.log(data);
      });
    }
  });

  new Promise(function(resolve, reject) {
    var popup = document.createElement('div');
    var html = 	`<input type="text" name="ticker" value="" placeholder="証券コード" id="input">
    						<select name="keyName" size="1" id="select">
    							<option value="売上高">売上高</option>
    							<option value="営業利益">営業利益</option>
    							<option value="経常利益">経常利益</option>
    							<option value="当期利益">当期利益</option>
    							<option value="自己資本比率">自己資本比率</option>
    							<option value="ROA（総資産利益率）">ROA（総資産利益率）</option>
    							<option value="ROE（自己資本利益率）">ROE（自己資本利益率）</option>
    							<option value="総資産経常利益率">総資産経常利益率</option>
    							<option value="EPS（一株当たり利益) ">EPS（一株当たり利益) </option>
    							<option value="BPS（一株当たり純資産）">BPS（一株当たり純資産）</option>
    							<option value="有利子負債">有利子負債</option>
    							<option value="自己資本">自己資本</option>
    						</select>`;

      var option = {};
          option.type = 'slide';
          option.bg = 'rgba(0,0,0,0.08)';
          option.w = option.h = 200;

    popWindow(document.getElementById('visualize'), popup, html, option);

    resolve('ok');
  }).then(function(v) {
    //d3
    document.getElementById('select').addEventListener('change',visualize, false);
    document.getElementById('input').addEventListener('change',visualize, false);
  });

  function visualize() {
    var ticker = document.getElementById('input').value;
    var manageIndex = document.getElementById('select').value;
    var url = '/stock/' + ticker;

    var chart = $.ajax({
      url: url,
      type: 'GET',
      dataType: 'json'
    });

    chart.done(function(data) {
      console.log(data);
      var keyArray = [];
        for(var key in data[0]) {
          if(/%/.test(data[0][key])) {
            keyArray.push(key);
          }
        }

      var dataSet = mainDataController(data,manageIndex);
      console.log(dataSet, manageIndex, keyArray);
      keyArray.indexOf(manageIndex) == -1 ? BarChart(dataSet) : circle(dataSet);
    });

    chart.fail(function(data) {
      alert('会社データはありません');
      console.log('err');
    });
    }


  /* 描画前のデータ成形 */
  function mainDataController(array,title) {
      //console.log(array[0]);
      var dataObject = [];
      var company = array[0]['会社名'];
      var dataSet = [];//D３用データ配
      var settlement = [];//決算期
      var Title = title;//ROE、売上高など
      var unit;//単位

        //console.log(array);
      for (var i = 0; i < array.length; i++) {
        dataSet.push(array[i][Title]);
        settlement.push(array[i]['決算期']);
      }

      settlement = settlementCharChange(settlement);//月　→　／
        //console.log(dataSet);
      dataSet = StringToNumber(dataSet);
        //console.log(dataSet);
      unit = unitCalc(dataSet);
      dataSet = cutCharactors(dataSet);
        //console.log(dataSet);
      dataObject.push(dataSet.sort(),settlement.sort(),Title,unit,company);//データ、決算期タイトル、指標（ROE..)、グラフの単位
        //console.log(dataObject);
      return dataObject;
    }

  function settlementCharChange(array) {
      var newArray = [];
      var str = '年';
      var str2 = '月期';
      for(var i=0,n=array.length;i<n;i++) {
        array[i] = array[i].replace(str,'/');
        array[i] = array[i].replace(str2,'');
        newArray.push(array[i]);
      }
      return newArray;
    }

  //配列をオブジェクトに格納する 参照渡し　二重for文
  /* [ [ '売上高','営業利益' ],[ '443,985百万円','31,794百万円'],[ '419,390百万円','24,564百万円'],[ '392,468百万円','22,009百万円'] ] => [ {'売上高': '443,985百万円','営業利益': '31,794百万円'},{ '売上高': '419,390百万円','営業利益': '24,564百万円'},{ '売上高': '392,468百万円','営業利益': '22,009百万円'} ] */
  function ArrayToJson(array) {
      var jsons = [];
      for(var i=1;i< array.length;i++) {//最初の列は不要なので初期値iは1
        var json = {};//ループのたびに新しいJSONを生成 参照渡しを回避
        for(var j=0;j<array[i].length;j++) {
          json[array[0][j]] = array[i][j];
        }
        jsons.push(json);
      }
      return jsons;
    }

  //文字列を整数に
  function StringToNumber(array) {
      //console.log(array);
      var newData = [];
      var regexp =  /百万円|%|,/gi;
      for(var i=0; i< array.length; i++) {
        //console.log(array[i].replace(regexp,''));
        newData.push(parseFloat(array[i].replace(regexp,'')));
        }
      console.log(newData);
      return  newData;
      }

  //桁数を整える スクロールしないで見るための処理
  function cutCharactors(array) {
      //console.log(array);
      var newArray = [];
      var maxChar = Math.max.apply(null, array);//配列の最大値
      var characters = comma(maxChar.toString());//小数点が含まれる場合の桁数調整
      var adjustCharacters = characters - 3;//桁詰め数
      //console.log('調整桁数 : ' + adjustCharacters);
      for(var i=0,n=array.length;i<n;i++) {
        array[i] = array[i] * Math.pow(0.1,adjustCharacters);
        newArray.push(array[i]);
      }
      return  newArray;
    }
  //単位の算出
  function unitCalc(array) {
      var charNum;
      var unit;
      var maxChar = Math.max.apply(null, array);//配列の最大値
      var characters = comma(maxChar.toString());
      console.log(characters);
      characters > 3 ? unit = unitToFigure((Math.pow(10,characters - 3))) : unit = unitToFigure(0);
      return unit;
    }

  function unitToFigure(unit) {
    var figure;
    if(unit >= 100000) {
      figure = '千億円';
    } else if(unit >= 1000 && unit < 100000) {
      figure = '十億円';
    } else if(unit < 1000) {
      figure = '百万円';
    }
    return figure;
  }

  //小数点以下の桁数を取得
  function comma(str) {
        var numCharacters;
        var regexp = '.';
        var num = str.length;//全桁数
        if(str.indexOf(regexp) == -1) {
          numCharacters = num;
        } else {
          var integer = str.split(regexp)[0].length;
          //var smallNum = str.split(regexp)[1].length;//小数点以下の桁数
          numCharacters = num - (num - integer);
        }
        return numCharacters;
      }

  /* 描画 */
  function BarChart(dataObject) {
        console.log(dataObject);
        var dataSet = dataObject[0];
        var settlement = dataObject[1];
        var title = dataObject[2];
        var unit = dataObject[3];
        var company = dataObject[4];
        var yPosition =[];

        var barWidth = 20;
        var offsetx = 30;
        var offsety = 20;
        var titleLength = 100;
        var titleHeight = 100;//svgのpadding-top
        var dataHieght = Math.max.apply(null, dataSet);

        console.log(dataSet,settlement);

        //グラフ生成
        var Bar = d3.select('#data')
              .append('svg')
              .attr({
                x:0,
                y:0,
                width:dataSet.length * 80,
                height:dataHieght + titleHeight + offsety * 2,
                class: 'graph'
              });
              /*.on({
                "mousedown":function(){
                  console.log(d3.select(this)[0]);
                  d3.select(this).attr("opacity",0.7);},
                  "mouseup":function(){d3.select(this).attr("opacity",1.0);}
                })*/

          Bar.selectAll('rect')
            .data(dataSet)
            .enter()
            .append('rect')
            .attr({
              x:function(d, i) {
                return i * barWidth * 1.2;
              },
              y: dataHieght,
              width: barWidth,
              height: 0,
              transform: `translate(${barWidth * 2},${titleHeight})`,
              class: 'rect'
            })
            .transition()
            .ease('cubic')
            .attr({
              y: function(d, i) {
                return d < 0 ? dataHieght : dataHieght - d;
              },
              height: function(d, i) {
                return d < 0 ? -d : d;
              },
              fill: function(d, i) {
                return d < 0 ? 'blue' : 'red';
              },
              class:'hoge'
            });

          Bar.selectAll('text')
            .data(dataSet)
            .enter()
            .append('text')
            .text(function(d,i) {
               return d < 0 ? parseInt(-d) : parseInt(d);
            })
            .attr({
              x:function(d,i) {
                return i * barWidth * 1.2;
              },
              y: function(d,i) {
                yPosition.push(d);
                return d < 0 ? dataHieght+ titleHeight + offsety : dataHieght + titleHeight - d + offsety;
              },
              fill: function(d,i) {
                return 'white';
              },
              'font-size': barWidth * 0.5,
              transform: `translate(${barWidth * 2}, 0)`
            });

          Bar.selectAll('settlement')
            .data(settlement)
            .enter()
            .append('text')
            .attr({
              x:function(d,i) {
                return i * barWidth * 1.2 + 50;
              },
              y:function(d,i) {
                return dataHieght + titleHeight - yPosition[i] + 30;
              },
              textLength: titleLength,
              fill:'white',
              'font-size': '20',
              'writing-mode': "tb-rl",
              'glyph-orientation-vertical': 'auto',
              'glyph-orientation-vertical': '90',
              transform: `translate(${barWidth},0)`,
              transform: 'rotate(90deg)'})
            .text(function(d,i) {
              return d;
            });

          Bar.append('text')
            .attr({
              fill: 'none',
            })
            .transition(1000)
            .delay(1000)
            .attr({
              x:0,
              y:60,
              height: '30px',
              width: dataSet.length * 80,
              fill: 'black',
              transform: `translate(${barWidth *1.2}, 0)`})
            .transition(1000)
            .attr({
              transform: `translate(${barWidth}, 0)`,
              transform: 'scale(.6)'})
            .text(title);

          //if(!$('#title').text() || $('#title').children().length == 1) {
          Bar.append('text')
            .attr({
              x:0,
              y:32,
              height: '30px',
              width: '140px',
              fill: 'gray',
              transform: 'scale(.6)'})
            .text(company);
          //}

          var Yscale = d3.scale.linear()
            .domain([ dataHieght, 0])
            .range([ 0, dataHieght ]);

          Bar.append('g')
            .attr({
                x: 0,
                y: dataHieght
            })
            .attr({
              'class': 'axis',
              transform: `translate(32,${titleHeight})`})
            .call(d3.svg.axis()
              .scale(Yscale)
              .orient('left')
              .ticks(4)
            )
            .append('text')
            .attr({
              'font-size': 8,
              transform: 'translate(-30, -10)'})
            .text(unit)
            .attr({
              x:0,
              y:function(d,i) {
                //すべての数値がマイナスの時だけ配置を変える
                for(var j=0,n=dataSet.length;j<n;j++) {
                  if(dataSet[j] > 0) {return 0;}
                }
                return dataHieght;
              }
            });

          erase(Bar,dataSet);
        }

  //グラフ削除
  function erase(svg,array) {

    document.getElementById('erase').addEventListener('click',function() {
      svg.append('text')
      .attr({
        x:array.length * 60,
        y:24,
        height: '30px',
        width: '30px',
        fill: 'gray',
        transform: 'scale(1)',
        class: 'close'
      })
      .text('✖️');
      $('.close').on('click', function() {
        //console.log('close');
        $(this).parent().remove();
        $('.close').remove();
        });
    },false);
  }

  function cPositon(i,array) {//i: 描画順, array: 描画要素のすべてを取得
    //console.log(i,array);
    var r,padding = 10;
    r = array[i];
    //console.log(r);
    if(i == 1) { r +=array[i-1] * 2 + padding;}
    if(i == 2) { r +=array[i-1] * 2 + array[i-2] * 2 +padding * 2;}
    if(i == 3) { r +=array[i-1] * 2 + array[i-2] * 2 + array[i-3] * 2 + padding * 3;}
    return r;
  }

  //create circle graph
  function circle(array) {
    console.log(array);
    var title = array[2];
    var company = array[4];
    var dataSet = [];
    var settlement = [];//決算期
    var maxElement;//配列の最大値 最大円の半径
    var Scale = 0.5;//描画倍率
    var fontSize = 10;
    var textPositionX = [];
    var textPositionY = [];
    maxElement = Math.max.apply(null, array[0]);
    //console.log(maxElement);
    //最大値を100pxに抑える　比率計算する。
    if(maxElement > 100) {
      Scale = 100 / maxElement;
      maxElement = 100;
    }
    for (var i = 0; i < array[0].length; i++) {
      dataSet.push(array[0][i] * Scale);
    }
    for (var j = 0; j < array[1].length; j++) {
      settlement.push(array[1][j]);
    }
    //console.log(dataSet,settlement);
    var circle = d3.select('#data')
          .append('svg')
          .attr({
            x:0,
            y:0,
            width:dataSet.length * maxElement * 2,
            height:maxElement * 2 * 1.1,
            class:'graph'
          });
      circle.selectAll('circle')
        .data(dataSet)
        .enter()
        .append('circle')
        .attr({
          cx: function(d,i) {
            return cPositon(i,dataSet);
          },
          cy: function(d,i) {
            return maxElement + (maxElement -d);
          },
          r: 0
        })
        .transition()
        .ease('cubic')
        .attr({
          cx: function(d,i) {
            return cPositon(i,dataSet);
          },
          cy: function(d,i) {
            return maxElement + (maxElement -d);
          },
          r: function(d, i) {
            return d ;
          },
          fill: 'rgba(0,0,0,.32)'
        });
      circle.selectAll('text')
        .data(dataSet)
        .enter()
        .append('text')
        .text(function(d,i) {
          return (d * 0.1).toFixed(2) + '%';
        })
        .attr({
          x: function(d,i) {
            //textPositionY.push(maxElement + i * maxElement * 2 - d *.3);
            return cPositon(i,dataSet);
          },
          y: function(d,i) {
            textPositionY.push(maxElement + (maxElement -d));
            return (maxElement + (maxElement -d)).toFixed();
          },
          'font-size': fontSize,
          fill: 'white'
        });
      circle.selectAll('settlement')
        .data(settlement)
        .enter()
        .append('text')
        .attr({
          x: function(d, i) {
            return cPositon(i,dataSet);
          },
          y: function(d,i) {
            return textPositionY[i] - fontSize;
          },
          fill:'white',
          stroke: 'gray',
          'font-weight': 'bold',
          'font-size': 9,
          'stroke-width': 0.2
        })
        .text(function(d, i) {
          return d;
        });
      circle.append('text')
        .transition(1000)
        .delay(1000)
        .attr({
          x:0,
          y:0,
          height: 30,
          width: 140,
          fill: 'gray',
          'font-size': fontSize,
          transform: `translate(0,${fontSize * 2})`
        })
        .text(title);
      circle.append('text')
        .transition(1000)
        .delay(800)
        .attr({
          x:0,
          y:0,
          height: 30,
          width: 140,
          fill: 'gray',
          'font-size': fontSize,
          transform: `translate(0,${fontSize })`
        })
        .text(company);
        erase(circle,dataSet);
    }
//end
};

/* --------  UI modules ------------------------ */
var ui = function ui() {

  /* --------  apple TV ui module  ------------- */
  //三層レイヤーにして奥行きを出す。

  //ボタンデータ　スタイルとイージングを渡す。
  var Tvui = function Tvui(button,w,h,rs,ts,bg,color) {

    this.button = button;
    this.w = w; //button width
    this.h = h; //button height
    this.rs = rs; //rs is rotate sensitivity
    this.ts = ts; //ts is translate sensitivity
    this.bg = bg; //bg is button background
    this.color = color; //color is button font color

  };

  var tvui = function tvui(option) {

    var w = option.w || '150px';
    var h = option.h || '100px';
    var rs = option.rs || 0.15;
    var ts = option.ts || 0.02;
    var bg = option.bg || 'red';
    var color = option.color || 'gray';

    //base layer 画像
    var tvui = option.button;
        tvui.style.width = w;
        tvui.style.height = h;
        if(/.(jpg|png|gif|svg)$/.test(bg)) {
          tvui.style.background = `url(${bg})`; //画像
        } else {
          tvui.style.background = bg; //べた塗り
        }
        tvui.style.borderRadius = '4px';
        tvui.style.boxShadow = '0 0 2px black';
        tvui.style.float = 'left';
        tvui.style.margin = '0 0 0 1rem';

    //second layer 光の具合
    var front_layer = document.createElement('div');
        front_layer.style.width = front_layer.style.height = '100%';
        front_layer.style.lineHeight = tvui.style.height;
        front_layer.style.background = 'rgba(255,255,255,0.16)';

    //third layer アプリ名
    var app_name = document.createElement('div');
        app_name.style.width = app_name.style.height = '100%';
        app_name.style.lineHeight = tvui.style.height;
        app_name.style.fontSize = '2rem';
        app_name.style.textAlign = 'center';
        app_name.style.color = color;
        app_name.style.textShadow = '0 0 4px 3px black';
        app_name.textContent = 'front layer';

    tvui.appendChild(front_layer);
    front_layer.appendChild(app_name);

    //active
    tvui.addEventListener('mouseenter', function(e) {
      tvui.addEventListener('mousemove', enter , false);
    }, false);

    //Leave
    tvui.addEventListener('mouseleave', leave, false);

    //click
    tvui.addEventListener('mousedown', change_backimage, false);

    function enter(e) {
      //console.log(this.offsetWidth, this.offsetHeight);
      //センターを0に設定する
      //コーナーをセンタから導き出す。
      //結果的にratioにマイナスとプラスが生まれる。
      var centerX = this.offsetWidth / 2,
          centerY = this.offsetHeight /　2;

      var currentPointX = e.pageX - this.offsetLeft,
          currentPointY = e.pageY - this.offsetTop;

      var ulcornerX = 0,
          ulcornerY = 0,
          urcornerX = this.offsetWidth,
          urcornerY = 0,
          blcornerX = 0,
          blcornerY = this.offsetHeight ,
          brcornerX = this.offsetWidth,
          brcornerY = this.offsetHeight;

      var right_bottom = currentPointX > centerX && currentPointY > centerY,
          right_top = currentPointX > centerX && currentPointY < centerY,
          left_bottom = currentPointX < centerX && currentPointY > centerY,
          left_top = currentPointX < centerX && currentPointY < centerY;

      if(right_bottom) {
        ratio(brcornerX,brcornerY);
        //console.log('右下');
      } else if(right_top) {
        ratio(urcornerX,urcornerY);
        //console.log('右上');
      } else if(left_bottom) {
        ratio(blcornerX,blcornerY);
        //console.log('左下');
      } else if(left_top) {
        ratio(ulcornerX,ulcornerY);
        //console.log('左上');
      }

      function ratio(x,y) {
        var rotate_sensitivity = rs,
            translate_sensitivity = ts;

        var center_corner_distance_x = x - centerX,
            center_corner_distance_y = y - centerY;

        var center_current_distance_x = currentPointX - centerX,
            center_current_distance_y = currentPointY - centerY;

        var center_current_distance_ratio_x = center_current_distance_x / center_corner_distance_x;;
        var center_current_distance_ratio_y = center_current_distance_y / center_corner_distance_y;

        if(center_current_distance_x > 0 && center_corner_distance_y > 0) {
          //右下
          center_current_distance_ratio_x = center_current_distance_ratio_x
          center_current_distance_ratio_y = center_current_distance_ratio_y;

        } else if(center_current_distance_x < 0 && center_corner_distance_y < 0) {
          //左上
          center_current_distance_ratio_x = -center_current_distance_ratio_x;
          center_current_distance_ratio_y = -center_current_distance_ratio_y;

        } else if(center_current_distance_x < 0 && center_corner_distance_y > 0) {
          //左下
          center_current_distance_ratio_x = -center_current_distance_ratio_x;
          center_current_distance_ratio_y = center_current_distance_ratio_y;

        } else if(center_current_distance_x > 0 && center_corner_distance_y < 0) {
          //右上
          center_current_distance_ratio_x = center_current_distance_ratio_x;
          center_current_distance_ratio_y = -center_current_distance_ratio_y;

        }
        //console.log(center_current_distance_x, center_current_distance_y);
        tvui.style.transform = `rotateX(${center_current_distance_ratio_y * rotate_sensitivity * 90}deg)
                                  rotateY(${center_current_distance_ratio_x * rotate_sensitivity * 90}deg)`;

        front_layer.style.background = `linear-gradient(${(center_current_distance_ratio_y - center_current_distance_ratio_x) * 90}deg, transparent, rgba(255,255,255,0.16))`;

        app_name.style.transform = `translate(${-center_current_distance_ratio_x * translate_sensitivity * 90}px, ${-center_current_distance_ratio_y * translate_sensitivity * 90}px)`;
        //front_layer.innerHTML = `x:${center_current_distance_ratio_x.toFixed(2)},y:${center_current_distance_ratio_y.toFixed(2)}`;

      }
    }

    function leave() {
      tvui.style.transform = `rotateX(0deg) rotateY(0deg)`;
      front_layer.style.background = 'transparent';
      app_name.style.transform = `translate(0px,0px)`;
    }

    function change_backimage() {
      //console.log('change_backimage');
      var file = document.createElement('input');
          file.setAttribute('type', 'file');
          file.style.display = 'none';

      this.appendChild(file);
      file.click();

      file.addEventListener('change', function(e) {
        //console.log(e);
        console.log(e.target.files[0]);

        var background_URL = window.URL.createObjectURL(e.target.files[0]);
        tvui.style.background = tvui.style.background = `url(${background_URL})`;

      }, false);

      console.log(window.URL);
    }
  //tvui end
  };

  tvui(new Tvui(document.getElementById('TVUI'), '300px','200px',0.15,0.02,'../images/output/0449.jpg','red'));
  tvui(new Tvui(document.getElementById('TVUI2'), '300px','200px',0.15,0.02,'rgb(129, 180, 6)'));

  var scope_ui = function scope_ui(button,w,h) {

    var inner_button = document.createElement('div'),
        contorolPanel = document.createElement('div'),
        rotateX = document.createElement('input'),
        rotateY = document.createElement('input'),
        rotateZ = document.createElement('input');

        button.appendChild(inner_button);
        button.parentNode.appendChild(contorolPanel);

        contorolPanel.appendChild(rotateX);
        contorolPanel.appendChild(rotateY);
        contorolPanel.appendChild(rotateZ);

        inner_button.style.margin = `${h * 0.01}px auto`;
        inner_button.style.background = 'rgba(0,0,0,0.16)';
        inner_button.style.width = `${w * 0.98}px`;
        inner_button.style.height = inner_button.style.lineHeight = `${h * 0.98}px`;
        inner_button.style.textAlign = 'center';
        inner_button.textContent = 'Fusan';

        button.style.width = `${w}px`;
        button.style.height = `${h}px`;
        button.style.border = '1px solid transparent';
        button.style.transition = '0.3s ease 0s';
        button.style.float = 'left';

        contorolPanel.style.float = 'left';
        contorolPanel.style.background = 'rgb(223, 223, 223)'

        rotateX.setAttribute('type', 'range');
        rotateY.setAttribute('type', 'range');
        rotateZ.setAttribute('type', 'range');
        rotateX.setAttribute('id', 'x');
        rotateY.setAttribute('id', 'y');
        rotateZ.setAttribute('id', 'z');

        var x = 0,y = 0,z = 0;
        var deg = function deg() {
          console.log(this);

          for(var i=0,n=this.length;i<n;i++) {
            this[i].addEventListener('change',rotate , false);
          }

          function rotate() {

            if(this.id === 'x' ) {
              x = parseInt(this.value);
              x.innerText = this.value;
            } else if(this.id === 'y' ) {
              y = parseInt(this.value);
            } else if(this.id === 'z' ) {
              z = parseInt(this.value);
            }

            button.style.transform = `rotatex(${x}deg) rotateY(${y}deg) rotateZ(${z}deg)`;

          }

        };

        deg.call([rotateX, rotateY, rotateZ]);

        var flag = false;

        //button scale
        button.addEventListener('mouseenter', scope, false);
        button.addEventListener('mousedown', scope, false);
        button.addEventListener('mousemove', scope, false);
        button.addEventListener('mouseup', scope, false);
        button.addEventListener('mouseleave', scope, false);

        function scope(e) {
          console.log(e.type);
          e.preventDefault();

          if( e.type === 'mouseenter') {

            button.style.border = '1px solid gray';

          } else if(e.type === 'mousedown') {

            flag = true;
            button.style.border = '1px dotted gray';

          } else if(e.type === 'mousemove') {

            if(flag) {
              button.style.border = '1px dotted transparent';
              button.style.background = 'gray';
            }

          } else if(e.type === 'mouseup') {

            flag = false;
            button.style.border = '1px solid gray';
            button.style.background = 'transparent';

          } else if( e.type === 'mouseleave') {

            button.style.border = '1px solid transparent';
            button.style.background = 'transparent';

          }

        }
  //end
  }(document.getElementById('SCUI'),200,100);
//end
};
