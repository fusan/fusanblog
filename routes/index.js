'use strict';

const express = require('express');
var router = express.Router();
const fs = require('fs');

const model = require('../model');
const User = model.User;
const Vote = model.Vote;
const Reserve_stock = model.Reserve_stock;
const Reserve_data = model.Reserve_data;
const Customer_data = model.Customer_data;
const Mail_data = model.Mail_data;
const Bitcoin_keypair = model.Bitcoin_keypair;

const noodle = require('noodlejs');
const cheerio = require("cheerio");
const request = require('request');
const bitcoin = require('bitcoinjs-lib');

const validator = require('validator');

const nodemailer = require('nodemailer');
const inbox = require('inbox');
const mail = {
  auth: {
      user: 'gogyaru@gmail.com',
      pass: '030210yuan'
  }
};

const yahoo_finance = require('./yahooscrape');

console.log(bitcoin.TransactionBuilder());

// Root
router.get('/', (req, res, next) => {
  res.render('index', { title: 'Test App' });
});

router.get('/wallet', (req, res) => {

  res.render('wallet', { title: 'Fusan wallet' });

});

router.get('/wallet/create', (req, res) => {

  //important !! loacal stoarage best practice.
  //attention backup caution after generating keyPair.

  //count over 3 account => find => res.send 3accunts_data.
  //coun under 3 accunt => upadate => res.send untill 3 accunts_data

  Bitcoin_keypair.count({}, (err, count) => {

    count < 4 ? create() : find() ;

  });

  //更新データチェック
  function create() {

    var keyPair = bitcoin.ECPair.makeRandom();

    var key_address = new Bitcoin_keypair(keyPair);
    var conditions = { "privateKey": keyPair.toWIF() };
    var doc = { "privateKey": keyPair.toWIF(), "address": keyPair.getAddress()};
    var options = { "upsert" : true };

    Bitcoin_keypair.update(conditions, doc, options, (err, data) => {

      find(data);

    });

  }

  //全データ取得
  function find(json) {

    Bitcoin_keypair.find({}, (err, data) => {
      res.send(data);
    });

  }

});

//imap 受信
/*
router.get('/pop', (req, res) => {
  console.log('pop');
  var client = inbox.createConnection(false, 'imap.gmai.com',{
    secureConnection: true,
    auth: mail.auth
  });

  client.connect();

  client.on("connect", function(){
      client.openMailbox("INBOX", function(error, info){
          if(error) throw error;

          client.listMessages(-10, function(err, messages){
              messages.forEach(function(message){
                  console.log(message.UID + ": " + message.title);
              });
          });

      });
  });
});
*/

//smtp　送信
router.get('/mail',(req, res) => {

  var transport = nodemailer.createTransport('SMTP', {
      service: 'gmail',
      auth: mail.auth
  });

  var json = {}; // timestampはdbで付与
      json.id = validator.escape(req.query.id);
      json.email = validator.escape(req.query.email);
      json.subject = validator.escape(req.query.subject);
      json.html = validator.escape(req.query.html);

  var mailOptions = {
      to: json.email,
      subject: `問い合わせ内容`,
      html: `<div>表題：${json.subject}</div>
            <div style="border-bottom: 1px dotted gray"></div>
            <div>内容：<b>${json.html}</b></div>
            <div style="border-bottom: 1px dotted gray"></div>
            このメッセージは自動配信されています。`
    };


  //顧客IDありの場合 mail_dataにてinsert idを使ってデータベースを呼び出し紐付ける作業を間にかませる。
  //顧客IDなしの場合　Vistor_dataに登録 mongodb

  var email = new Mail_data(json);
  console.log(email);

  transport.sendMail(mailOptions, (error, response) => {

      if(error){
        console.log(error);
      } else {
        console.log('Message sent: ' + response.message);
        res.send(response.message);
      }

      transport.close();

  });

});

router.get('/api', (req, res) => {
  console.log(req.query);
  var json = new Promise((resolve, reject) => {

    let _json = lucky_no(req.query);
    resolve(_json);

  });

  json.then((value) => {
    console.log(value);

    let html = `<html><body><span id="test">${value.key}</span></body></html>`;

    res.send(html);

  });

});

function lucky_no(data) {

  console.log(typeof data.key);

  let _data = ` is licky no ${Math.floor(Math.random() * 100)}. it is closure!`;

  data.key = `${data.key}${_data}`;

  console.log(data);

  return data;
}

