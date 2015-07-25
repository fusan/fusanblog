var mongoose = require('mongoose');
var url = 'mongodb://heroku_99cv7jnx:urpqu046rhf5v623i3ckma1d35@ds047612.mongolab.com:47612/heroku_99cv7jnx/blog';//'mongodb://localhost/blog';//// ||  
var db = mongoose.createConnection(url, function(err, res) {
	if(err) {
		console.log('error connected:' + url + '-' + err);
	} else {
		console.log('Success connected:' + url);
	}
});

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

exports.User = db.model('User', UserSchema);
exports.Chat = db.model('Chat', SocketSchema);



