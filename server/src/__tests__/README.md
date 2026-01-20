# Testing Guide

This directory contains all tests for the server application.

## Structure

```
__tests__/
├── setup.ts                    # Global test setup
├── utils/                      # Test utilities
│   ├── test-helpers.ts        # Helper functions for creating mocks
│   ├── factories.ts           # Test data factories
│   └── mocks.ts               # Common mocks for external dependencies
├── unit/                      # Unit tests
│   ├── index.test.ts         # Tests for main entry point
│   ├── services/             # Service unit tests
│   ├── controllers/          # Controller unit tests
│   └── repositories/         # Repository unit tests
└── integration/              # Integration tests (when needed)
```

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

## Writing Tests

### Unit Tests

Unit tests should:

- Test one unit of code in isolation
- Mock all external dependencies (repositories, services, APIs)
- Be fast and deterministic
- Test success, failure, and edge cases

### Example: Service Test

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

### Example: Controller Test

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

## Best Practices

1. **One responsibility per test**: Each test should verify one behavior
2. **Clear descriptions**: Use descriptive test names that explain what is being tested
3. **Arrange-Act-Assert**: Structure tests with clear sections
4. **Mock external dependencies**: Never use real databases or APIs in unit tests
5. **Test edge cases**: Include tests for null, undefined, empty values, etc.
6. **Keep tests independent**: Tests should not depend on each other
7. **Use factories**: Use factories for creating test data consistently

## Coverage Goals

- Aim for 70%+ coverage on business logic
- Focus on services and controllers
- Don't obsess over 100% coverage - focus on meaningful tests

## Mocking Guidelines

- Use `jest.fn()` for simple mocks
- Use `jest.spyOn()` when you need to spy on existing methods
- Use `jest.mock()` for module-level mocks
- Reset mocks in `afterEach` to ensure test isolation
