var router = require('express').Router();
var server = require('http').Server(router);

var express = require('express');
var router = express.Router();
var fs = require('fs');

var model = require('../model_list');
		User = model.User;
		Log = model.Log;
		Img = model.Img;
		Memo = model.Memo;

var modal = require('./modal');
var update = require('./update');

var validator = require('validator');

var week = ['日','月','火','水','木','金','土'];

var initial_count = 100;//最初の会員様の番号 no100からスタートすることを示してる

/* -------------  initial -----------------*/
// トップページ
router.get('/', (req, res, next) => {

	User.find({},(err, data) => {
		res.render('list', { title: '会員名簿' , memberCount: data.length, lastNo: data.length + initial_count});
	});

});

//全名簿取得
router.get('/allList', (req, res) => {

	//来店履歴を挿入 10件表示 会員番号で昇順
	User.find({}).sort({"会員番号": 1}).limit(100).exec((err, data) => {
		res.send(data);
	});

});

//外部データ取り込み
router.get('/inport',(req, res) => {
	//外部データ読み込み xls-to-json でxlsファイルからインポートしてjson出力してそのままデータベースに突っ込む。fileapiをつかて
	//ファイル読み込みアップロード、xlsで保存すりようにバリデーションする。
	fs.readFile('member.json', 'utf8',(err, data) => {
		var json = JSON.parse(data);
		//console.log(json[0]);
		for(var i=0,n=2; i<2; i++) { inportUser(i); }

		function inportUser(i) {
			return () => {

				var user = new User(json[i]);

				user.save((err) => {
					//console.log(json[i]['会員番号']);
					if(err) throw err;

					User.find({'会員番号': json[i]['会員番号']}, (err, data) => { console.log(data); });

				});
			};
		}
		//データベースにインポートする
		res.send(json[0]);
	});
});

//誕生月判定
router.get('/birthday', (req, res) => {

	var thisMonth = new Date().getMonth() +1;
	var luckers = [];

	User.find({},(err, data) => {

		for(var i=0,n=data.length;i<n;i++) {

			var day = new Date(data[i]['生年月日']);

			if( (day.getMonth() + 1) == thisMonth ) {

				var lucker = {};
						lucker.name = data[i]['氏名'];
						lucker.birthday = `${(day.getMonth() + 1)}月${day.getDate()}日`;

				luckers.push(lucker);

			}

		}

		res.send(luckers);

	});

});

/* ---------------  customer -------------- */
// 新規登録画面
router.get('/register', (req, res) => {

	User.find({}, (err, data) => {

		var json = {};
				json.title = '新規登録';
				json.customer = '';
				json.next_no = initial_count + data.length + 1;
				json.html = modal.register('新規登録','', json.next_no);//最後尾の会員番号に１を足す.

		res.send(json);

	});

});

//新規確認画面 入力値の確認画面
router.post('/signUpCheck', (req, res) => {

	var customer = {};
	var data = {};

			customer.title = '確認画面';
			customer.no = req.body.no;
			customer.name = req.body.name;
			customer.ruby = req.body.ruby;
			customer.tel = req.body.tel;
			customer.sex = req.body.sex;
			customer.postcode = req.body.postcode;
			customer.address = req.body.address;
			customer.birthday = req.body.birthday;
			customer.eMail = req.body.eMail;

			data.no = customer.no;
			data.html = modal.signUpCheck(customer);

	res.send(data);

});

//新規にデータベース格納
router.get('/:id(\\d+)', (req, res) => {
	console.log(req.params.id);

	var list = {};

			list['表題'] = req.params.id;
			list['会員番号'] = req.query.no;
			list['氏名'] = req.query.name;
			list['ふりがな'] = req.query.ruby;
			list['電話番号'] = req.query.tel;
			list['性別'] = req.query.sex;
			list['郵便番号'] = req.query.postcode;
			list['住所'] = req.query.address;
			list['生年月日'] = req.query.birthday;
			list['メール'] = req.query.eMail;
			list['更新情報'] = '';
			list['更新カルテ'] = '';

			console.log(list);

	//database挿入
	var member = new User(list);

	member.save((err) => {

		if(err) throw err;

		User.find({'会員番号': req.query.no}, (err, data) => {
			console.log(data);
		});

	});

	//カードページにリダイレクト
	res.redirect('/');

});

/* ------------  search ----------------- */
//参考:http://stackoverflow.com/questions/3305561/how-to-query-mongodb-with-like
//NO検索
router.get('/card:id(\\d+)', (req, res) => {

	User.find({'会員番号': req.params.id},function(err, data) { data === '' ? res.end() : create(data); });

	function create(data) {
		console.log(data);
		var customer = {};

				customer.title = data[0]['会員番号'];
				customer.no = data[0]['会員番号'];
				customer.name = data[0]['氏名'];
				customer.ruby = data[0]['ふりがな'];
				customer.tel = data[0]['電話番号'];
				customer.sex = data[0]['性別'];
				customer.postcode = data[0]['郵便番号'];
				customer.address = data[0]['住所'];
				customer.birthday = data[0]['生年月日'];
				customer.eMail = data[0]['メール'];
				customer.karteimg = '';

		res.render('card', customer);

	}

});

