import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { User } from '../users/entities/user.entity';
import { TokenResponse } from '../../common/class/token-response/token-response';
import { LoginDataDto } from './dto/login-data.dto';

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
            login: jest.fn(),
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
  describe('login', () => {
    it('should call login and return a token response', async () => {
      const result: TokenResponse = {
        accessToken: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        refreshToken: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        uniqueDeviceId: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
        session: {},
        sessionId: 'XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX',
      };

      const loginDataDto: LoginDataDto = {
        email: 'abc@example.com',
        password: 'Passowrd1234&',
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
      jest.spyOn(authService, 'login').mockResolvedValue(result);

      expect(await authController.login(loginDataDto, request as any)).toBe(
        result,
      );
    });
  });
});
