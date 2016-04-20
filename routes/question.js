'use strict';

var router = require('express').Router();
var server = require('http').Server(router);

var reverse = require('../tool/reverse');

console.log(reverse({a: 1, b: 2}));

router.get('/', (req, res) => {
  res.render('question', { 'title': 'question'});
});

router.get('/vote', (req,res) => {

  new Promise((resolve, reject) => {

    inset_db(req.query);
    resolve(req.query);

  }).then((v) => {

    res.send(call_db(v));

  });

});

function inset_db(data) {
  console.log(`from client vote ${data}`);
}

function call_db(data) {
  return `return db value ${data.data}`;
}

module.exports = router;
