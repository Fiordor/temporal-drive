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
const URL = 'http://82.223.68.210:3000';

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

	let idInterval = null;
	let filesBuff = [];

	const updateFiles = (token) => {
		let sql = `SELECT name FROM box WHERE token = '${token}' AND dateCreate > 0;`;

		connection.query(sql, function (err, rows, fields) {
			if (err) { console.log(err); }
			else {
				let files = [];
				rows.forEach(row => {
					let file = {
						name: row.name,
						path: URL + path.join('/', PUBLIC, token, row.name)
					}
					files.push(file);
				});
				console.log(`[${new Date().toISOString()}] update-files ${token}`);
				io.to(token).emit('update-files', files)
			}
		});
	}

	console.log('connection', socket.id);

	socket.on('join-on-room', (room) => {
		console.log(`[${new Date().toISOString()}] join-on-room ${room}`);
		socket.join(room);

		var cont = 0;
		idInterval = setInterval(() => {
			let sql = `SELECT name FROM box WHERE token = '${room}' AND dateCreate > 0;`;

			connection.query(sql, function (err, rows, fields) {
				if (err) { console.log(err); }
				else {
					let files = [];
					rows.forEach(row => {
						let file = {
							name: row.name,
							path: URL + path.join('/', PUBLIC, room, row.name)
						}
						files.push(file);
					});
					console.log(`[${new Date().toISOString()}] update-files ${socket.id} ${cont}`);
					socket.emit('update-files', files);
				}
			});
			if (cont++ > 10) { clearInterval(idInterval); }
		}, 1000);
	});

	socket.on('stop-first-update-files', () => {
		console.log(`[${new Date().toISOString()}] stop-first-update-files`);
		if (idInterval != null) { clearInterval(idInterval); }
	});

	socket.on('upload-file', (data) => {

		if (data.index == -1 && data.payload == 'break') {

			let id = data.token + data.name;
			let base64 = filesBuff[id].join('');
			delete filesBuff[id];
			base64 = base64.substring(base64.indexOf(',') + 1);

			console.log(`[${new Date().toISOString()}] upload-file ${id}`);

			fs.writeFile(path.join(__dirname, PUBLIC, data.token, data.name), base64, 'base64', (err) => {
				if (err) { console.log(err); }
				else {
					console.log(`upload-file writeFile ${id}`);

					let sql3 = `UPDATE box SET dateCreate = ${Date.now()} WHERE id LIKE '${data.token}${data.name}';`
					connection.query(sql3, (err, rows, fields) => {
						if (err) { console.log(err); }
						else { updateFiles(data.token); }
					});
				}
			});

		} else {

			console.log(`[${new Date().toISOString()}] upload-file ${data.index} ${data.payload.length}`);

			let id = data.token + data.name;
			let index = data.index;
			if (filesBuff[id] == undefined) { filesBuff[id] = []; }
			filesBuff[id][index] = data.payload;

			delete data.payload;

			socket.emit('update-file-state', data);
		}
	});

	socket.on('delete-file', (img) => {

		console.log(`[${new Date().toISOString()}] delete-file`);

		fs.unlink(path.join(__dirname, PUBLIC, img.token, img.name), (err) => {
			if (err) {
				console.log(err);
			} else {
				let sql = `DELETE FROM box WHERE id LIKE '${img.token}${img.name}';`
				connection.query(sql, (err, rows, fields) => {
					if (err) { console.log(err); }
					else { updateFiles(img.token); }
				});
			}
		});
	});

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