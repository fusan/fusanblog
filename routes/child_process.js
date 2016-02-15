var router = require('express').Router();
var server = require('http').Server(router);

var events = require('events');
var fs = require('fs');

const exec = require('child_process').exec;

router.get('/', (req, res) => {

  res.render('child_process',{'title': 'Child Process'});

});

router.get('/test', (req, res) => {
  console.log(req.query);
    exec(req.query.cmd,(err,stdout,stderr) =>  {
    	//ok data,ls,cat,curl
    	//bad vi,cal
    	if(stdout) {
        res.send(`stdout:<br>${stdout}`);
    		console.log(`stdout:${stdout}`);
    	} else if(stderr){
        res.send(`stderr:<br>${stderr}`);
    		console.log(`stderr:${stderr}`);
    	} else {
        res.send(`err:<br>${err}`);
    		console.log(`err:${err}`);
    	}

    });

});

module.exports = router;