//experiment
router.get('/experiment',(req, res) => {
  var header = `<h4 id="viewHeaderTitle">${req.url.split('/')[1]}<span id="sub_page_help">?</span></h4>`;
	var html = `<div id="experiment_stage"></div>`;

  res.send({html: html, header: header,route: req.url.split('/')[1]});
});

//ui page
router.get('/ui', (req, res) => {
  var header = `<h4 id="viewHeaderTitle">${req.url.split('/')[1]}<span id="sub_page_help">?</span></h4>`;
	var html = `<h4>Apple TV UI</h4>
              <div id="TVUI"></div><div id="TVUI2"></div><div id='TVUI3'></div>
              <div style="clear: both;"></div>
              <h4>Scope UI</h4><div id="SCUI"></div>`;

	res.send({html: html, header: header,route: req.url.split('/')[1]});
});

//open stock page
router.get('/stock', (req, res) => {
	var header = `<h4 id="viewHeaderTitle">${req.url.split('/')[1]}<span id="sub_page_help">?</span></h4>`;
	var html = `<div id="console"><span id="addFinanceData">add</span><span id="visualize">visualize</span>
            <span id="erase">remove</span><span id="analytics">analytics</span></div><section class="dataForm">
            <div id="data"></div></section>`;

	res.send({html: html, header: header,route: req.url.split('/')[1]});
});

//yahoo finance data sraping -> insert mongodb & create json.
router.get('/stock/getFinanceData', (req, res, next) => {

	const yahoofinance = 'http://profile.yahoo.co.jp/consolidate/';

	var query = {
    'url': `${yahoofinance}${req.query.ticker_no}`,
    'type': 'html',
    'selector': 'body',
    'extract': 'html'
	};

	noodle.query(query).then((results) => {
		//console.log(results);
		new Promise((resolve, reject) => {

      var domString = results.results[0].results[0];

      resolve(domString);

		}).then((v) => {

      var $ = cheerio.load(v);

      return $;

		}).then((v) => {

      var financeDataInsert = function* financeDataInsert() {

        yield yahoo_finance.scrape(v);
        yield res.send('finish');

      }();

      financeDataInsert.next();
      financeDataInsert.next();

      //generator で待機して　nodata or get dataを返しえその結果をクライアントに返す

    });
  });
});

router.get('/stock/:id(\\d+)', function(req, res){

  console.log(req.params.id);
  //差分のみ追記　fs.appendFile　かな？
  fs.readFile('./json/' + req.params.id + '.json', 'utf8', function(err, data) {
      res.send(data);
    });
});

/* ------------------ reserveSystem2 ----------------- */
router.get('/reserveSystem2', (req, res) => {

    var header = `<h4 id="viewHeaderTitle">${req.url.split('/')[1]}</h4>`;
    var html = '<section id="stage"></section>';
    var route = req.url.split('/')[1];

    res.send({html, header, route});
});

//管理画面
router.get('/reserveSystem2/admin', (req, res) => {

  var html = `<button id="registration">在庫登録</button><button id="reserved_check">予約確認</button>`;

  res.render('admin', {title: '管理画面', html: html});
});

//在庫変更処理
router.get('/reserveSystem2/admin/push_reserve', (req,res) => {
  //insert db
  var reserve_stock = new Reserve_stock(req.query);
  var conditions = { "reserve_id": req.query.reserve_id };
  var doc = { "reserve_id": req.query.reserve_id, "reserve_nums":  req.query.reserve_nums};
  var options = { "upsert" : true };

  //更新データチェック
  Reserve_stock.update(conditions, doc, options, (err, data) => {
    //console.log(data);
    //全データ取得
    Reserve_stock.find({}, (err, data) => {
      //console.log(data);
      res.send(data);
    });
  });

});

//予約管理　顧客からのリクエスト
router.get('/reserveSystem2/admin/check_reserve', (req, res) => {
  console.log(req.query);

  //customer data insert & update
  (function update_customer(obj) {
    let customer_data = new Customer_data(obj);
    let conditions = {"id": obj.id};
    let doc = obj;
    let options = { "upsert": true};

    Customer_data.update(conditions, doc, options, (err, data) => {
      //console.log(data);
      Customer_data.find({}, (err, data) => {
        console.log(data);
      });

    });
  //end
  }(req.query.customer_obj));

  //reserve data insert & update
  (function update_reserve(obj) {
    Reserve_stock.find({"reserve_id" : obj.reserve_id}, (err, data) => {
      //console.log(data);
      if(err) throw err;
      var new_reserve_nums = data[0].reserve_nums - obj.reserve_nums,
          reserve_stock = new Reserve_stock(obj),
          conditions = {"reserve_id": obj.reserve_id},
          doc = { "reserve_id": obj.reserve_id, "reserve_nums": new_reserve_nums},
          options = { "upsert" : true };

      //console.log(new_reserve_nums, data[0].reserve_nums, req.query.reserve_nums);

      //在庫がない場合
      if(new_reserve_nums < 0) {
        console.log('+',new_reserve_nums);
        var data = {'msg':false};
        res.send(data);

      //在庫がある場合
      } else {
        console.log('-',new_reserve_nums);
        Reserve_stock.update(conditions, doc, options, (err, data) => {
          //console.log(data);
          Reserve_stock.find({}, (err, data) => {
            //console.log(data);
            res.send(data);
          });

        });

      }

    });
  //end
  }(req.query.reserve_obj));

});

