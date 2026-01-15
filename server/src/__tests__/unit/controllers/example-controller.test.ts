/**
 * Example unit test for a controller
 * This demonstrates how to write unit tests for controllers with mocked services
 */

import { Request, Response } from 'express';
import { createMockRequest, createMockResponse, createMockNext } from '../../utils/test-helpers';

// Example controller interface
interface ExampleController {
	getData(req: Request, res: Response, next: any): Promise<void>;
	createData(req: Request, res: Response, next: any): Promise<void>;
}

// Example service interface
interface ExampleService {
	getData(id: number): Promise<any>;
	createData(data: any): Promise<any>;
}

// Example controller implementation
class ExampleControllerImpl implements ExampleController {
	constructor(private service: ExampleService) {}

	async getData(req: Request, res: Response, next: any): Promise<void> {
		try {
			const id = parseInt(req.params.id, 10);
			const data = await this.service.getData(id);
			res.status(200).json(data);
		} catch (error: any) {
			next(error);
		}
	}

	async createData(req: Request, res: Response, next: any): Promise<void> {
		try {
			const data = await this.service.createData(req.body);
			res.status(201).json(data);
		} catch (error: any) {
			next(error);
		}
	}
}

describe('ExampleController', () => {
	let controller: ExampleController;
	let mockService: jest.Mocked<ExampleService>;
	let mockRequest: Partial<Request>;
	let mockResponse: Partial<Response>;
	let mockNext: jest.Mock;

	beforeEach(() => {
		// Create mock service
		mockService = {
			getData: jest.fn(),
			createData: jest.fn(),
		};

		// Create controller with mocked service
		controller = new ExampleControllerImpl(mockService);

		// Create mock Express objects
		mockRequest = createMockRequest();
		mockResponse = createMockResponse();
		mockNext = createMockNext();
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('getData', () => {
		it('should return 200 with data when service succeeds', async () => {
			// Arrange
			const mockData = { id: 1, name: 'Test Data' };
			mockService.getData.mockResolvedValue(mockData);
			mockRequest.params = { id: '1' };

			// Act
			await controller.getData(
				mockRequest as Request,
				mockResponse as Response,
				mockNext
			);

			// Assert
			expect(mockService.getData).toHaveBeenCalledWith(1);
			expect(mockResponse.status).toHaveBeenCalledWith(200);
			expect(mockResponse.json).toHaveBeenCalledWith(mockData);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it('should call next with error when service throws', async () => {
			// Arrange
			const error = new Error('Data not found');
			mockService.getData.mockRejectedValue(error);
			mockRequest.params = { id: '1' };

			// Act
			await controller.getData(
				mockRequest as Request,
				mockResponse as Response,
				mockNext
			);

			// Assert
			expect(mockService.getData).toHaveBeenCalledWith(1);
			expect(mockNext).toHaveBeenCalledWith(error);
			expect(mockResponse.status).not.toHaveBeenCalled();
		});
	});

	describe('createData', () => {
		it('should return 201 with created data when service succeeds', async () => {
			// Arrange
			const inputData = { name: 'New Data' };
			const createdData = { id: 1, ...inputData };
			mockService.createData.mockResolvedValue(createdData);
			mockRequest.body = inputData;

			// Act
			await controller.createData(
				mockRequest as Request,
				mockResponse as Response,
				mockNext
			);

			// Assert
			expect(mockService.createData).toHaveBeenCalledWith(inputData);
			expect(mockResponse.status).toHaveBeenCalledWith(201);
			expect(mockResponse.json).toHaveBeenCalledWith(createdData);
			expect(mockNext).not.toHaveBeenCalled();
		});

		it('should call next with error when service throws', async () => {
			// Arrange
			const error = new Error('Invalid data');
			mockService.createData.mockRejectedValue(error);
			mockRequest.body = {};

			// Act
			await controller.createData(
				mockRequest as Request,
				mockResponse as Response,
				mockNext
			);

			// Assert
			expect(mockService.createData).toHaveBeenCalledWith({});
			expect(mockNext).toHaveBeenCalledWith(error);
			expect(mockResponse.status).not.toHaveBeenCalled();
		});
	});
});
