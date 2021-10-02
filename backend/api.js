const express = require('express');
const router = express.Router();
const fs = require('fs')

const mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'admin',
  password: fs.readFileSync('./admin.txt', { encoding: 'utf8' }),
  database: 'temporal_box'
});

connection.connect();

/* GET home page. */
router.post('/', function(req, res, next) {

  if (req.body['op'] == undefined) {
    res.send({ res: 'err', message: 'no op' });
    return;
  }

  switch(req.body.op) {
    case 'getRooms' : getRooms(req, res); break;
    case 'roomOnOff' : roomOnOff(req, res); break;
  }
});

function getRooms(req, res) {
  connection.query('SELECT * FROM room', function (err, rows, fields) {
    if (err) throw err;

    res.send( ok(rows) );
  });
}

function roomOnOff(req, res) {

  let room = req.body.room;

  let id = room.id;
  let token = room.token;
  let capacity = room.capacity;
  let dateOn = Date.now();
  let dateOff = Date.now() + room.timer;
  let busy = 0;
  let busy_perc = 0;

  let sql =
  `UPDATE room
  SET token = '${token}', capacity = ${capacity},
    dateOn = ${dateOn}, dateOff = ${dateOff},
    busy = ${busy}, busy_perc = ${busy_perc}
  WHERE id = ${id};`

  connection.query(sql, function (err, rows, fields) {
    if (err) throw err;
    res.send( ok(rows) );
  });
}

function ok(message) { return { res: 'ok', message: message } }

function err(message) { return { res: 'err', message: message } }

module.exports = router;