//データベース初期呼び出し
router.get('/reserveSystem2/admin/get_reserve', (req,res) => {
  //console.log(req.query.reserve_id);
  var insert_db = new Promise((resolve, reject) => {

      for(let i=0,n=req.query.reserve_id.length;i<n;i++) {
        //console.log(req.query.reserve_id[i]);
        var obj = {};
            obj.reserve_id = req.query.reserve_id[i];


        var reserve_stock = new Reserve_stock(obj);

        var conditions = {"reserve_id": obj.reserve_id};
        var doc = {"reserve_id": obj.reserve_id};
        var options = { "upsert" : true };

        Reserve_stock.update(conditions, doc, options, (err,data) => {
          //console.log(data);
        });

        //最終ループでresolve
        if(i === n-1) resolve('ok');
      }

  });

  insert_db.then((v) => {
    //console.log(v);
    Reserve_stock.find({}, (err,data) => {
      res.send(data);
    });

  });

});


/* ------------------ reserveSystem ----------------- */
router.get('/reserveSystem', (req, res) => {

	var header = `<h4 id="viewHeaderTitle">${req.url.split('/')[1]}<span id="sub_page_help">?</span></h4>`;
	var html = '<section id="stage"></section>';
  var route = req.url.split('/')[1];

	res.send({html, header, route});
});

router.get('/inStore', (req, res) => {
  console.log(Object.keys(req.query).length === 0);
  if(Object.keys(req.query).length === 0) {

    Reserve.find({}, (err,data) => {
      if(err) throw err;
      console.log('insert or init', data);
      res.send(data);
    });

	} else {

    var reserve = new Reserve(req.query);
    //console.log(reserve);
		reserve.save((err) => {
			if(err) throw err;
			Reserve.find({}, (err,data) => {
				//console.log(data);
				res.send(data);
			});
		});

	}
});

router.get('/removeReserve', (req, res) => {
	console.log(req.query);
	Reserve.remove({reservedID: req.query.data},(err) => {
		if(err) throw err;
		Reserve.find({}, (err, data) => {
			res.send(data);
		});
	});
});

router.get('/allClear', (req,res) => {
	Reserve.remove({}, (err) => {
		if(err) throw err;
		Reserve.find({}, (err, data) => {
			//console.log(data);
			res.send(data);
		});
	});
})

//vote app
router.get('/vote', (req, res) => {
	//console.log(req.url.split('/')[1]);
	var header = `<h4 id="viewHeaderTitle">${req.url.split('/')[1]}</h4>`;

	var html = `<div id="agreement"><span>雰囲気はいかがですか？</span>
              <button id="agree">良かった</button><button id="disagree">良くなかった</button></div>
              <div class="stackedChart"><div id="agreebar"></div><div id="disagreebar"></div></div>
              <div id="pieChart"></div>`;

	res.send({html: html, header: header,route: req.url.split('/')[1]});
});

router.get('/vote/push', (req, res) => {
	console.log(req.query);

	var voteJson = {};
      voteJson.vote = req.query.vote;

	var vote = new Vote(voteJson);

	vote.save((err) => {
		if(err) throw err;

		Vote.find({}, (err,data) => {
			if(err) throw err;

			var votes = {};
			var agrees = [],disagrees = [];

			for (var i = 0,n = data.length; i < n; i++) {
				data[i].vote === 'agree' ? agrees.push(data[i].vote) : disagrees.push(data[i].vote);
			}

			votes.agree = agrees.length;
			votes.disagree = disagrees.length;

			console.log(votes);
			res.send(votes);

		});
	});

});

