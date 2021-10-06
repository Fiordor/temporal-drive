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
router.post('/', function(req, res, next) {

  if (req.body['op'] == undefined) {
    res.send({ res: 'err', message: 'no op' });
    return;
  }

  console.log(`[${new Date().toISOString()}] ${req.body.op}`);

  switch(req.body.op) {
    case 'getFiles' : getFiles(req, res); break;
    case 'getRoom' : getRoom(req, res); break;
    case 'getRooms' : getRooms(req, res); break;
    case 'roomOnOff' : roomOnOff(req, res); break;
    case 'canUploadFile' : canUploadFile(req, res); break;
  }
});

/**
 * Devuelve una lista de las rutas de los archivos de una sala
 * body.token = token de la sala.
 */
function getFiles(req, res) {
  let sql =
    `SELECT name
    FROM box
    WHERE token = '${req.body.token}' AND dateCreate > 0;`;

  connection.query(sql, function (err, rows, fields) {
    if (err) { res.send( er(err) ); }
    else {
      let files = [];
      rows.forEach(row => {
        let file = {
          name: row.name,
          path: URL + path.join('/', PUBLIC, req.body.token, row.name)
        }
        files.push(file);
      });
      res.send( ok(files) );
    }
  }); 
}

/**
 * Devuelve la información principal de una sala si está abierta.
 * body.token = token de la sala.
 */
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

/**
 * Devuelve un array con la información principal de las salas.
 * Sin body.
 */
function getRooms(req, res) {
  connection.query('SELECT * FROM room', function (err, rows, fields) {
    if (err) throw err;
    res.send( ok(rows) );
  });
}

/**
 * Cambia el estado de la sala.
 * body.room = {
 *  id: id de la room,
 *  token: token de la room,
 *  capacity: capacidad en Bytes,
 *  timer: en cuanto se apaga la sala en millis
 * }
 */
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

/**
 * Puede subir el archivo si o no.
 * body.file = {
 *  token: token de la sala,
 *  name: nombre del archivo,
 *  size: tamaño del archivo
 * }
 * 
 * Si existe la carpeta pública de la sala significa que está disponible para el
 * uso. Si lo está inserta en la tabla de box los datos iniciales del archivo que
 * se quiere subir. Si no lo está envía un error.
 */
function canUploadFile(req, res) {

  let pathRoom = path.join(__dirname, PUBLIC, req.body.file.token);
  if (fs.existsSync(pathRoom)) {

    let file = req.body.file;

    let sql = `INSERT INTO box
      VALUES ('${file.token}${file.name}', '${file.token}', '${file.name}', ${file.size}, 0);`

    connection.query(sql, function (err, rows, fields) {
      if (err) { res.send(er(err)); }
      else { res.send(ok(rows)); }
    });
  } else {
    res.send(er('room path not exists'));
  }
}

function ok(message) { return { res: 'ok', message: message } }

function er(message) { return { res: 'err', message: message } }

module.exports = router;