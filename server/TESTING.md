# Testing Setup Documentation

## Overview

This document describes the Jest testing framework setup for the TypeScript Node.js backend application.

## Configuration

### Jest Configuration (`jest.config.ts`)

The Jest configuration is located at the root of the server directory and includes:

- **TypeScript Support**: Uses `ts-jest` preset for TypeScript compilation
- **Test Environment**: Node.js environment
- **Test Patterns**: Matches `*.test.ts` and `*.spec.ts` files
- **Coverage**: Configured with 70% thresholds and multiple reporters (text, lcov, html)
- **Setup Files**: Global setup file runs before all tests

### Dependencies

The following testing dependencies have been installed:

- `jest`: Testing framework
- `ts-jest`: TypeScript support for Jest
- `@types/jest`: TypeScript types for Jest
- `supertest`: HTTP assertion library for testing Express routes
- `@types/supertest`: TypeScript types for supertest
- `ts-node`: Required for parsing TypeScript config files

## Test Structure

```
server/
├── jest.config.ts                    # Jest configuration
├── src/
│   ├── __tests__/
│   │   ├── setup.ts                  # Global test setup
│   │   ├── utils/
│   │   │   ├── test-helpers.ts      # Mock Express request/response helpers
│   │   │   ├── factories.ts          # Test data factories
│   │   │   └── mocks.ts             # Common mocks for external services
│   │   ├── unit/
│   │   │   ├── index.test.ts        # Health endpoint tests
│   │   │   ├── services/            # Service unit tests
│   │   │   ├── controllers/         # Controller unit tests
│   │   │   └── repositories/        # Repository unit tests
│   │   └── README.md                 # Testing guide
│   └── index.ts                      # Application entry point
└── package.json
```

## Running Tests

### Basic Commands

```bash
# Run all tests
npm test

# Run tests in watch mode (useful during development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Scripts

The following scripts are available in `package.json`:

- `test`: Run all tests once
- `test:watch`: Run tests in watch mode (re-runs on file changes)
- `test:coverage`: Generate coverage report

## Writing Tests

### Unit Test Example: Service

```typescript
describe('UserService', () => {
  let service: UserService;
  let mockRepository: jest.Mocked<UserRepository>;

  beforeEach(() => {
    mockRepository = {
      findById: jest.fn(),
      create: jest.fn(),
    };
    service = new UserService(mockRepository);
  });

  it('should return user when found', async () => {
    const mockUser = { id: 1, name: 'John' };
    mockRepository.findById.mockResolvedValue(mockUser);

    const result = await service.getUser(1);

    expect(result).toEqual(mockUser);
    expect(mockRepository.findById).toHaveBeenCalledWith(1);
  });
});
```

### Unit Test Example: Controller

```typescript
describe('UserController', () => {
  let controller: UserController;
  let mockService: jest.Mocked<UserService>;
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;

  beforeEach(() => {
    mockService = { getUser: jest.fn() };
    controller = new UserController(mockService);
    mockRequest = createMockRequest();
    mockResponse = createMockResponse();
  });

  it('should return 200 with user data', async () => {
    const mockUser = { id: 1, name: 'John' };
    mockService.getUser.mockResolvedValue(mockUser);
    mockRequest.params = { id: '1' };

    await controller.getUser(mockRequest as Request, mockResponse as Response);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
  });
});
```

## Test Utilities

### Test Helpers (`utils/test-helpers.ts`)

- `createMockRequest()`: Creates a mock Express Request object
- `createMockResponse()`: Creates a mock Express Response object with jest mocks
- `createMockNext()`: Creates a mock Express NextFunction
- `wait()`: Utility for async testing
- `expectToThrow()`: Helper for testing error scenarios

### Factories (`utils/factories.ts`)

- `createUserFactory()`: Creates mock user data
- `createOAuthTokenFactory()`: Creates mock OAuth token data
- `createMultiple()`: Creates multiple instances using a factory

### Mocks (`utils/mocks.ts`)

- `mockSecretManager`: Mock for Google Cloud Secret Manager
- `mockDatabase`: Mock for database connections
- `mockSocketIO`: Mock for Socket.IO
- `resetAllMocks()`: Resets all mocks

## Best Practices

1. **One Responsibility**: Each test should verify one behavior
2. **Clear Descriptions**: Use descriptive test names
3. **Arrange-Act-Assert**: Structure tests clearly
4. **Mock External Dependencies**: Never use real databases or APIs in unit tests
5. **Test Edge Cases**: Include tests for null, undefined, empty values
6. **Independent Tests**: Tests should not depend on each other
7. **Use Factories**: Use factories for consistent test data

## Coverage

Coverage thresholds are set to 70% for:

- Branches
- Functions
- Lines
- Statements

Coverage reports are generated in multiple formats:

- **Text**: Console output
- **LCOV**: For CI/CD integration
- **HTML**: Visual report in `coverage/` directory
- **JSON Summary**: For programmatic access

## Example Tests

The setup includes example tests demonstrating:

1. **Service Tests** (`example-service.test.ts`): Shows how to test services with mocked repositories
2. **Controller Tests** (`example-controller.test.ts`): Shows how to test controllers with mocked services
3. **Repository Tests** (`example-repository.test.ts`): Shows how to test repositories with mocked database connections
4. **Route Tests** (`index.test.ts`): Shows how to test Express routes using supertest

These examples can be used as templates when writing tests for your actual services, controllers, and repositories.

## Next Steps

1. **Write Tests for Your Services**: Replace example tests with tests for your actual services
2. **Write Tests for Your Controllers**: Test your actual route handlers
3. **Write Tests for Your Repositories**: Test your database access layer
4. **Add Integration Tests**: Consider adding integration tests in `__tests__/integration/` for testing multiple layers together
5. **Set Up CI/CD**: Configure your CI/CD pipeline to run tests automatically

## Troubleshooting

### Tests not running

- Ensure all dependencies are installed: `npm install`
- Check that test files match the pattern: `*.test.ts` or `*.spec.ts`
- Verify Jest configuration in `jest.config.ts`

### TypeScript errors in tests

- Ensure `ts-jest` is properly configured
- Check that `tsconfig.json` is compatible with Jest settings
- Verify all type definitions are installed

### Coverage not generating

- Run `npm run test:coverage`
- Check that files are not excluded in `jest.config.ts`
- Verify coverage directory permissions
