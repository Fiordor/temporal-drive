const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const PUBLIC = 'files';

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
    case 'getRoom' : getRoom(req, res); break;
    case 'getRooms' : getRooms(req, res); break;
    case 'roomOnOff' : roomOnOff(req, res); break;
    case 'canUploadFile' : canUploadFile(req, res); break;
  }
});

function getRoom(req, res) {

  let sql =
  `SELECT *
  FROM room
  WHERE token = '${req.body.token}' AND openRoom = 1;`;

  connection.query(sql, function (err, rows, fields) {
    if (err) throw err;

    res.send( rows.length == 0 ? er('token not exists') : ok(rows[0]) );
  });  
}

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

function canUploadFile(req, res) {

  let pathRoom = path.join(__dirname, PUBLIC, req.body.file.token);
  if (fs.existsSync(pathRoom)) {

    let file = req.body.file;

    let sql = `INSERT INTO box
      VALUES ('${file.token}', '${file.name}', ${file.size}, 0);`

    connection.query(sql, function (err, rows, fields) {
      if (err) throw err;
      res.send(ok(rows));
    });
  } else {
    res.send(er('room path not exists'));
  }
}

function ok(message) { return { res: 'ok', message: message } }

function er(message) { return { res: 'err', message: message } }

module.exports = router;