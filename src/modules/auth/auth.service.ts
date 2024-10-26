import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { CheckUserDataDto } from './dto/check-user-data.dto';
import { isEmail } from 'class-validator';
import { Request } from 'express';
import { LoginDataDto } from './dto/login-data.dto';
import { TokenResponse } from '../../common/class/token-response/token-response';
import { Role } from '../roles/entities/role.entity';
import { RefreshTokensService } from '../refresh-tokens/refresh-tokens.service';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  private readonly REDIS_TTL_IN_MILLISECONDS =
    this.configService.get<number>('REDIS_TTL') * 1000;
  constructor(
    @InjectRepository(User) private readonly authRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly refreshTokensService: RefreshTokensService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Self-made registration
   * @param createAuthDto
   * @returns User
   */
  async register(createAuthDto: CreateAuthDto): Promise<User> {
    try {
      const { username, password, email, lastName, firstName, role } =
        createAuthDto;
      if (typeof email !== 'string') {
        throw new BadRequestException('Email should be string');
      }
      if (!isEmail(email)) {
        throw new BadRequestException('invalid email format');
      }
      await this.checkUserExists({
        email: email,
        username: username,
      });
      let assignedRole: Role;
      const userRoleName = role;
      if (userRoleName) {
        assignedRole = await this.roleRepository.findOne({
          where: { name: userRoleName },
        });
        if (!assignedRole) {
          throw new NotFoundException(
            `Role with name ${userRoleName} not found`,
          );
        }
      } else {
        assignedRole = await this.roleRepository.findOne({
          where: { name: 'User' },
        });
        console.log('assignedRole', assignedRole);
        if (!assignedRole) {
          throw new NotFoundException('Default role not found');
        }
      }
      const user = this.authRepository.create({
        lastName: lastName,
        firstName: firstName,
        username: username,
        email: email,
        password: password,
        role: assignedRole.id as unknown as Role,
      });
      await user.hashPassword();
      const savedUser = await this.authRepository.save(user);
      await this.cacheManager.set(
        `user_${savedUser.id}`,
        savedUser,
        this.REDIS_TTL_IN_MILLISECONDS,
      );
      return savedUser;
    } catch (error) {
      console.error('Error registering the user:', error.message);
      throw new InternalServerErrorException(
        'An error occurred while registering the user. Please check server logs for details.',
        error.message,
      );
    }
  }
  /**
   * Check if user exists
   * @param checkUserDataDto
   * @returns boolean
   */
  async checkUserExists(checkUserDataDto: CheckUserDataDto): Promise<boolean> {
    try {
      const { email, username } = checkUserDataDto;
      const [userByUsername, userByEmail] = await Promise.all([
        this.authRepository.findOne({ where: { username } }),
        this.authRepository.findOne({ where: { email } }),
      ]);
      if (userByUsername) {
        throw new BadRequestException('Username already exists');
      }
      if (userByEmail) {
        throw new BadRequestException('Email already exists');
      }
      return false;
    } catch (error) {
      throw new InternalServerErrorException(error.message);
    }
  }
  /**
   * Self-made validation
   * @param loginDataDto
   * @returns User
   */
  async validateUser(loginDataDto: LoginDataDto): Promise<User | null> {
    try {
      const { email, password } = loginDataDto;
      const user = await this.authRepository.findOne({ where: { email } });
      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        throw new BadRequestException('Incorrect password');
      }
      if (user && isPasswordValid) {
        return user;
      }
      return null;
    } catch (error) {
      console.error('Error validating user:', error.message);
      throw new InternalServerErrorException(
        'An error occurred while validating user. Please check server logs for details.',
        error.message,
      );
    }
  }
  /**
   * Self-made login
   * @param loginDataDto
   * @param request
   * @returns TokenResponse
   */
  async login(
    loginDataDto: LoginDataDto,
    request: Request,
  ): Promise<TokenResponse> {
    try {
      const { email, password } = loginDataDto;
      if (typeof email !== 'string') {
        throw new BadRequestException('Invalid email format');
      }
      if (!isEmail(email)) {
        throw new BadRequestException('Invalid email address');
      }
      const existingUser = await this.authRepository.findOne({
        where: { email: email },
      });
      if (!existingUser) {
        throw new NotFoundException('User not found');
      }
      if (!existingUser.isPasswordChanged && existingUser.isAdminsCreation) {
        throw new BadRequestException(
          'Please change your password before login',
        );
      }
      const isPasswordValid = await existingUser.comparePassword(password);
      if (!isPasswordValid) {
        throw new BadRequestException('Incorrect password');
      }
      existingUser.lastLogin = new Date();
      await this.authRepository.save(existingUser);
      const tokenDetails = await this.refreshTokensService.generateTokens(
        existingUser,
        request,
      );
      const tokenResponse: TokenResponse = {
        accessToken: tokenDetails.accessToken,
        refreshToken: tokenDetails.refreshToken,
        uniqueDeviceId: tokenDetails.uniqueDeviceId,
        session: request.session,
        sessionId: request.session.id,
      };
      return tokenResponse;
    } catch (error) {
      console.error('Error logging in:', error.message);
      throw new InternalServerErrorException(
        'An error occurred while logging in. Please check server logs for details.',
        error.message,
      );
    }
  }
  findAll() {
    return `This action returns all auth`;
  }

  findOne(id: number) {
    return `This action returns a #${id} auth`;
  }

  update(id: number, updateAuthDto: UpdateAuthDto) {
    return `This action updates a #${id} auth`;
  }

  remove(id: number) {
    return `This action removes a #${id} auth`;
  }
}
