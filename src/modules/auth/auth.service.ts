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
import * as UAParser from 'ua-parser-js';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { HelperService } from '../../common/utils/helper/helper.service';
import { Request } from 'express';
import { JwtService } from '@nestjs/jwt';
import { Device } from '../devices/entities/device.entity';
import { RefreshToken } from '../refresh-tokens/entities/refresh-token.entity';
import { LoginDataDto } from './dto/login-data.dto';
import { JwtPayload } from '../../common/interface/jwt-payload/jwt-payload.interface';
import { CreateRefreshTokenDataDto } from './dto/create-refresh-token-data.dto';
import { TokenResponse } from 'src/common/interface/token-response/token-response.interface';

@Injectable()
export class AuthService {
  private readonly JWT_EXPIRATION_TIME =
    this.configService.get<number>('JWT_EXPIRATION_TIME') * 1000;
  constructor(
    @InjectRepository(User) private readonly authRepository: Repository<User>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly helperService: HelperService,
  ) {}

  /**
   * Self-made registration
   * @param createAuthDto
   * @returns User
   */
  async register(createAuthDto: CreateAuthDto): Promise<User> {
    try {
      if (typeof createAuthDto.email !== 'string') {
        throw new BadRequestException('Email should be string');
      }
      if (!isEmail(createAuthDto.email)) {
        throw new BadRequestException('invalid email format');
      }
      await this.checkUserExists({
        email: createAuthDto.email,
        username: createAuthDto.username,
      });
      const user = this.authRepository.create({
        lastName: createAuthDto.lastName,
        firstName: createAuthDto.firstName,
        username: createAuthDto.username,
        email: createAuthDto.email,
        password: createAuthDto.password,
      });
      await user.hashPassword();
      return await this.authRepository.save(user);
    } catch (error) {
      throw new InternalServerErrorException(error.message);
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
    const tokenDetails = await this.generateTokens(user, request);
    return {
      accessToken: tokenDetails.accessToken,
      refreshToken: tokenDetails.refreshToken,
      uniqueDeviceId: tokenDetails.uniqueDeviceId,
    };
  }
  async generateTokens(user: User, request: Request): Promise<TokenResponse> {
    try {
      // Generate random jwt ID for payload
      const jwtId = crypto.randomUUID();

      // Payload for the jwt
      const payload: JwtPayload = {
        sub: user.id,
        email: user.email,
        jwtId: jwtId,
      };

      // To retrieve user agent of the request
      const userAgent = request.headers['user-agent'];

      // Retrieve IP address of where the request is coming from
      const ipAddress = request.ip;

      // Retrieves device information from the retrieved user agent
      const deviceDetails = this.getUserAgentInfo(userAgent);
      // Generate Access token that will be short-lived
      const accessToken = this.jwtService.sign(payload, {
        expiresIn: '1h',
      });
      const location = await this.helperService.getLocation(ipAddress);
      let device = await this.deviceRepository.findOne({
        where: {
          user: user,
          deviceType: deviceDetails.device.type,
          deviceVendor: deviceDetails.device.vendor,
          deviceModel: deviceDetails.device.model,
          osName: deviceDetails.os.name,
          browserName: deviceDetails.browser.name,
        },
      });
      let uniqueDeviceId: string;
      if (device) {
        uniqueDeviceId = device.uniqueDeviceId;
        device.osVersion = deviceDetails.os.version;
        device.browserVersion = deviceDetails.browser.version;
        await this.deviceRepository.save(device);
      } else {
        uniqueDeviceId = crypto.randomUUID();
        device = this.deviceRepository.create({
          uniqueDeviceId,
          userAgent,
          ipAddress,
          user: user.id as unknown as User,
          deviceType: deviceDetails.device.type,
          deviceVendor: deviceDetails.device.vendor,
          deviceModel: deviceDetails.device.model,
          osName: deviceDetails.os.name,
          osVersion: deviceDetails.os.version,
          browserName: deviceDetails.browser.name,
          browserVersion: deviceDetails.browser.version,
          city: location.city,
          country: location.country,
          region: location.region,
          latitude: location.latitude,
          longitude: location.longitude,
        });
        await this.deviceRepository.save(device);
      }
      const refreshTokenPayload = {
        ...payload,
        uniqueDeviceId: uniqueDeviceId,
      };

      const token = this.jwtService.sign(refreshTokenPayload, {
        expiresIn: this.JWT_EXPIRATION_TIME,
      });
      const refreshToken = this.refreshTokenRepository.create({
        token: token,
        device: device,
        user: user,
        expiresAt: new Date(Date.now() + this.JWT_EXPIRATION_TIME),
      });
      await this.refreshTokenRepository.save(refreshToken);
      return { accessToken, refreshToken: refreshToken.token, uniqueDeviceId };
    } catch (error) {
      console.error('Error generating tokens', error.message);
      throw new InternalServerErrorException(
        'An error occurred while generating tokens. Please check server logs for details.',
        error.message,
      );
    }
  }

  async refreshToken(
    createRefreshTokenDataDto: CreateRefreshTokenDataDto,
    uniqueDeviceId: string,
    request: Request,
  ): Promise<TokenResponse> {
    try {
      const { refreshToken } = createRefreshTokenDataDto;
      const payload: JwtPayload = this.jwtService.verify(refreshToken);
      const device = await this.deviceRepository.findOne({
        where: {
          uniqueDeviceId: uniqueDeviceId,
          user: payload.sub as unknown as User,
        },
      });
      if (!device) {
        throw new NotFoundException('Device not found');
      }
      const userAgent = request.headers['user-agent'];
      const ipAddress = request.ip;
      const deviceDetails = this.getUserAgentInfo(userAgent);
      const location = await this.helperService.getLocation(ipAddress);
      await this.deviceRepository.update(
        { id: device.id },
        {
          userAgent,
          ipAddress,
          deviceModel: deviceDetails.device.model,
          deviceType: deviceDetails.device.type,
          deviceVendor: deviceDetails.device.vendor,
          browserName: deviceDetails.browser.name,
          browserVersion: deviceDetails.browser.version,
          osName: deviceDetails.os.name,
          osVersion: deviceDetails.os.version,
          city: location.city,
          country: location.country,
          region: location.region,
          latitude: location.latitude,
          longitude: location.longitude,
        },
      );
      const newJwtId = crypto.randomUUID();
      const newPayload: JwtPayload = {
        sub: payload.sub,
        email: payload.email,
        jwtId: newJwtId,
      };
      const newAccessToken = this.jwtService.sign(newPayload, {
        expiresIn: '1h',
      });
      const newRefreshToken = this.jwtService.sign(
        { ...newPayload, uniqueDeviceId: uniqueDeviceId },
        { expiresIn: this.JWT_EXPIRATION_TIME },
      );
      const newRefreshTokenDocument = this.refreshTokenRepository.create({
        token: newRefreshToken,
        device: device,
        user: payload.sub as unknown as User,
        expiresAt: new Date(Date.now() + this.JWT_EXPIRATION_TIME),
      });
      await this.refreshTokenRepository.save(newRefreshTokenDocument);
      return {
        accessToken: newAccessToken,
        refreshToken: newRefreshToken,
        uniqueDeviceId,
      };
    } catch (error) {
      console.error('Error refreshing tokens:', error.message);
      throw new InternalServerErrorException(
        'An error occurred while refreshing tokens. Please check server logs for details.',
        error.message,
      );
    }
  }

  // Function to retrieve device information based on the user agent
  private getUserAgentInfo(userAgent: string) {
    try {
      const userAgentInfo = UAParser(userAgent);
      return {
        browser: {
          name: userAgentInfo.browser.name || 'Unknown',
          version: userAgentInfo.browser.version || 'Unknown',
        },
        os: {
          name: userAgentInfo.os.name || 'Unknown',
          version: userAgentInfo.browser.version || 'unknown',
        },
        device: {
          type: userAgentInfo.device.type || 'Unknown',
          vendor: userAgentInfo.device.vendor || 'unknown',
          model: userAgentInfo.device.model || 'unknown',
        },
      };
    } catch (error) {
      console.error('Error fetching user agent information:', error.message);
      throw new InternalServerErrorException(
        'An error occurred while fetching user agent information. Please check server logs for details.',
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
