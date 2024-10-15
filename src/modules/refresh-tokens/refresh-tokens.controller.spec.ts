import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokensController } from './refresh-tokens.controller';
import { RefreshTokensService } from './refresh-tokens.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';

describe('RefreshTokensController', () => {
  let refreshTokenController: RefreshTokensController;
  let refreshTokenService: RefreshTokensService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RefreshTokensController],
      providers: [
        {
          provide: RefreshTokensService,
          useValue: {
            revokeAllTokensForUser: jest.fn(),
            revokeAllTokens: jest.fn(),
          },
        },
      ],
    }).compile();

    refreshTokenController = module.get<RefreshTokensController>(
      RefreshTokensController,
    );
    refreshTokenService =
      module.get<RefreshTokensService>(RefreshTokensService);
  });

  it('should be defined', () => {
    expect(refreshTokenController).toBeDefined();
  });
  describe('revokeAllTokensForUser', () => {
    it('should call revokeAllTokensForUser and return the result', async () => {
      const mockTokens: RefreshToken[] = [
        {
          id: 'token1',
          isActive: false,
          isRevoked: true,
          user: { id: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' } as User,
        },
        {
          id: 'token2',
          isActive: false,
          isRevoked: true,
          user: { id: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' } as User,
        },
      ] as RefreshToken[];
      jest
        .spyOn(refreshTokenService, 'revokeAllTokensForUser')
        .mockResolvedValue(mockTokens);

      const result = await refreshTokenController.revokeAllTokensForUser(
        'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      );
      expect(refreshTokenService.revokeAllTokensForUser).toHaveBeenCalledWith(
        'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      );
      expect(result).toEqual(mockTokens);
    });
  });
  describe('revokeAllTokens', () => {
    it('should call revokeAllTokens and return the result', async () => {
      const mockTokens: RefreshToken[] = [
        {
          id: 'token1',
          isActive: false,
          isRevoked: true,
          user: { id: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' } as User,
        },
        {
          id: 'token2',
          isActive: false,
          isRevoked: true,
          user: { id: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' } as User,
        },
      ] as RefreshToken[];
      jest
        .spyOn(refreshTokenService, 'revokeAllTokens')
        .mockResolvedValue(mockTokens);
      const result = await refreshTokenController.revokeAllTokens();

      expect(refreshTokenService.revokeAllTokens).toHaveBeenCalled();
      expect(result).toEqual(mockTokens);
    });
  });
});
