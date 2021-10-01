const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors({ origin: '*' }));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

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