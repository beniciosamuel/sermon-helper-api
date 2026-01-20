import express from 'express';
import { Request, Response } from 'express';
import { createServer } from 'http';
import { EmailService, Secrets } from './services';
import { emailConfirmation } from './templates/emails/emailConfirmation';
import * as useCases from './useCases';
import { Context } from './services/Context';
import { createTrpcRouter } from './trpc';

const app = express();
const server = createServer(app);

const PORT = process.env.SERVER_PORT || 3000;

// Middleware
app.use(express.json());

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
	res.status(200).json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Mount versioned tRPC routes at /v1/trpc
app.use(createTrpcRouter());

// Legacy routes (can be removed once migrated to tRPC)
app.get('/', async (req: Request, res: Response) => {
	const secrets = new Secrets();
	const secret = await secrets.getString('DB_PASSWORD');
	res.status(200).json({ secret });
});

app.get('/emailtest', async (req: Request, res: Response) => {
	const emailService = await EmailService.initialize();
	const email = emailConfirmation({
		userName: 'John Doe',
		confirmationUrl: 'http://localhost:3000/confirm',
		expiresIn: '24 hours',
		appName: 'Example App',
	});
	await emailService.sendEmail('briariustecno@gmail.com', 'Test Email', email);
	res.status(200).json({ message: 'Email sent' });
});

app.get('/createtestuser', async (req: Request, res: Response) => {
	const context = await Context.initialize();
	
	const response = await useCases.createUser({
		name: 'John Doe',
		email: 'brian.sueden@gmail.com',
		password: 'password',
		color_theme: 'light',
		language: 'en',
		phone: '+4917644444',
	}, context);

	res.status(200).json(response);
});

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
	console.log(`tRPC endpoint available at: http://localhost:${PORT}/v1/trpc`);
});
