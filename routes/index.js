var express = require('express');
var router = express.Router();
var fs = require('fs');

var model = require('../model');
	User = model.User;
	Vote = model.Vote;

var noodle = require('noodlejs');
//console.log(noodle.query);

var validator = require('validator');
//console.log(express);

var request = require('request');
var promise = require('es6-promise').Promise;
var PubNub = require('pubnub');
//var easyimage = require('easyimage');

// Root
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Test App' });

  var sum;

  for (var i=0,n=10000000;i<n|0;i = i+1) {
  	if(i === 0) {var start = new Date().getMilliseconds();}
  	sum += i;
  	if(i === 9000000) {
  		var end = new Date().getMilliseconds();
  		console.log(end,start,end - start);
  	}
  }
});

//stream api test
router.get('/stream', function(req, res) {
	//console.log(req.url.split('/')[1]);

	var header = '<h4 id="viewHeaderTitle">'+ req.url.split('/')[1] +'</h4>';
	var html = '<h2>stream</h2>';

	res.send({html: html, header: header,route: req.url.split('/')[1]});
});

//vote app
router.get('/vote', function(req, res) {
	//console.log(req.url.split('/')[1]);

	var header = '<h4 id="viewHeaderTitle">'+ req.url.split('/')[1] +'</h4>';
	var html = '<h2>Vote</h2>' +
							'<div id="agreement"><span>雰囲気はいかがですか？</span>' +
							'<button id="agree">良かった</button><button id="disagree">良くなかった</button></div>' +
							'<div class="stackedChart"><div id="agreebar"></div><div id="disagreebar"></div></div>' +
							'<div id="pieChart"></div>';

	res.send({html: html, header: header,route: req.url.split('/')[1]});
});

router.get('/vote/push', function(req, res) {
	console.log(req.query);

	var voteJson = {};
	voteJson.vote = req.query.vote;

	var vote = new Vote(voteJson);
	vote.save(function(err) {
		if(err) throw err;
		Vote.find({}, function(err,data) {
			if(err) throw err;
			var votes = {};
			var agrees = [],disagrees = [];

			for (var i = 0,n = data.length; i < n; i++) {
				if(data[i].vote === 'agree') {
					agrees.push(data[i].vote);
				} else {
					disagrees.push(data[i].vote);
				}
			}

			votes.agree = agrees.length;
			votes.disagree = disagrees.length;

			console.log(votes);
			res.send(votes);
		});
	});
	//database insert
		//database find
			//res.send vote data
			//rendering to client side by d3.js or DOM + css
});

//mongodb upsert test
router.get('/upsert', function(req,res) {
	//console.log(req.url);
	var header = '<h4 id="viewHeaderTitle">'+ req.url.split('/')[1] +'</h4>';

	var html = '<div>データベースに決算期と会社名があれば更新、なければデータ挿入する。<br>' +
					'Yahooscrapingでは証券コード、決算期をチェックして更新があればインサートする感じで使えそう。<br>' +
					'ただし、社名変更、M＆Aがあると新規でスクレイピングされることになる。' +
					'<ul>使ったquery<li>upsert</li><li>$and</li><li>$set</li></ul></div>' +
					'<div style="background: rgba(0,0,0,.08);">' +
					'<input type="text" name="settlement" value="" placeholder="2015" id="settlement">' +
					'<input type="text" name="company" value="" placeholder="TSLA" id="company">' +
					'<input type="text" name="sales" value="" placeholder="1000" id="sales">' +
					'<input type="button" name="submit" value="送信" id="insert"></div>' +
					'<div id="testFileld"></div>';

	res.send({html: html, header: header, route: req.url.split('/')[1]});
});

//noodlejs module
router.get('/scraping', function(req, res) {

	var header = '<h4 id="viewHeaderTitle">'+ req.url.split('/')[1] +'</h4>' +
			'<div style="margin:.4rem .2rem;">URLを入力するとスクレイピング開始。module : noodle</div>' +
			'<div style="background: rgba(0,0,0,.08);margin:.4rem .2rem;">URL : http://www. <input type="text" name="scrape" id="scrapeURL">' +
			'<button id="scrape">scrape</button></div>';
	var html = '';

	res.send({html: html, header: header,route: req.url.split('/')[1]});
});

