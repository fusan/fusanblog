'use strict';

var router = require('express').Router();
var server = require('http').Server(router);

var events = require('events');
var util = require('util');
var fs = require('fs');

router.get('/', function(req, res) {

	res.render('spa',{title: 'SPA', no: ''});

});

router.get('/:no', function(req, res) {

	console.log(req.params);
	res.send(branch(req.params));

});

function branch(req) {

	function fn() { return req.no === 'first' ? img() : ''; }

	function img() {
		return `<img src="../images/chart.svg">`;
	}

	var html = `<div class="pages"><h4>this is ${req.no} page</h4>
							<input type="text">${ fn() }</div>`;

	return html;

}

module.exports = router;
