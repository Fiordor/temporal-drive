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

	const MANAGER_ROOM = 'manager';
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
				io.to(token).emit('update-files', files);
			}
		});
	}

	const updateSizes = (token) => {
		let sql = `SELECT busy, busy_perc FROM room WHERE token LIKE '${token}'`;
		connection.query(sql, (err, rows, fields) => {
			if ((err || rows.length > 1)) { console.log(err); }
			else {
				io.to(token).emit('update-sizes', rows[0]);
				rows[0]['token'] = token;
				io.to(MANAGER_ROOM).emit('update-sizes-manager', rows[0]);
			}
		});
	}

	console.log('connection', socket.id);

	//  join-on-room  ------------------------------------------------------------
	socket.on('join-on-room', (room) => {
		console.log(`[${new Date().toISOString()}] join-on-room ${room} ${socket.id}`);
		socket.join(room);

		if (room != MANAGER_ROOM) {
			let sql = `SELECT name FROM box WHERE token = '${room}' AND dateCreate > 0`;
			connection.query(sql, (err, rows, fields) => {
				if (err) { console.log(err); }
				else {
					let files = [];
					rows.forEach(row => {
						let name = row.name;
						let absolutePath = URL + path.join('/', PUBLIC, room, row.name);
						let file = { name: name, path: absolutePath }
						files.push(file);
					});
					console.log(`[${new Date().toISOString()}] update-first-files ${socket.id}`);
					socket.emit('update-first-files', files);
				}
			});
		}
	});

	//  request-room-info  -------------------------------------------------------
	socket.on('request-room-info', (room) => {

		let sql = `SELECT * FROM room WHERE token LIKE '${room}'`;
		connection.query(sql, (err, rows, fields) => {
			socket.emit('get-room', (err || rows.length != 1) ? null : rows[0]);
		});
	});

	//  can-upload-file  ---------------------------------------------------------
	socket.on('can-upload-file', (fileInfo) => {

		const EMIT = 'file-can-be-uploaded';
		let pathRoom = path.join(__dirname, PUBLIC, fileInfo.token);
		let response = { yes: false, id: fileInfo.token + fileInfo.name }

		console.log(`[${new Date().toISOString()}] ${EMIT} ${socket.id}`);

		response.yes = fs.existsSync(pathRoom);

		if (response.yes) {

			function testBusy() {
				let sql = `SELECT capacity, busy, busy_perc FROM room WHERE token LIKE '${fileInfo.token}'`;
				connection.query(sql, (err, rows, fields) => {
					response.yes = (err) ? false : true;
					if (response.yes) { insertFileIntoDB(rows[0]); }
					else { socket.emit(EMIT, response); }
				});
			}

			function insertFileIntoDB(roomInfo) {

				let newBusy = roomInfo.busy + fileInfo.size;
				let newPerc = Math.round(newBusy / roomInfo.capacity * 100);
				if (newPerc == 0) { newPerc = 1; }

				let insert = `INSERT INTO box VALUES ('${fileInfo.token}${fileInfo.name}',
				'${fileInfo.token}', '${fileInfo.name}', ${fileInfo.size}, 0);`;

				let update = `UPDATE room SET busy = ${newBusy}, busy_perc = ${newPerc} WHERE token LIKE '${fileInfo.token}'`;

				response.yes = newBusy <= roomInfo.capacity;

				if (response.yes) {
					connection.query(update, (err, rows, fields) => { });

					connection.query(insert, (err, rows, fields) => {
						response.yes = (err) ? false : true;
						console.log('response', response);
						socket.emit(EMIT, response);
					});	
				} else {
					socket.emit(EMIT, response);
				}
			}

			testBusy();

		} else {
			socket.emit(EMIT, response);
		}
	});

	//  upload-file  -------------------------------------------------------------
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
						else {
							updateFiles(data.token);
							updateSizes(data.token);
						}
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

	//  delete-files  ------------------------------------------------------------
	socket.on('delete-file', (img) => {

		console.log(`[${new Date().toISOString()}] delete-file`);

		fs.unlink(path.join(__dirname, PUBLIC, img.token, img.name), (err) => {
			if (err) { console.log(err); }
			else {

				let fileBusy = undefined;
				let room = undefined;

				function getFileInfo() {
					let select = `SELECT busy FROM box WHERE id LIKE '${img.token}${img.name}'`;
					connection.query(select, (err, rows, fields) => {
						if (err || rows.length > 1) { console.log(err); }
						else {
							console.log('getFileInfo', rows);
							fileBusy = rows[0].busy;
							updateBusyRoom();
							deleteFile();
						}
					});
				}

				function getRoomInfo() {
					let select = `SELECT capacity, busy, busy_perc FROM room WHERE token LIKE '${img.token}'`;
					connection.query(select, (err, rows, fields) => {
						if (err || rows.length > 1) { console.log(err); }
						else {
							console.log('getRoomInfo', rows);
							room = rows[0];
							updateBusyRoom();
						}
					});
				}

				function updateBusyRoom() {

					if (fileBusy == undefined || room == undefined) return;

					let newBusy = room.busy - fileBusy;
					let newPerc = newBusy / room.capacity * 100;
					if (newPerc > 0) {
						if (newPerc < 1) newPerc = 1;
						else newPerc = Math.round(newPerc);
					}

					let update = `UPDATE room SET busy = ${newBusy}, busy_perc = ${newPerc} WHERE token LIKE '${img.token}'`;

					connection.query(update, (err, rows, fields) => {
						updateSizes(img.token);
					});
				}

				function deleteFile() {
					let sql = `DELETE FROM box WHERE id LIKE '${img.token}${img.name}';`
					connection.query(sql, (err, rows, fields) => {
						if (err) { console.log(err); }
						else { updateFiles(img.token); }
					});
				}

				getFileInfo();
				getRoomInfo();
				
			}
		});
	});

	socket.on('close-room', (token) => {
		console.log(`[${new Date().toISOString()}] close-room ${token}`);
		io.to(token).emit('close-room');
	})

	//  disconnect  --------------------------------------------------------------
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