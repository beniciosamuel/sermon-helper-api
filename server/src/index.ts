import express from 'express';
import { Request, Response } from 'express';
import { createServer } from 'http';

const app = express();
const server = createServer(app);

const PORT = process.env.SERVER_PORT || 3000;

app.get('/health', (req: Request, res: Response) => {
	res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
