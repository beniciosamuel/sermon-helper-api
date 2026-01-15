/**
 * Example unit test for a repository
 * This demonstrates how to write unit tests for repositories with mocked database connections
 * 
 * Note: In a real scenario, you might use an in-memory database or a test database
 * For unit tests, we mock the database connection
 */

// Example repository interface
interface ExampleRepository {
	findById(id: number): Promise<any>;
	findAll(): Promise<any[]>;
	create(data: any): Promise<any>;
	update(id: number, data: any): Promise<any>;
	delete(id: number): Promise<boolean>;
}

// Example database connection interface
interface DatabaseConnection {
	query(sql: string, params?: any[]): Promise<any>;
}

// Example repository implementation
class ExampleRepositoryImpl implements ExampleRepository {
	constructor(private db: DatabaseConnection) {}

	async findById(id: number): Promise<any> {
		const result = await this.db.query('SELECT * FROM example WHERE id = ?', [id]);
		return result[0] || null;
	}

	async findAll(): Promise<any[]> {
		const result = await this.db.query('SELECT * FROM example');
		return result;
	}

	async create(data: any): Promise<any> {
		const result = await this.db.query(
			'INSERT INTO example (name, value) VALUES (?, ?)',
			[data.name, data.value]
		);
		return { id: result.insertId, ...data };
	}

	async update(id: number, data: any): Promise<any> {
		await this.db.query(
			'UPDATE example SET name = ?, value = ? WHERE id = ?',
			[data.name, data.value, id]
		);
		return { id, ...data };
	}

	async delete(id: number): Promise<boolean> {
		const result = await this.db.query('DELETE FROM example WHERE id = ?', [id]);
		return result.affectedRows > 0;
	}
}

describe('ExampleRepository', () => {
	let repository: ExampleRepository;
	let mockDb: jest.Mocked<DatabaseConnection>;

	beforeEach(() => {
		// Create mock database connection
		mockDb = {
			query: jest.fn(),
		};

		// Create repository with mocked database
		repository = new ExampleRepositoryImpl(mockDb);
	});

	afterEach(() => {
		jest.clearAllMocks();
	});

	describe('findById', () => {
		it('should return data when found', async () => {
			// Arrange
			const mockData = { id: 1, name: 'Test', value: 100 };
			mockDb.query.mockResolvedValue([mockData]);

			// Act
			const result = await repository.findById(1);

			// Assert
			expect(result).toEqual(mockData);
			expect(mockDb.query).toHaveBeenCalledWith(
				'SELECT * FROM example WHERE id = ?',
				[1]
			);
		});

		it('should return null when not found', async () => {
			// Arrange
			mockDb.query.mockResolvedValue([]);

			// Act
			const result = await repository.findById(999);

			// Assert
			expect(result).toBeNull();
			expect(mockDb.query).toHaveBeenCalledWith(
				'SELECT * FROM example WHERE id = ?',
				[999]
			);
		});
	});

	describe('findAll', () => {
		it('should return array of all data', async () => {
			// Arrange
			const mockData = [
				{ id: 1, name: 'Test 1', value: 100 },
				{ id: 2, name: 'Test 2', value: 200 },
			];
			mockDb.query.mockResolvedValue(mockData);

			// Act
			const result = await repository.findAll();

			// Assert
			expect(result).toEqual(mockData);
			expect(mockDb.query).toHaveBeenCalledWith('SELECT * FROM example');
		});

		it('should return empty array when no data exists', async () => {
			// Arrange
			mockDb.query.mockResolvedValue([]);

			// Act
			const result = await repository.findAll();

			// Assert
			expect(result).toEqual([]);
		});
	});

	describe('create', () => {
		it('should create and return new data with id', async () => {
			// Arrange
			const inputData = { name: 'New Item', value: 300 };
			const insertResult = { insertId: 3 };
			mockDb.query.mockResolvedValue(insertResult);

			// Act
			const result = await repository.create(inputData);

			// Assert
			expect(result).toEqual({ id: 3, ...inputData });
			expect(mockDb.query).toHaveBeenCalledWith(
				'INSERT INTO example (name, value) VALUES (?, ?)',
				[inputData.name, inputData.value]
			);
		});
	});

	describe('update', () => {
		it('should update and return updated data', async () => {
			// Arrange
			const updateData = { name: 'Updated Item', value: 400 };
			mockDb.query.mockResolvedValue({ affectedRows: 1 });

			// Act
			const result = await repository.update(1, updateData);

			// Assert
			expect(result).toEqual({ id: 1, ...updateData });
			expect(mockDb.query).toHaveBeenCalledWith(
				'UPDATE example SET name = ?, value = ? WHERE id = ?',
				[updateData.name, updateData.value, 1]
			);
		});
	});

	describe('delete', () => {
		it('should return true when deletion succeeds', async () => {
			// Arrange
			mockDb.query.mockResolvedValue({ affectedRows: 1 });

			// Act
			const result = await repository.delete(1);

			// Assert
			expect(result).toBe(true);
			expect(mockDb.query).toHaveBeenCalledWith(
				'DELETE FROM example WHERE id = ?',
				[1]
			);
		});

		it('should return false when nothing is deleted', async () => {
			// Arrange
			mockDb.query.mockResolvedValue({ affectedRows: 0 });

			// Act
			const result = await repository.delete(999);

			// Assert
			expect(result).toBe(false);
		});
	});
});
