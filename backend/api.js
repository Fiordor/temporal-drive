const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const URL = 'http://82.223.68.210:3000';

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
router.post('/', function (req, res, next) {

  if (req.body['op'] == undefined) {
    res.send({ res: 'err', message: 'no op' });
    return;
  }

  console.log(`[${new Date().toISOString()}] ${req.body.op}`);

  switch (req.body.op) {
    case 'getDriveSize': getDriveSize(req, res); break;
    case 'getRoom': getRoom(req, res); break;
    case 'getRooms': getRooms(req, res); break;
    case 'roomOn': roomOn(req, res); break;
    case 'roomOff': roomOff(req, res); break;
  }
});

function getDriveSize(req, res) {

  let sql = `SELECT SUM(capacity) AS sum FROM room`;

  connection.query(sql, (err, rows, fields) => {
    if (err) { res.send(er(err)); }
    else { res.send(ok(rows[0].sum));}
  });

}

/**
 * Devuelve la información principal de una sala si está abierta.
 * body.room = id de la sala.
 */
function getRoom(req, res) {

  let sql = `SELECT * FROM room WHERE id = ${req.body.id};`;

  connection.query(sql, function (err, rows, fields) {
    if (err) { res.send(er(err)); }
    else {
      rows.forEach(row => { row['capacityMB'] = toMB(row.capacity); });
      res.send(ok(rows[0]));
    }
  });
}

/**
 * Devuelve un array con la información principal de las salas.
 * Sin body.
 */
function getRooms(req, res) {
  connection.query('SELECT * FROM room ORDER BY id', function (err, rows, fields) {
    if (err) { res.send(er(err)); }
    else {
      rows.forEach(row => { row['capacityMB'] = toMB(row.capacity); });
      res.send(ok(rows));
    }
  });
}

/**
 * Cambia el estado de la sala.
 * body.room = {
 *  id: id de la room,
 *  token: token de la room,
 *  capacity: capacidad en Bytes,
 *  dateOff: en cuanto se apaga la sala en millis
 * }
 */
function roomOn(req, res) {

  let room = req.body.room;

  let id = room.id;
  let token = room.token;
  let capacity = room.capacity * 1024 * 1024;
  let dateOn = Date.now();
  let dateOff = Date.now() + room.dateOff;

  let sql =
    `UPDATE room
    SET token = '${token}', capacity = ${capacity},
    dateOn = ${dateOn}, dateOff = ${dateOff},
    openRoom = 1, busy = 0, busy_perc = 0
    WHERE id = ${id};`

  let localPath = path.join(__dirname, PUBLIC, token);
  if (!fs.existsSync(localPath)) {
    fs.mkdir(localPath, (err) => { if (err) { console.log(err); } });
  }

  connection.query(sql, (err, rows, fields) => {
    if (err) { res.send(er(err)); }
    else {
      req.body['id'] = id;
      getRoom(req, res);
    }
  });
}

/**
 * Elimita los datos de una sala y la deja a 0.
 * body.room = { id: id de la room, token: token de la room }
 */
function roomOff(req, res) {

  let id = req.body.room.id;
  let token = req.body.room.token;

  let localPath = path.join(__dirname, PUBLIC, token);
  let options = { recursive: true, force: true };

  fs.rmdir(localPath, options, (err) => {
    if (err) { console.log(err); }
  });

  let sql1 = `DELETE FROM box WHERE token LIKE '${token}';`
  connection.query(sql1, (err, rows, fields) => {
    if (err) { console.log(err); }
  });

  let sql2 = `UPDATE room
    SET token = '', capacity = 0, dateOn = 0, dateOff = 0, openRoom = 0, busy = 0, busy_perc = 0
    WHERE id = ${id};`
  connection.query(sql2, (err, rows, fields) => {
    if (err) { console.log(err); }
    else {
      req.body['id'] = id;
      getRoom(req, res);
    }
  });
}

function toMB(bytes) { return bytes / (1024 * 1024) }

function toB(megabytes) { return megabytes * (1024 * 1024) }

function ok(message) { return { res: 'ok', message: message } }

function er(message) { return { res: 'err', message: message } }

module.exports = router;