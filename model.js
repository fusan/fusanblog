var mongoose = require('mongoose');
var url = 'mongodb://localhost/list';
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
	'message': String
}, {collection: 'chat'});

exports.User = db.model('User', UserSchema);
exports.Chat = db.model('Chat', SocketSchema);



