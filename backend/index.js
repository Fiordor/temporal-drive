const path = require('path');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use('/images', express.static(path.join(__dirname, 'images')));

const server = require('http').Server(app)
const io = require('socket.io')(server, { cors: { origin: ['*'] } });

const api = require('./api');

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
		if (data == 'break') {
			console.log('break');
		} else {
			console.log(data.token, data.name, data.index, data.base64);
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