const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/files', express.static(path.join(__dirname, 'files')));

const server = require('http').Server(app)
const io = require('socket.io')(server, { cors: { origin: ['*'] } });

const api = require('./api');
const PUBLIC = 'files';

const mysql = require('mysql');
var connection = mysql.createConnection({
  host: 'localhost',
  user: 'admin',
  password: fs.readFileSync('./admin.txt', { encoding: 'utf8' }),
  database: 'temporal_box'
});

connection.connect();

/**
 * -----------------------------------------------------------------------------
 * API REST
 * -----------------------------------------------------------------------------
 */
app.post('/', api);

/**
 * -----------------------------------------------------------------------------
 * Socket.io conexion
 * -----------------------------------------------------------------------------
 */
io.on('connection', (socket) => {

	console.log('connection', socket.id);

	socket.on('upload-file', (data) => {
		if (data.index == -1 && data.base64 == 'break') {
			
			setTimeout(() => {
				
				let sql1 =
					`SELECT *
					FROM file_buff
					WHERE token LIKE '${data.token}' AND name LIKE '${data.name}'
					ORDER By i;`

				connection.query(sql1, function (err, rows, fields) {
					if (err) throw err;

					let base64 = '';
					rows.forEach(row => {
						base64 += row.data;
					});

					console.log(base64.length);
					base64 = base64.substring(base64.indexOf(',') + 1);
					fs.writeFile(path.join(__dirname, PUBLIC, data.token, data.name), base64, 'base64', (err) => {
						if (err) throw err;
					})

					let sql2 =
						`DELETE FROM file_buff
						WHERE token LIKE '${data.token}' AND name LIKE '${data.name}';`
					connection.query(sql2, function (err, rows, fields) {
						if (err) throw err;
						console.log(rows);
					});	

				});	
				

			}, 5 * 1000);
			
		} else {
			let sql = `INSERT INTO file_buff
				VALUES ('${data.token}', '${data.name}', '${data.index}', '${data.base64}');`

			connection.query(sql, function (err, rows, fields) { if (err) throw err; });
		}
	})

	socket.on('disconnect', () => {
		console.log('user disconnected');
	});

});

server.listen(5000, function () {
	console.log(`>> Socket listo y escuchando por el puerto: 5000`)
})

app.listen(3000, function () {
	console.log(`>> Express listo y escuchando por el puerto: 3000`)
});