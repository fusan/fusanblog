var express = require('express');
var router = express.Router();
var fs = require('fs');

var model = require('../model');
	User = model.User;

var noodle = require('noodlejs');
//console.log(noodle.query);

var validator = require('validator');
//console.log(express);

var PubNub = require('pubnub');

// Root
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Test App' });
});

router.get('/stream', function(req, res) {
	//console.log(req.url.split('/')[1]);
	
	var header = '<h4 id="viewHeaderTitle">'+ req.url.split('/')[1] +'</h4>';
	var html = '<h2>stream</h2>';

	res.send({html: html, header: header,route: req.url.split('/')[1]});
})

router.get('/upsert', function(req,res) {
	//console.log(req.url);

	var header = '<h4 id="viewHeaderTitle">'+ req.url.split('/')[1] +'</h4>';

	var html = '<div>データベースに決算期と会社名があれば更新、なければデータ挿入する。<br>';
		html += 'Yahooscrapingでは証券コード、決算期をチェックして更新があればインサートする感じで使えそう。<br>';
		html += 'ただし、社名変更、M＆Aがあると新規でスクレイピングされることになる。';
		html += '<ul>使ったquery<li>upsert</li><li>$and</li><li>$set</li></ul></div>';
		html += '<div style="background: rgba(0,0,0,.08);">';
		html += '<input type="text" name="settlement" value="" placeholder="2015" id="settlement">';
		html += '<input type="text" name="company" value="" placeholder="TSLA" id="company">';
		html += '<input type="text" name="sales" value="" placeholder="1000" id="sales">';
		html += '<input type="button" name="submit" value="送信" id="insert"></div>';
		html += '<div id="testFileld"></div>';

	res.send({html: html, header: header,route: req.url.split('/')[1]});
})

//noodlejsモジュールのテスト
router.get('/scraping', function(req, res) {

	var header = '<h4 id="viewHeaderTitle">'+ req.url.split('/')[1] +'</h4>';
		header += '<div style="margin:.4rem .2rem;">URLを入力するとスクレイピング開始。module : noodle</div>';
		header += '<div style="background: rgba(0,0,0,.08);margin:.4rem .2rem;">URL : http://www. <input type="text" name="scrape" id="scrapeURL"> .com/ <button id="scrape">scrape</button></div>';
	var html = '';
	
	res.send({html: html, header: header,route: req.url.split('/')[1]});
});

router.get('/scrape', function(req, res) {
	//console.log(req.query);
	var query = {
		'url': 'http://www.' + req.query.url + '.com',
		'type': 'html',
		'selector': 'body',
		'extract': 'html'
	}

	noodle.query(query).then(function(results) {
		var html = results.results[0].results[0];
		var header = '<h4 id="viewHeaderTitle">'+ req.query.url +'</h4>';
			header += '<div style="background: rgba(0,0,0,.08);margin:.4rem .2rem;">URL : http://www. <input type="text" name="scrape" id="scrapeURL"> .com/ <button id="scrape">scrape</button></div>';

		res.send({html: html, header: header,route: req.url.split('/')[1]});
	});

});

router.get('/socket', function(req,res) {
	//console.log(req.query)
	var header = '<h4 id="viewHeaderTitle">'+ req.url.split('/')[1] +'</h4>';

	var html = '<button id="button">GPSデータ取得</button><input type="text" name="formTest" value="" placeholder="リアルタイムで反映" id="formTest">';
		html += '<!-- 位置情報ログ　--><div id="socketTestField"><div id="socketTestFieldInner"><span id="dot"></span></div></div>';
	    html += '<!-- chat line --><section id="chat"><div id="chatTimeLine">';
	    html += '<div id="submit"><input type="text" name="userID" value="" placeholder="Chat ID" id="userID">';
	    html += '<input type="text" name="message" value="" placeholder="コメント" id="message">';
	    html += '<input type="file" accept="image/*" name="photo" id="photo" multiple>';
	    html += '<button id="sendMessage">送信</button></div>';
	    html += '<div id="stage"></section>';

	    res.send({html: html, header: header,route: req.url.split('/')[1]});

})

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
	var html = '<div><button id="getBitcoinData">データ取得</button></div>';

	res.send({html: html, header: header,route: req.url.split('/')[1]});
});

/*
	目的：①エンジニア仲間を増やしてそこから仕事を取る、一緒に仕事をする
			②直接クライアントをとる。

	/postform blogFormat.ejs　記入用のフォーム モーダルウィンドウ
	/post mongodb　にデータを格納する　
	/list mongodb からブログリストを検索 index.ejs に変数を返し #list　に挿入　
	/blog #list の　日付の記事を読みだし画面遷移する

	/work 製作アプリのヘッドラインを回収　ajax
	<header></header>
	<section id="work">カードスタイルで表示：スマホ対応なので横にスワイプする：カードエフェクトを加える</section>
	<section id="bloglist"><h3>ブログのヘッド</h3><span>とざっくり見出し</span></section>
	<section id="blog"><span>ここから完全にblogページに遷移する</span>#bloglistをクリックするとこのフィールドに反映/section>
*/
module.exports = router;