//名前検索
router.get('/search', (req,res) => {

	User.where({'ふりがな': {'$regex': req.query.ruby}}).exec((err, data) => { res.send(data); });

});

/* ----------- visit history ----------- */
// 来店履歴入力フォーム
router.get('/appendKarte', (req, res) => {

	res.send(modal.customer_log(req));

});

//来店情報の格納
router.get('/updateLog', (req, res) => {
	console.log(req.query);

	//来店履歴をデータベースに格納
	var promise = new Promise((resolve, reject) => {

		update.log(req);
		resolve('ok');

	});

	//来店履歴を反映してレンダリング
	promise.then((value) => {

		//会員番号で顧客データを抽出
		User.find({'会員番号': req.query.no},(err, data) => {

			var customer = {};

					customer.title = data[0]['会員番号'];
					customer.no = data[0]['会員番号'];
					customer.name = data[0]['氏名'];
					customer.ruby = data[0]['ふりがな'];
					customer.tel = data[0]['電話番号'];
					customer.sex = data[0]['性別'];
					customer.postcode = data[0]['郵便番号'];
					customer.address = data[0]['住所'];
					customer.birthday = data[0]['生年月日'];
					customer.eMail = data[0]['メール'];
					customer.karteimg = '';

			res.render('card', customer);

		});

	});

});

//来店履歴訂正フォーム
router.get('/modifyLogForm', (req, res) => {

	res.send(modal.lastmodify(req));

});

//来店履歴の更新
router.get('/log', (req, res) => {

	Log.find({'会員番号': req.query.no}, (err ,data) => {

		var html = '';

		for(var i=0,n=data.length; i<n; i++) {

				html +=
					`<div class="logList">
					<span style="display: none;" class="logId">${data[i]._id}</span>
					<span>${data[i]['来店日'].getFullYear()}.${(data[i]['来店日'].getMonth()+1)}.${data[i]['来店日'].getDate()}
					(${week[data[i]['来店日'].getDay()]})</span>
					<span>${data[i]['コース']} ${data[i]['時間']}</span>
					<span>担当:${data[i]['担当']}</span>
					<span>指名:${data[i]['指名']}</span></div>`;
		}

		res.send(html);

	});

});

//来店履歴を訂正
router.get('/modifyLog', (req, res) => {
	//console.log(req.query);
	var promise = new Promise((resolve, reject) => {

		update.modify(req);
		resolve('ok');

	});

	promise.then((value) => { res.redirect(`/list/card${req.query.no}`); });

});

//来店履歴を削除
router.get('/removeLog', (req, res) => {
	//console.log(req.query);
	var promise = new Promise((resolve, reject) => {

		Log.remove({'_id': req.query.id}, (err) => { if(!err) resolve('ok'); });

	});

	promise.then((value) => { res.redirect('/list/card' + req.query.no); });

});

/* ----------- karte image ------------- */
//カルテ画像を格納
router.post('/appendIMG', (req, res) => {
	//console.log(req.body);
	var no = parseInt(req.body.no);

	//画像データをデータベースに格納
	var promise = new Promise((resolve, reject) => {

		update.IMG(req);

		resolve('ok');

	});

	//データベースから画像履歴を抽出
	promise.then((value) => {

		Img.find({'会員番号': no}, (err, data) => {

			var imgs = '';

			for(var i=0,n=data.length; i<n; i++) {

				imgs += `<img src="${data[i]['カルテ画像']}" alt="'+ ${data[i]._id}"><br>
								<span class="img">No.${(i+1)}__${data[i]['保存日'].getFullYear()}.${(data[i]['保存日'].getMonth()+1)}.${data[i]['保存日'].getDate()}
								(${week[data[i]['保存日'].getDay()]})</span><br>`;

			}

			res.send(imgs);

		});

	});

});

//カルテ画像の登録
router.get('/kartes', (req, res) => {
	//console.log(data);
	Img.find({'会員番号': req.query.no}, (err, data) => {

			var imgs = '';

			for(var i=0,n=data.length; i<n; i++) {

				var img = data[i]['カルテ画像'];
				var date = data[i]['保存日'];
				var id = data[i]._id;

				date = date.getFullYear()+'.'+(date.getMonth()+1)+'.'+date.getDate()+'('+week[date.getDay()]+')';

				imgs +=
					`<img src="${img}" alt="${id}"><br>
					<span class="img">No.${(i+1)}__${date}</span><br>`;

			}

			res.send(imgs);

		});

});

//カルテ画像の削除
router.get('/removeImg', (req, res) => {

	var promise = new Promise((resolve, reject) => {

		Img.remove({'_id': req.query.id}, (err) => {
			//console.log('remove!: ' + req.query.id);
			if(err) throw err;

			resolve('remove');

		});
	});

	promise.then((value) => { res.redirect('/list/card' + req.query.no); });

});

