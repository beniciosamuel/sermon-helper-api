import express from 'express';
import { Router, Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);
const io = new Server(server, {
	cors: {
		origin: '*',
		methods: ['GET', 'POST'],
	},
});

io.on('connection', (socket) => {
	console.log('A user connected');
});

io.on('transcript', (transcript: string) => {
	console.log('Transcript:', transcript);
});

io.on('disconnect', (socket) => {
	console.log('A user disconnected');
});

server.listen(3000, () => {
	console.log('Server is running on port 3000');
});
