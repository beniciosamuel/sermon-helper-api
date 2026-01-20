/**
 * Test data factories
 * Use factories to create consistent test data
 */

import { UserDatabaseEntity, UserCreateArgs } from '../../../models/entities/User';

/**
 * User database entity factory - creates mock user data matching UserDatabaseEntity interface
 */
export const createUserDatabaseEntityFactory = (overrides?: Partial<UserDatabaseEntity>): UserDatabaseEntity => {
	return {
		id: 1,
		full_name: 'Test User',
		email: 'test@example.com',
		phone: '+1234567890',
		password_hash: '$argon2id$v=19$m=65536,t=3,p=4$hashedPassword123',
		color_theme: 'light',
		lang: 'en',
		created_at: '2024-01-01T00:00:00.000Z',
		updated_at: '2024-01-01T00:00:00.000Z',
		deleted_at: null,
		...overrides,
	};
};

/**
 * User create args factory - creates mock user creation arguments
 */
export const createUserArgsFactory = (overrides?: Partial<UserCreateArgs>): UserCreateArgs => {
	return {
		name: 'Test User',
		email: 'test@example.com',
		phone: '+1234567890',
		password: 'plainPassword123',
		color_theme: 'light',
		language: 'en',
		...overrides,
	};
};

/**
 * @deprecated Use createUserDatabaseEntityFactory instead for UserDatabaseEntity
 * User factory - creates mock user data (legacy format)
 */
export const createUserFactory = (overrides?: Partial<any>) => {
	return {
		id: 1,
		name: 'Test User',
		email: 'test@example.com',
		phone: '+1234567890',
		password: 'hashedPassword123',
		color_theme: 'light',
		language: 'en',
		created_at: new Date('2024-01-01'),
		updated_at: new Date('2024-01-01'),
		deleted_at: null,
		...overrides,
	};
};

/**
 * OAuth token factory - creates mock OAuth token data
 */
export const createOAuthTokenFactory = (overrides?: Partial<any>) => {
	return {
		id: 1,
		user_id: 1,
		token: 'mock-oauth-token-12345',
		created_at: new Date('2024-01-01'),
		updated_at: new Date('2024-01-01'),
		deleted_at: null,
		...overrides,
	};
};

/**
 * Creates multiple instances using a factory
 */
export const createMultiple = <T extends { id?: number }>(
	factory: (overrides?: Partial<T>) => T,
	count: number,
	overrides?: Partial<T>
): T[] => {
	return Array.from({ length: count }, (_, index) =>
		factory({ ...overrides, id: index + 1 } as Partial<T>)
	);
};
