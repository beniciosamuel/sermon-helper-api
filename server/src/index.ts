import express from 'express';
import { Request, Response } from 'express';
import { createServer } from 'http';
import { Secrets } from './services';

const app = express();
const server = createServer(app);

const PORT = process.env.SERVER_PORT || 3000;

app.get('/health', (req: Request, res: Response) => {
	res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

app.get('/', async (req: Request, res: Response) => {
	const secrets = new Secrets();
	const secret = await secrets.getString('DB_PASSWORD');
	res.status(200).json({ secret });
});

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
