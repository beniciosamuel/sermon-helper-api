import express from 'express';
import { Router, Request, Response } from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const server = createServer(app);

// Get port from environment variable or default to 3000
const PORT = process.env.PORT || 3000;

// Get CORS origin from environment variable or default to allow all
const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';

const io = new Server(server, {
	cors: {
		origin: CORS_ORIGIN,
		methods: ['GET', 'POST'],
	},
});

// Health check endpoint for Docker healthchecks
app.get('/health', (req: Request, res: Response) => {
	res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
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

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
