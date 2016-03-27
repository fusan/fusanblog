var router = require('express').Router();
var server = require('http').Server(router);

var fs = require('fs');

router.get('/', (req, res) => {

	res.render('tls',{title: 'TLS Class'});

});

module.exports = router;
