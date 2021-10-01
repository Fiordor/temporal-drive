const express = require('express');
const router = express.Router();

const mysql = require('mysql');

/* GET home page. */
router.post('/', function(req, res, next) {

  if (req.body['op'] == undefined) {
    res.send({ res: 'err', message: 'no op' });
    return;
  }

  switch(req.body.op) {
    case 'getRooms' : getRooms(req, res); break;
  }
});

function getRooms(req, res) {



}

module.exports = router;