//カルテ削除フォームの生成
router.get('/removeKarteForm', (req, res) => {
	res.send(modal.removeImg(req));
});

/* ------------- memo ------------------ */
//メモの登録
router.get('/appendMemo', (req, res) => {
	//データベースに格納 メモを更新していく。
	var memos = {};
			memos['会員番号'] = req.query.no;
			memos['メモ'] = req.query.memo;

	//database挿入
	Memo.update({'会員番号': req.query.no},{$set: {'メモ': req.query.memo}}, {upsert: true}, function(err, data) {
		//console.log('メモに追記');
		res.send(req.query);
	});

});

//メモ
router.get('/memos', (req,res) => {

	Memo.find({'会員番号': req.query.no}, (err, data) => { !data ? res.end() : res.send(data); });

});

/* -------------- analytics ------------- */
//解析ページ
router.get('/analytics', (req, res) => {

	var membersArray = [];
	var members;
	var memberNo = 100;

	//会員数を取得 ループの回数を定義
	//log履歴を全て取得して会員番号をqueryにして来店数を取得
	var promise = new Promise((resolve, reject) => {

		User.count({},(err,count) => { resolve(count); });

	});

	promise.then((value) => {
		//console.log('会員数',value);
		members = value;

		for(var i=0,n=members;i<n;i++) {

			memberNo = memberNo + 1;
			membersArray.push(parseInt(memberNo));

		}

	});

	promise.then((value) => {
		//console.log('会員数', members);
		//console.log('会員配列', membersArray);
		for (var i=0,n=membersArray.length;i<n;i++) { analytics(i); }

		function analytics(i) {
			return () => {

				Log.find({"会員番号" : parseInt(membersArray[i])}, (err, data) => {
					//console.log('来店履歴データ',data);
					if(err) throw err;

					if(data[0] === undefined || data[0] === null) {
						console.log(data[0] + 'データがない');
						return;
					} else {

						var no = data[0]['会員番号'];
						var times = data.length;

						console.log(no+':'+times);

						User.update({'会員番号': no}, {$set: {"来店回数": times}}, {upsert: true}, function(err, data) {

							User.find({'会員番号': no}, (err, data) => { console.log(data); });

						});
					}
				});

			};
		}
	});

	//解析用のデータを集める mongo.find();
	res.send(modal.analytics(req));

});

//来店数ランキング
router.get('/visitLanking',(req, res) => {
	var limit = 10; //ランキング
	User.where('来店回数').gt(1).limit(limit).exec((err, data) => {
		if(err) console.log(err);
		res.send(data);
	});
});

//指名数ランキング
router.get('/nomineeCount', (req,res) => {
	Log.where('指名').ne('').exec((err, data) => {
		if(err) console.log(err);
		res.send(data);
	});
});

router.get('/generation', (req,res) => {

	User.find({}, (err, data) => {
		if(err) throw err;

		Log.where('会員番号').equals('102').exec((err, data2) => {

			var time = data2.length-1;
			var firstVisit = data2[0]['来店日'];
			var lastVisit = data2[time]['来店日'];
			//console.log(time,firstVisit,lastVisit);

			//来店時の年齢　来店日 - 誕生日　時代ごとの顧客層の変化を取る
			var firstVisitAge = getAge(data[0]['生年月日'],firstVisit);

			//現在年齢　現在　- 誕生日　現在の利用層を取る
			var attainedAge = getAge(data[0]['生年月日'],lastVisit);

			console.log(firstVisitAge, attainedAge);
		});

		/*Logモデルから利用日付を抽出してその日の利用実績、顧客遷移を確認できる
		Log.where('来店日').equals(ISODate("2015-05-11T14:49:30.951Z")).exec(function(err, data) {
			console.log(data);
		});*/

		res.send(data);

	});

});

//年齢計算
function getAge (birthday, now) {

	var b = new Date(birthday.getTime());
	var n = new Date(now.getTime());

	return (n-b)/ (365 * 24 * 60 * 60 *1000) - (n >= b ? 0: 1);

}

//オブジェクトのソート
function sort(arr,key) {

    arr.sort((a, b) => { return (a[key] > b[key]) ? 1 : -1; });

}

/*
router.get('/updateLog', function(req,res) {
	//console.log(User);
	Log.update({_id: req.query.count}, {$set: {"時間": 60}}, function(err, numberAffected, raw) {
	  console.log(err); // null
	  console.log(numberAffected); // 1
	  console.log(raw);
	});
	res.send('時間変更しました。');
});*/

/*
io.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

users.on('connection', function (socket) {
  socket.emit('news', { hello: 'world' });
  socket.on('my other event', function (data) {
    console.log(data);
  });
});

*/
/*var http = require('http')(express);
var io = require('socket.io').(router);

io.on('connection', function(socket){
  console.log('a user connected');
});*/

module.exports = router;
