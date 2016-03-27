var router = require('express').Router();
var server = require('http').Server(router);

var fs = require('fs');

router.get('/', (req, res) => {

	res.render('Coupon',{title: 'Coupon Class'});

});

router.get('/register', (req,res) => {
  console.log(req.query);
  res.send(req.query);

});

module.exports = router;
