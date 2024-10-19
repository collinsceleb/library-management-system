import { Test, TestingModule } from '@nestjs/testing';
import { RefreshTokensController } from './refresh-tokens.controller';
import { RefreshTokensService } from './refresh-tokens.service';
import { RefreshToken } from './entities/refresh-token.entity';
import { User } from '../users/entities/user.entity';
import { TokenResponse } from 'src/common/interface/token-response/token-response.interface';
import { CreateRefreshTokenDto } from './dto/create-refresh-token.dto';
import { Device } from '../devices/entities/device.entity';

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
            refreshToken: jest.fn(),
            revokeToken: jest.fn(),
            handleCron: jest.fn(),
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
  describe('refreshToken', () => {
    it('should call refreshToken and return a token response', async () => {
      const result: TokenResponse = {
        accessToken: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        refreshToken: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        uniqueDeviceId: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      };

      const createRefreshTokenDto: CreateRefreshTokenDto = {
        refreshToken: '123e4567-e89b-12d3-a456-426614174001',
      };
      const request = {
        user: {
          id: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
          firstName: 'Test Category',
          email: 'abc@example.com',
          username: '',
          password: 'Passowrd1234&',
          lastName: '',
        },
      };

      const uniqueDeviceId = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
      jest.spyOn(refreshTokenService, 'refreshToken').mockResolvedValue(result);

      expect(
        await refreshTokenController.refreshToken(
          createRefreshTokenDto,
          uniqueDeviceId,
          request as any,
        ),
      ).toBe(result);
    });
  });
  describe('revokeToken', () => {
    it('should call revokeToken and return a refresh token object', async () => {
      const result: RefreshToken = {
        id: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        token: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        user: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX' as unknown as User,
        device: new Device(),
        isActive: false,
        isRevoked: false,
        expiresAt: undefined,
      };

      const refreshToken = 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';
      jest.spyOn(refreshTokenService, 'revokeToken').mockResolvedValue(result);

      expect(await refreshTokenController.revokeToken(refreshToken)).toBe(result);
    });
  });
  describe('cleanupTokens', () => {
    it('should call cleanupTokens and return a number of affected rows', async () => {
      const result = 1;
      jest.spyOn(refreshTokenService, 'handleCron').mockResolvedValue(result);

      expect(await refreshTokenController.cleanupTokens()).toBe(result);
    });
  });
});
