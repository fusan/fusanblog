'use strict';
const fs = require('fs');

const model = require('../model');
const Yahoo = model.Yahoo;

exports.scrape = function($) {

	//DB挿入
	var promise = new Promise((resolve,reject) => {
		//yahooファイナンスからのスクレイピング　別のサイトのスクレイピングをするときはyahooScrape()を別なものにすれば良い。
		var Obj = yahooScrape($);
		resolve(Obj);
	});

	promise.then((value) => {
		if(value != false) {
			//console.log('before insert db');
			//console.log(value);
			for (var i=0,n=value.length;i<n;i++) {
				var conditions = {$and: [
						{"決算期": value[i]['決算期']},
						{"証券コード": value[i]['証券コード']}
					]};
				var doc = {$set: {
					"会社名": value[i]['会社名'],
					"証券コード": value[i]['証券コード'],
					'決算期': value[i]['決算期'],
					'会計方式': value[i]['会計方式'],
					'決算発表日': value[i]['決算発表日'],
					'決算月数': value[i]['決算月数'],
					"売上高": value[i]['売上高'],
					'営業利益': value[i]['営業利益'],
					'経常利益': value[i]['経常利益'],
					'当期利益': value[i]['当期利益'],
					'EPS（一株当たり利益）': value[i]['EPS（一株当たり利益）'],
					'調整一株当たり利益': value[i]['調整一株当たり利益'],
					'BPS（一株当たり純資産）': value[i]['BPS（一株当たり純資産）'],
					'総資産': value[i]['総資産'],
					'自己資本': value[i]['自己資本'],
					'資本金': value[i]['資本金'],
					'有利子負債': value[i]['有利子負債'],
					'自己資本比率': value[i]['自己資本比率'],
					'ROA（総資産利益率）': value[i]['ROA（総資産利益率）'],
					'ROE（自己資本利益率）': value[i]['ROE（自己資本利益率）'],
					'総資産経常利益率': value[i]['総資産経常利益率']
					}};
				var options = {upsert:true};

				//データベース格納
				Yahoo.update(conditions, doc, options, function(err, data) {
					console.log(data);  //{ ok: 1, nModified: 0, n: 1 }
				});
			}
		} else {
			return 'json is exist!'
		}

	});

	//jsonファイル出力

	promise.then((value) => {
		//console.log('before genarate json');
		//console.log(value[0]);
		Yahoo.find({"証券コード": value[0]['証券コード']}, function(err, data) {
			//console.log('start genarate json ');
			//console.log(data); 		//jsonファイル生成前のデータの確認
			JSONFileGenerator(data);
			return 'create json'
		});
	});

	promise.catch((err) => {
		console.log(err);
	});
};

//yahooファイナンス専用　DOM取得　＝＞　JSON出力
function yahooScrape($) {
	//console.log($);
	var company = $('.yjL').text();
	var ticker = company.slice(-5,-1);
	var settlementcheck = $('#right_col').find('table').eq(1).find('tr').eq(1).find('td').eq(1).text();
	console.log(company, ticker, settlementcheck);

	if(company == '企業情報ページが見つかりません' || settlementcheck == '---') {
		console.log('no data');
		return false ;
	} else {
		console.log('geted data');
		var settlement = $('#right_col').find('table').eq(1).find('tr').text();

		//開業文字で配列に変換
		var re = /\n/g;
		settlement = settlement.split(re);

		//空文字の除去
		for(var i=0,n=settlement.length;i<n;i++) {
			i % 4 == 0 ? settlement.splice(i,1): settlement[i] = settlement[i] ;
		}
		settlement = settlement.filter(function(element){return element !== undefined});

		//console.log(settlement);

		//YFにプロパティを追記
		var array =[['会社名','証券コード'],[company,ticker],[company,ticker],[company,ticker]];
		for(var i=0,n=settlement.length;i<n;i++) {
			if(i % 4 === 0) {
				array[0].push(settlement[i]);
			} else if(i % 4 === 1) {
				array[1].push(settlement[i]);
			} else if(i % 4 === 2) {
				array[2].push(settlement[i]);
			} else if(i % 4 === 3) {
				array[3].push(settlement[i]);
			}
		}
		//console.log(array);
		var lastObj = [];
		lastObj.push(array[0],array[1],array[2],array[3]);
		lastObj = ArrayToJson(lastObj);
		console.log('before insert');
		console.log(lastObj);
		return lastObj;
	}
};

//jsonfile生成
function JSONFileGenerator(data) {
	var promise = new Promise(function(resolve,reject) {
		var jsons = [];
		for (var i=0,n=data.length;i<n;i++) {
			jsons.push(data[i]);
		}

		if(jsons.length > 2) {
			//console.log('last');
			//console.log(jsons);
			resolve(jsons);
		}
	});

	promise.then(function(value) {
		//console.log(value[0]);
		fs.writeFile('./json/' + value[0]['証券コード'] + '.json', JSON.stringify(value), 'utf8', function(err) {
			fs.readFile('./json/' + value[0]['証券コード'] + '.json','utf8', function(err, data) {
				//console.log(data);
			});
		});
	});
}

function ArrayToJson(array) {
	var jsons = [];
	for(var i=1;i< array.length;i++) {//最初の列は不要なので初期値iは1
		var json = {};//ループのたびに新しいJSONを生成 参照渡しを回避
		for(var j=0;j<array[i].length;j++) {
			json[array[0][j]] = array[i][j];
			}
			//console.log(json);
		jsons.push(json);
	}
	//console.log('ArrayToJson end' + jsons);
	return jsons
};
