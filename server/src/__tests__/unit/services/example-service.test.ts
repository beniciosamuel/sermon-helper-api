/**
 * Example unit test for a service
 * This demonstrates how to write unit tests for services with mocked repositories
 * 
 * When you create actual services, follow this pattern:
 * 1. Mock the repository/dependencies
 * 2. Test success scenarios
 * 3. Test failure scenarios
 * 4. Test edge cases
 */

// Example service interface (replace with your actual service)
interface ExampleService {
	getData(id: number): Promise<any>;
	createData(data: any): Promise<any>;
}

// Example repository interface (replace with your actual repository)
interface ExampleRepository {
	findById(id: number): Promise<any>;
	create(data: any): Promise<any>;
}

// Example service implementation
class ExampleServiceImpl implements ExampleService {
	constructor(private repository: ExampleRepository) {}

	async getData(id: number): Promise<any> {
		if (!id || id <= 0) {
			throw new Error('Invalid ID');
		}
		const data = await this.repository.findById(id);
		if (!data) {
			throw new Error('Data not found');
		}
		return data;
	}

	async createData(data: any): Promise<any> {
		if (!data || !data.name) {
			throw new Error('Invalid data: name is required');
		}
		return await this.repository.create(data);
	}
}

describe('ExampleService', () => {
	let service: ExampleService;
	let mockRepository: jest.Mocked<ExampleRepository>;

	beforeEach(() => {
		// Create a mock repository
		mockRepository = {
			findById: jest.fn(),
			create: jest.fn(),
		};

		// Create service instance with mocked repository
		service = new ExampleServiceImpl(mockRepository);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('getData', () => {
		it('should return data when valid ID is provided', async () => {
			// Arrange
			const mockData = { id: 1, name: 'Test Data' };
			mockRepository.findById.mockResolvedValue(mockData);

			// Act
			const result = await service.getData(1);

			// Assert
			expect(result).toEqual(mockData);
			expect(mockRepository.findById).toHaveBeenCalledWith(1);
			expect(mockRepository.findById).toHaveBeenCalledTimes(1);
		});

		it('should throw error when data is not found', async () => {
			// Arrange
			mockRepository.findById.mockResolvedValue(null);

			// Act & Assert
			await expect(service.getData(1)).rejects.toThrow('Data not found');
			expect(mockRepository.findById).toHaveBeenCalledWith(1);
		});

		it('should throw error when ID is invalid (zero)', async () => {
			// Act & Assert
			await expect(service.getData(0)).rejects.toThrow('Invalid ID');
			expect(mockRepository.findById).not.toHaveBeenCalled();
		});

		it('should throw error when ID is invalid (negative)', async () => {
			// Act & Assert
			await expect(service.getData(-1)).rejects.toThrow('Invalid ID');
			expect(mockRepository.findById).not.toHaveBeenCalled();
		});

		it('should throw error when repository throws an error', async () => {
			// Arrange
			const error = new Error('Database connection failed');
			mockRepository.findById.mockRejectedValue(error);

			// Act & Assert
			await expect(service.getData(1)).rejects.toThrow('Database connection failed');
		});
	});

	describe('createData', () => {
		it('should create data when valid data is provided', async () => {
			// Arrange
			const inputData = { name: 'New Data', value: 100 };
			const createdData = { id: 1, ...inputData };
			mockRepository.create.mockResolvedValue(createdData);

			// Act
			const result = await service.createData(inputData);

			// Assert
			expect(result).toEqual(createdData);
			expect(mockRepository.create).toHaveBeenCalledWith(inputData);
			expect(mockRepository.create).toHaveBeenCalledTimes(1);
		});

		it('should throw error when data is null', async () => {
			// Act & Assert
			await expect(service.createData(null as any)).rejects.toThrow(
				'Invalid data: name is required'
			);
			expect(mockRepository.create).not.toHaveBeenCalled();
		});

		it('should throw error when name is missing', async () => {
			// Arrange
			const invalidData = { value: 100 };

			// Act & Assert
			await expect(service.createData(invalidData)).rejects.toThrow(
				'Invalid data: name is required'
			);
			expect(mockRepository.create).not.toHaveBeenCalled();
		});

		it('should throw error when repository throws an error', async () => {
			// Arrange
			const inputData = { name: 'New Data' };
			const error = new Error('Database constraint violation');
			mockRepository.create.mockRejectedValue(error);

			// Act & Assert
			await expect(service.createData(inputData)).rejects.toThrow(
				'Database constraint violation'
			);
		});
	});
});
