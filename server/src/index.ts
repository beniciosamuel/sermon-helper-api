import express from 'express';
import { Request, Response } from 'express';
import { createServer } from 'http';
import { EmailService, Secrets } from './services';
import { emailConfirmation } from './templates/emails/emailConfirmation';

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

server.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
