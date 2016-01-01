var mongoose = require('mongoose');

//var url = 'mongodb://heroku_99cv7jnx:urpqu046rhf5v623i3ckma1d35@ds047612.mongolab.com:47612/heroku_99cv7jnx/blog';
//public/javascripts/index.js も変更
var url = 'mongodb://localhost/blog';
//var url = 'mongodb://dbuser:password@54.92.9.226/fusanblog';

var db = mongoose.createConnection(url, function(err, res) {
	if(err) {
		console.log('error connected:' + url + '-' + err);
	} else {
		console.log('Success connected:' + url);
	}
});

var ReseverSchema = new mongoose.Schema({
	reservedID: Number,
	id: Array,
	times: Array,
	name: String,
	no: Number,
	menu: String,
	minutes: Number
}, {collection: 'reserve'});

var ReseverSchema2 = new mongoose.Schema({
	reserve_nums: String,
	reserve_id: String
}, {collection: 'reserve_stock'});

var ReseverSchema3 = new mongoose.Schema({
	reserve_nums: Number,
	reserve_id: String
}, {collection: 'reserve_data'});

var ReseverSchema4 = new mongoose.Schema({
	name: 'String',
	ruby: 'String',
	post_no: 'Number',
	address: 'String',
	tel: 'Number',
	id: 'String'
}, {collection: 'customer_data'});

var MailSchema = new mongoose.Schema({
	'date': { type: Date, default: Date.now},
	'id': 'String',
	'email': 'String',
	'subject': 'String',
	'html': 'String'
}, {collection: 'mail_data'});

var UserSchema = new mongoose.Schema({
	'settlement': Number,
	'company': String,
  	'sales': Number
}, {collection: 'test'});

var SocketSchema = new mongoose.Schema({
	'pushTime': String,
	'userID': String,
	'message': String,
	'photo': Object
}, {collection: 'chat'});

var VoteSchema = new mongoose.Schema({
	'vote': String,
	'date': { type: Date, default: Date.now}
},{collection: 'votes'});

var MarkerSchema = new mongoose.Schema({
	'id': String,
	'date': { type: Date, default: Date.now},
	'latitude': Number,
	'longitude': Number,
	'comment': String
},{collection: 'marker'});

var YSchema = new mongoose.Schema({
	'日付': { type: Date, default: Date.now },
	'会社名': String,
	'証券コード': String,
	'決算期': String,
	'会計方式': String,
	'決算発表日': String,
	'決算月数': String,
	'売上高': String,
	'営業利益': String,
	'経常利益': String,
	'当期利益': String,
	'EPS（一株当たり利益）': String,
	'調整一株当たり利益': String,
	'BPS（一株当たり純資産）': String,
	'総資産': String,
	'自己資本': String,
	'資本金': String,
	'有利子負債': String,
	'自己資本比率': String,
	'ROA（総資産利益率）': String,
	'ROE（自己資本利益率）': String,
	'総資産経常利益率': String
}, {collection: 'YFinfo'});

exports.Yahoo = db.model('Yahoo', YSchema);
exports.User = db.model('User', UserSchema);
exports.Chat = db.model('Chat', SocketSchema);
exports.Vote = db.model('Vote', VoteSchema);
exports.Marker = db.model('Marker', MarkerSchema);
exports.Reserve = db.model('Reserve', ReseverSchema);
exports.Reserve_stock = db.model('Reserve_stock', ReseverSchema2);
exports.Reserve_data = db.model('Reserve_data', ReseverSchema3);
exports.Customer_data = db.model('Customer_data', ReseverSchema4);
exports.Mail_data = db.model('Mail_data', MailSchema);