router.get('/scrape', function(req, res) {
	//console.log(req.query);
	var query = {
		'url': 'http://www.' + req.query.url,
		'type': 'html',
		'selector': 'body',
		'extract': 'html'
	};

	noodle.query(query).then(function(results) {
		var html = results.results[0].results[0];
		var header = '<h4 id="viewHeaderTitle">'+ req.query.url +'</h4>' +
				'<div style="background: rgba(0,0,0,.08);margin:.4rem .2rem;">URL : http://www. <input type="text" name="scrape" id="scrapeURL">' +
				'<button id="scrape">scrape</button></div>';

		res.send({html: html, header: header,route: req.url.split('/')[1]});
	});

});

router.get('/socket', function(req,res) {
	//console.log(req.query)
	var header = '<h4 id="viewHeaderTitle">'+ req.url.split('/')[1] +'</h4>';

	var html = '<button class="subModules" id="geolocationModule">Map</button><button class="subModules" id="presentTextMoudule">Text</button>' +
			'<button class="subModules" id="ballModule">Ball</button>' +
			'<div id="testField"></div>' +
			'<section id="chat"><div id="chatTimeLine"><div id="submit"><div id="messageCard">+</div></div></div>' +
	    '<div id="stage"></section>';

	    res.send({html: html, header: header,route: req.url.split('/')[1]});

	    /*easyimage.resize({
           src:'./public/images/IMG_0449.jpg',
           dst:'./public/images/output/0449.jpg',
           width:500, height:500,
           cropwidth:128, cropheight:128,
           x:0, y:0
        }).then(
            function(file) {
                  console.log(file);
                }, function (err) {
                  console.log(err);
                }
              );*/
});

router.get('/socket/geolocation', function(req,res) {
	var html = '<div id="googleMap"></div>'
					 + '<div id="mappingButtons"><img src="/images/icon_cone.svg" id="getRoot" title="ルートロギング">'
					 + '<img src="/images/icon_pin.svg" id="getPosition" title="訪問先マッピング"></div>'
					 + '<div id="infomation"><div id="presentLocation"></div></div>';
	res.send(html);
});

router.get('/socket/realtimeInputText', function(req,res) {
	var html = '<input type="text" name="formTest" value="" placeholder="リアルタイムで反映" id="formTest">' +
						'<div id="textarea"></div>';
	res.send(html);
});

//年度データがなければ丸ごと挿入、修正値があれば修正値のみ変更　upsertの威力
router.get('/insert', function(req, res) {
	var settlement = validator.escape(req.query.settlement),
		company = validator.escape(req.query.company),
		sales = validator.escape(req.query.sales);

	var conditions = {$and: [
			{"settlement": settlement},
			{"company": company}
		]};

	var doc = {$set: {"company": company, "sales": sales}};
	var options = {upsert:true};
	//res.send(req.query);
	User.update(conditions, doc, options, function(err, data) {
		console.log(data);
		User.find({"company": company}, function(err, data) {
			res.send(data);
		});
	});
});

router.get('/download/:id', function(req, res) {
	var id = req.params.id;
	//console.log(req.params);
	res.send(id);
});

router.get('/bitcoin', function(req,res) {
	var header = '<h4 id="viewHeaderTitle">'+ req.url.split('/')[1] +'</h4>';
	var html = '<div><button id="getBitcoinData">データ取得</button></div>' +
			'<div id="bitcoinStage"></div>' +
			'<script src="http://cdn.pubnub.com/pubnub-3.7.12.min.js"></script>';

	res.send({html: html, header: header,route: req.url.split('/')[1]});
});

router.get('/getBitcoinData', function(req, res) {
	//console.log('req');
	//http api
	var promise = new Promise(function(resolve, reject) {
		request('https://api.bitflyer.jp/v1/getticker', function(err, res, body) {
			if (!err && res.statusCode == 200) {
				//console.log(res, body);
			    resolve(body);
			  }
		});
	});

	promise.then(function(value) {
		res.send(value);
	});
});

module.exports = router;
