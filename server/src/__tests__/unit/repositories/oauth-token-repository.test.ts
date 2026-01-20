import { OauthTokenRepository } from '../../../models/repositories/OauthTokenRepository';
import { OauthToken, OauthTokenDatabaseEntity } from '../../../models/entities/OauthToken';
import { Context } from '../../../services/Context';

describe('OauthTokenRepository', () => {
  // Mock OAuth token data matching OauthTokenDatabaseEntity
  const mockOauthTokenData: OauthTokenDatabaseEntity = {
    id: 1,
    user_id: 1,
    oauth_token: 'mock-oauth-token-12345abcdef',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    deleted_at: null,
  };

  // Helper to create mock context with chainable knex methods
  const createMockContext = () => {
    const mockQueryBuilder = {
      where: jest.fn().mockReturnThis(),
      whereNull: jest.fn().mockReturnThis(),
      first: jest.fn(),
      into: jest.fn().mockReturnThis(),
      returning: jest.fn(),
      update: jest.fn(),
    };

    // Create insert mock that returns the query builder
    const mockInsert = jest.fn().mockReturnValue(mockQueryBuilder);

    // Make the db callable (for db('table')) and have insert method
    const mockDb = Object.assign(jest.fn().mockReturnValue(mockQueryBuilder), {
      insert: mockInsert,
    });

    return {
      context: {
        db: mockDb,
      } as unknown as Context,
      mockQueryBuilder,
      mockDb,
      mockInsert,
    };
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('generateToken', () => {
    it('should generate a 64-character hex string', async () => {
      // Act
      const token = await OauthTokenRepository.generateToken();

      // Assert
      expect(token).toHaveLength(64); // 32 bytes = 64 hex characters
      expect(/^[a-f0-9]+$/.test(token)).toBe(true);
    });

    it('should generate unique tokens on each call', async () => {
      // Act
      const token1 = await OauthTokenRepository.generateToken();
      const token2 = await OauthTokenRepository.generateToken();

      // Assert
      expect(token1).not.toBe(token2);
    });
  });

  describe('create', () => {
    it('should create OAuth token and return OauthTokenRepository instance', async () => {
      // Arrange
      const { context, mockQueryBuilder, mockInsert } = createMockContext();
      const userId = 1;
      mockQueryBuilder.returning.mockResolvedValue([mockOauthTokenData]);

      // Act
      const result = await OauthTokenRepository.create(userId, context);

      // Assert
      expect(mockInsert).toHaveBeenCalledWith(
        expect.objectContaining({
          user_id: userId,
          oath_token: expect.any(String),
        })
      );
      expect(mockQueryBuilder.into).toHaveBeenCalledWith('oauth_token');
      expect(mockQueryBuilder.returning).toHaveBeenCalledWith('*');
      expect(result).toBeInstanceOf(OauthToken);
      expect(result.id).toBe(1);
      expect(result.user_id).toBe(1);
    });
  });

  describe('regenerate', () => {
    it('should regenerate token and return true on success', async () => {
      // Arrange
      const { context, mockQueryBuilder } = createMockContext();
      const oauthToken = new OauthTokenRepository(mockOauthTokenData);
      mockQueryBuilder.update.mockResolvedValue(1);

      // Act
      const result = await oauthToken.regenerate(context);

      // Assert
      expect(result).toBe(true);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('id', 1);
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          oath_token: expect.any(String),
          updated_at: expect.any(String),
        })
      );
    });

    it('should return false when token not found', async () => {
      // Arrange
      const { context, mockQueryBuilder } = createMockContext();
      const oauthToken = new OauthTokenRepository(mockOauthTokenData);
      mockQueryBuilder.update.mockResolvedValue(0);

      // Act
      const result = await oauthToken.regenerate(context);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('revoke', () => {
    it('should soft delete token by setting deleted_at', async () => {
      // Arrange
      const { context, mockQueryBuilder } = createMockContext();
      const oauthToken = new OauthTokenRepository(mockOauthTokenData);
      mockQueryBuilder.update.mockResolvedValue(1);

      // Act
      const result = await oauthToken.revoke(context);

      // Assert
      expect(result).toBe(true);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('id', 1);
      expect(mockQueryBuilder.whereNull).toHaveBeenCalledWith('deleted_at');
      expect(mockQueryBuilder.update).toHaveBeenCalledWith(
        expect.objectContaining({
          deleted_at: expect.any(String),
        })
      );
    });

    it('should return false when token not found or already deleted', async () => {
      // Arrange
      const { context, mockQueryBuilder } = createMockContext();
      const oauthToken = new OauthTokenRepository(mockOauthTokenData);
      mockQueryBuilder.update.mockResolvedValue(0);

      // Act
      const result = await oauthToken.revoke(context);

      // Assert
      expect(result).toBe(false);
    });
  });

  describe('findById', () => {
    it('should return OauthTokenRepository when found', async () => {
      // Arrange
      const { context, mockQueryBuilder } = createMockContext();
      mockQueryBuilder.first.mockResolvedValue(mockOauthTokenData);

      // Act
      const result = await OauthTokenRepository.findById(1, context);

      // Assert
      expect(result).toBeInstanceOf(OauthToken);
      expect(result?.id).toBe(1);
      expect(result?.oauth_token).toBe('mock-oauth-token-12345abcdef');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('id', 1);
      expect(mockQueryBuilder.whereNull).toHaveBeenCalledWith('deleted_at');
    });

    it('should return null when token not found', async () => {
      // Arrange
      const { context, mockQueryBuilder } = createMockContext();
      mockQueryBuilder.first.mockResolvedValue(undefined);

      // Act
      const result = await OauthTokenRepository.findById(999, context);

      // Assert
      expect(result).toBeNull();
    });

    it('should return null when token is soft deleted', async () => {
      // Arrange
      const { context, mockQueryBuilder } = createMockContext();
      mockQueryBuilder.first.mockResolvedValue(undefined); // whereNull filters out deleted

      // Act
      const result = await OauthTokenRepository.findById(1, context);

      // Assert
      expect(result).toBeNull();
      expect(mockQueryBuilder.whereNull).toHaveBeenCalledWith('deleted_at');
    });
  });

  describe('findByUserId', () => {
    it('should return OauthTokenRepository when found', async () => {
      // Arrange
      const { context, mockQueryBuilder } = createMockContext();
      mockQueryBuilder.first.mockResolvedValue(mockOauthTokenData);

      // Act
      const result = await OauthTokenRepository.findByUserId(1, context);

      // Assert
      expect(result).toBeInstanceOf(OauthToken);
      expect(result?.user_id).toBe(1);
      expect(mockQueryBuilder.where).toHaveBeenCalledWith('user_id', 1);
      expect(mockQueryBuilder.whereNull).toHaveBeenCalledWith('deleted_at');
    });

    it('should return null when token not found for user', async () => {
      // Arrange
      const { context, mockQueryBuilder } = createMockContext();
      mockQueryBuilder.first.mockResolvedValue(undefined);

      // Act
      const result = await OauthTokenRepository.findByUserId(999, context);

      // Assert
      expect(result).toBeNull();
    });

    it('should exclude soft deleted tokens', async () => {
      // Arrange
      const { context, mockQueryBuilder } = createMockContext();
      mockQueryBuilder.first.mockResolvedValue(undefined);

      // Act
      await OauthTokenRepository.findByUserId(1, context);

      // Assert
      expect(mockQueryBuilder.whereNull).toHaveBeenCalledWith('deleted_at');
    });
  });

  describe('findByOauthToken', () => {
    it('should return OauthTokenRepository when found', async () => {
      // Arrange
      const { context, mockQueryBuilder } = createMockContext();
      mockQueryBuilder.first.mockResolvedValue(mockOauthTokenData);

      // Act
      const result = await OauthTokenRepository.findByOauthToken(
        'mock-oauth-token-12345abcdef',
        context
      );

      // Assert
      expect(result).toBeInstanceOf(OauthToken);
      expect(result?.oauth_token).toBe('mock-oauth-token-12345abcdef');
      expect(mockQueryBuilder.where).toHaveBeenCalledWith(
        'oath_token',
        'mock-oauth-token-12345abcdef'
      );
      expect(mockQueryBuilder.whereNull).toHaveBeenCalledWith('deleted_at');
    });

    it('should return null when token not found', async () => {
      // Arrange
      const { context, mockQueryBuilder } = createMockContext();
      mockQueryBuilder.first.mockResolvedValue(undefined);

      // Act
      const result = await OauthTokenRepository.findByOauthToken('non-existent-token', context);

      // Assert
      expect(result).toBeNull();
    });

    it('should exclude soft deleted tokens', async () => {
      // Arrange
      const { context, mockQueryBuilder } = createMockContext();
      mockQueryBuilder.first.mockResolvedValue(undefined);

      // Act
      await OauthTokenRepository.findByOauthToken('some-token', context);

      // Assert
      expect(mockQueryBuilder.whereNull).toHaveBeenCalledWith('deleted_at');
    });
  });
});
