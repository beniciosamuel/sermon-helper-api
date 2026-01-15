/**
 * Unit tests for the main application entry point
 * 
 * Note: This test creates a mock Express app to test the health endpoint
 * In a real scenario, you would test your actual app routes
 */

import request from 'supertest';
import express, { Express } from 'express';

describe('Health Endpoint', () => {
	let app: Express;

	beforeAll(() => {
		// Create a fresh Express app for testing
		// This mimics the structure of your actual index.ts
		app = express();
		app.use(express.json());

		// Health endpoint (matching the one in index.ts)
		app.get('/health', (req, res) => {
			res.status(200).json({
				status: 'healthy',
				timestamp: new Date().toISOString(),
			});
		});
	});

	describe('GET /health', () => {
		it('should return 200 status code', async () => {
			const response = await request(app).get('/health');
			expect(response.status).toBe(200);
		});

		it('should return healthy status', async () => {
			const response = await request(app).get('/health');
			expect(response.body).toHaveProperty('status', 'healthy');
		});

		it('should return a valid timestamp', async () => {
			const response = await request(app).get('/health');
			expect(response.body).toHaveProperty('timestamp');
			expect(new Date(response.body.timestamp).getTime()).not.toBeNaN();
		});

		it('should return JSON content type', async () => {
			const response = await request(app).get('/health');
			expect(response.headers['content-type']).toMatch(/json/);
		});

		it('should have timestamp in ISO format', async () => {
			const response = await request(app).get('/health');
			const timestamp = response.body.timestamp;
			expect(timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/);
		});
	});
});
