import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { User } from '../users/entities/user.entity';
import { TokenResponse } from 'src/common/interface/token-response/token-response.interface';
import { CreateRefreshTokenDataDto } from './dto/create-refresh-token-data.dto';
import { LoginDataDto } from './dto/login-data.dto';
import { RefreshToken } from '../refresh-tokens/entities/refresh-token.entity';
import { Device } from '../devices/entities/device.entity';

describe('AuthController', () => {
  let authController: AuthController;
  let authService: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: {
            register: jest.fn(),
            refreshToken: jest.fn(),
            login: jest.fn(),
            revokeToken: jest.fn(),
            handleCron: jest.fn(),
          },
        },
      ],
    }).compile();

    authController = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });


  it('should be defined', () => {
    expect(authController).toBeDefined();
  });
   describe('register', () => {
     it('should call register and return a user', async () => {
       const createAuthDto: CreateAuthDto = {
         firstName: 'Test Category',
         email: '',
         username: '',
         password: '',
         lastName: '',
       };
       const result = {
         id: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
         ...createAuthDto,
       } as unknown as User;

       jest.spyOn(authService, 'register').mockResolvedValue(result);

       expect(await authController.register(createAuthDto)).toBe(result);
     });
   });
   describe('refreshToken', () => {
     it('should call refreshToken and return a token response', async () => {
       const result: TokenResponse = {
         accessToken: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
         refreshToken: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
         uniqueDeviceId: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
       };

       const createRefreshTokenDataDto: CreateRefreshTokenDataDto = {
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
       jest.spyOn(authService, 'refreshToken').mockResolvedValue(result);

       expect(
         await authController.refreshToken(
           createRefreshTokenDataDto,
           uniqueDeviceId,
           request as any
         ),
       ).toBe(result);
     });
   });
   describe('login', () => {
     it('should call login and return a token response', async () => {
       const result: TokenResponse = {
         accessToken: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
         refreshToken: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
         uniqueDeviceId: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
       };

       const loginDataDto: LoginDataDto = {
         email: 'abc@example.com',
         password: 'Passowrd1234&',
       }

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
       jest.spyOn(authService, 'login').mockResolvedValue(result);

       expect(
         await authController.login(loginDataDto, request as any),
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
       jest.spyOn(authService, 'revokeToken').mockResolvedValue(result);

       expect(await authController.revokeToken(refreshToken)).toBe(result);
     });
   });
   describe('cleanupTokens', () => {
     it('should call cleanupTokens and return a number of affected rows', async () => {
       const result = 1;
       jest.spyOn(authService, 'handleCron').mockResolvedValue(result);

       expect(await authController.cleanupTokens()).toBe(result);
     });
   });
});
