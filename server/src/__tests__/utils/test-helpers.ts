/**
 * Test helper utilities
 * Common functions and utilities for writing tests
 */

import { Request, Response } from 'express';

/**
 * Creates a mock Express Request object
 */
export const createMockRequest = (overrides?: Partial<Request>): Partial<Request> => {
	return {
		body: {},
		params: {},
		query: {},
		headers: {},
		...overrides,
	} as Partial<Request>;
};

/**
 * Creates a mock Express Response object with jest mocks
 */
export const createMockResponse = (): Partial<Response> => {
	const res: Partial<Response> = {
		status: jest.fn().mockReturnThis(),
		json: jest.fn().mockReturnThis(),
		send: jest.fn().mockReturnThis(),
		header: jest.fn().mockReturnThis(),
		setHeader: jest.fn().mockReturnThis(),
	};
	return res;
};

/**
 * Creates a mock Express NextFunction
 */
export const createMockNext = () => {
	return jest.fn();
};

/**
 * Waits for a specified number of milliseconds
 * Useful for testing async operations
 */
export const wait = (ms: number): Promise<void> => {
	return new Promise(resolve => setTimeout(resolve, ms));
};

/**
 * Asserts that a function throws an error with a specific message
 */
export const expectToThrow = async (
	fn: () => Promise<any>,
	errorMessage?: string
): Promise<void> => {
	try {
		await fn();
		throw new Error('Expected function to throw an error');
	} catch (error: any) {
		if (errorMessage) {
			expect(error.message).toContain(errorMessage);
		}
	}
};
