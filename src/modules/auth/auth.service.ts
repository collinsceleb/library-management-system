import {
  BadRequestException,
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
import { TokenResponse } from '../../common/interface/token-response/token-response.interface';
import { Role } from '../roles/entities/role.entity';
import { RefreshTokensService } from '../refresh-tokens/refresh-tokens.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly authRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly refreshTokensService: RefreshTokensService,
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
      return await this.authRepository.save(user);
    } catch (error) {
      console.error('Error registering the user:', error.message);
      throw new InternalServerErrorException(
        'An error occurred while registering the user. Please check server logs for details.',
        error.message,
      );
    }
  }
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
  async login(
    loginDataDto: LoginDataDto,
    request: Request,
  ): Promise<TokenResponse> {
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
      throw new BadRequestException('Please change your password before login');
    }
    const user = await this.authRepository.findOne({ where: { email: email } });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      throw new BadRequestException('Incorrect password');
    }
    user.lastLogin = new Date();
    await this.authRepository.save(user);
    const tokenDetails = await this.refreshTokensService.generateTokens(user, request);
    return {
      accessToken: tokenDetails.accessToken,
      refreshToken: tokenDetails.refreshToken,
      uniqueDeviceId: tokenDetails.uniqueDeviceId,
    };
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
