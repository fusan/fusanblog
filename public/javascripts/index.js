function id (selector) {
	return document.getElementById(selector);
}

//ボタンと非同期通信お紐付け
var buttons = document.getElementsByTagName('button');

for(var i=0,n=buttons.length;i<n;i++) {
	console.log(buttons[i].getAttribute('id'));
	change(buttons[i].getAttribute('id'));
}

function change(selector) {
	id(selector).addEventListener('click', function() {
		//console.log('/' + selector);
	var view = $.ajax({
		url: '/' + selector,
		type: 'GET'
	});

	view.done(function(data) {
		id('viewHeader').innerHTML = data.header;
		id('viewArea').innerHTML = data.html;

		if(selector == 'scraping') { scraping(); }
		if(selector == 'upsert') { upsert(); }
		if(selector == 'socket') { socketIo(); }

		console.log(data);
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
    	$('#insert').on('click', function() {
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
    	});
    });
}

function socketIo() {
	var field = id('socketTestFieldInner');

	/* geo location  */
	id('button').addEventListener('click', getPositionByTime , false);

	socket.on('client push', function(data) {
		console.log(data[0]);
	    field.innerHTML  = '緯度：' + data[0].latitude + '<br>' + field.innerHTML;
	  });

	/* mousemove event */
	id('socketTestField').addEventListener('mousemove', function(e) {
	  console.log(e.pageX, e.pageY);
	  socket.emit('mousemove', {positionX : e.pageX, positionY: e.pageY});
	},false);

	socket.on('mousemove return', function(data) {
	  id('dot').style.top = data.positionY;
	  id('dot').style.left = data.positionX;

	  id('socketTestFieldInner').innerHTML = 'pageX :' + data.positionX + 'pageY: ' + data.positionY;
	});
}

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