//mongodb upsert test
/*
router.get('/upsert', (req,res) => {
	//console.log(req.url);
	var header = `<h4 id="viewHeaderTitle">${req.url.split('/')[1]}</h4>`;

	var html = `<div>データベースに決算期と会社名があれば更新、なければデータ挿入する。<br>
					Yahooscrapingでは証券コード、決算期をチェックして更新があればインサートする感じで使えそう。<br>
					ただし、社名変更、M＆Aがあると新規でスクレイピングされることになる。
					<ul>使ったquery<li>upsert</li><li>$and</li><li>$set</li></ul></div>
					<div style="background: rgba(0,0,0,.08);">
					<input type="text" name="settlement" value="" placeholder="2015" id="settlement">
					<input type="text" name="company" value="" placeholder="TSLA" id="company">
					<input type="text" name="sales" value="" placeholder="1000" id="sales">
					<input type="button" name="submit" value="送信" id="insert"></div>
					<div id="testFileld"></div>`;

	res.send({html: html, header: header, route: req.url.split('/')[1]});
});
*/

//noodlejs module
router.get('/scraping', (req, res) => {

	var header = `<h4 id="viewHeaderTitle">${req.url.split('/')[1]}</h4>
			<div style="margin:.4rem .2rem;">URLを入力するとスクレイピング開始。module : noodle</div>
			<div style="background: rgba(0,0,0,.08);margin:.4rem .2rem;">URL : http://www. <input type="text" name="scrape" id="scrapeURL">
			<button id="scrape">scrape</button></div>`;

	var html = '';

	res.send({html: html, header: header,route: req.url.split('/')[1]});
});

router.get('/scrape', (req, res) => {
	//console.log(req.query);
	var query = {
		'url': `http://www.${req.query.url}`,
		'type': 'html',
		'selector': 'body',
		'extract': 'html'
	};

	noodle.query(query).then((results) => {
		console.log('results');
		var html = results.results[0].results[0];
		var header = `<h4 id="viewHeaderTitle">${req.query.url}</h4>
                  <div style="background: rgba(0,0,0,.08);margin:.4rem .2rem;">URL : http://www.
                  <input type="text" name="scrape" id="scrapeURL">
                  <button id="scrape">scrape</button></div>`;

		res.send({html: html, header: header,route: req.url.split('/')[1]});
	});

});

router.get('/socket', (req,res) => {
	//console.log(req.query)
	var header = `<h4 id="viewHeaderTitle">${req.url.split('/')[1]}</h4>`;

	var html = `<button class="subModules" id="geolocationModule">Map</button>
              <button class="subModules" id="ballModule">Ball</button>
              <div id="testField"></div>
              <section id="chat">
              <div id="chatTimeLine"><div id="submit"><div id="messageCard">+</div></div></div>
              <div id="stage"></section>`;

	    res.send({html: html, header: header,route: req.url.split('/')[1]});

});

router.get('/socket/geolocation', (req,res) => {
	var html = `<div id="googleMap"></div>
	<div id="mappingButtons"><img src="/images/icon_cone.svg" id="getRoot" title="ルートロギング">
	<img src="/images/icon_pin.svg" id="getPosition" title="訪問先マッピング"></div>
	<div id="infomation"><div id="presentLocation"></div></div>`;

	res.send(html);
});

//年度データがなければ丸ごと挿入、修正値があれば修正値のみ変更　upsertの威力
router.get('/insert', (req, res) => {
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
	User.update(conditions, doc, options, (err, data) => {
		console.log(data);
		User.find({"company": company}, (err, data) => {
			console.log(data);
			res.send(data);
		});
	});
});

router.get('/download/:id', (req, res) => {
	var id = req.params.id;
	//console.log(req.params);
	res.send(id);
});

router.get('/bitcoin', (req,res) => {

	var header = `<h4 id="viewHeaderTitle">${req.url.split('/')[1]}</h4>`;

	var html = `<div id="bitcoinStage"></div><div><span id="stopButton">×</span></div>`;

	res.send({html: html, header: header,route: req.url.split('/')[1]});
});

//sever side api
router.get('/getBitcoinData', (req, res) => {
	//console.log(req.query.data);
	if(req.query.data === 'start') {

		//pubnub refarence　https://www.pubnub.com/docs/web-javascript/data-streams-publish-and-subscribe

		var PubNub = require('pubnub');
		var pubnub = PubNub({
				subscribe_key: "sub-c-52a9ab50-291b-11e5-baaa-0619f8945a4f"
		});

		pubnub.subscribe({
				channel: "lightning_ticker_BTC_JPY",
				message: (data) => {
          //insert db
          //change event
					console.log(data);
				}
		});
	}

});

module.exports = router;
