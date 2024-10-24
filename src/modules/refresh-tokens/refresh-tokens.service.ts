import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateRefreshTokenDto } from './dto/create-refresh-token.dto';
import { UpdateRefreshTokenDto } from './dto/update-refresh-token.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import * as UAParser from 'ua-parser-js';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JwtPayload } from '../../common/interface/jwt-payload/jwt-payload.interface';
import { TokenResponse } from '../../common/interface/token-response/token-response.interface';
import { HelperService } from '../../common/utils/helper/helper.service';
import { Device } from '../devices/entities/device.entity';
import { User } from '../users/entities/user.entity';
import { Request } from 'express';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';

@Injectable()
export class RefreshTokensService {
  private readonly JWT_EXPIRATION_TIME =
    this.configService.get<number>('JWT_EXPIRATION_TIME') * 1000;
  private readonly REDIS_TTL_IN_MILLISECONDS =
    this.configService.get<number>('REDIS_TTL') * 1000;
  constructor(
    @InjectRepository(RefreshToken)
    private readonly refreshTokenRepository: Repository<RefreshToken>,
    @InjectRepository(Device)
    private readonly deviceRepository: Repository<Device>,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    private readonly helperService: HelperService,
  ) {}

  async generateTokens(user: User, request: Request): Promise<TokenResponse> {
    try {
      // Generate random jwt ID for payload
      const jwtId = crypto.randomUUID();

      // Payload for the jwt
      const payload: JwtPayload = {
        sub: user.id as unknown as User,
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
      await this.cacheManager.set(
        `refreshToken-${token}`,
        refreshToken,
        this.REDIS_TTL_IN_MILLISECONDS,
      );
      return {
        accessToken,
        refreshToken: refreshToken.token,
        uniqueDeviceId,
        session: request.session,
      };
    } catch (error) {
      console.error('Error generating tokens', error.message);
      throw new InternalServerErrorException(
        'An error occurred while generating tokens. Please check server logs for details.',
        error.message,
      );
    }
  }

  async refreshToken(
    createRefreshTokenDto: CreateRefreshTokenDto,
    uniqueDeviceId: string,
    request: Request,
  ): Promise<TokenResponse> {
    try {
      const { refreshToken } = createRefreshTokenDto;
      if (typeof refreshToken !== 'string') {
        throw new BadRequestException('Invalid refresh token format');
      }
      const payload: JwtPayload = this.jwtService.verify(refreshToken);

      if (!payload) {
        throw new BadRequestException('Invalid refresh token');
      }
      if (typeof (payload.sub as unknown as User) !== 'string') {
        throw new BadRequestException(
          'Invalid user ID format. User ID should be a string',
        );
      }
      if (typeof uniqueDeviceId !== 'string') {
        throw new BadRequestException(
          'Invalid device ID format. Device ID should be a string',
        );
      }
      const isRevoked = await this.checkTokenRevocation(refreshToken);
      if (isRevoked) {
        throw new BadRequestException(
          'Refresh token has been revoked. Please login again.',
        );
      }
      const cachedToken: RefreshToken = await this.cacheManager.get(
        `refreshToken-${refreshToken}`,
      );
      let tokenDocument: RefreshToken;
      if (cachedToken) {
        tokenDocument = cachedToken;
      } else {
        tokenDocument = await this.findToken(refreshToken);
        if (!tokenDocument.token)
          throw new NotFoundException('Token not found');
      }
      const device = await this.deviceRepository.findOne({
        where: {
          uniqueDeviceId: uniqueDeviceId,
          user: payload.sub.id as unknown as User,
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
      await this.revokeToken(tokenDocument.token);
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
        session: request.session,
      };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        throw new BadRequestException('Refresh token has expired', error);
      } else if (error.name === 'JsonWebTokenError') {
        throw new BadRequestException('Invalid refresh token', error);
      } else {
        console.error('Error refreshing tokens:', error);
        throw new InternalServerErrorException(
          'An error occurred while refreshing tokens. Please check server logs for details.',
          error,
        );
      }
    }
  }

  async findToken(refreshToken: string): Promise<RefreshToken> {
    try {
      if (typeof refreshToken !== 'string') {
        throw new BadRequestException(
          'Invalid token format. Token should be a string',
        );
      }
      const payload: JwtPayload = this.jwtService.decode(refreshToken);
      if (!payload) {
        throw new BadRequestException('Invalid token');
      }
      const findToken = await this.refreshTokenRepository.findOne({
        where: { token: refreshToken },
        // relations: ['device', 'user'],
      });
      return findToken;
    } catch (error) {
      console.error('Error finding token:', error);
      throw new InternalServerErrorException('Failed to find token', error);
    }
  }

  /**
   * Function to revoke a refresh token
   * @param refreshToken
   * @returns findToken
   */
  async revokeToken(refreshToken: string): Promise<RefreshToken | null> {
    try {
      if (typeof refreshToken !== 'string') {
        throw new BadRequestException(
          'Invalid token format. Token should be a string',
        );
      }
      const payload: JwtPayload = this.jwtService.decode(refreshToken);
      if (!payload) {
        throw new BadRequestException('Invalid token');
      }
      await this.cacheManager.set(
        `refreshToken-${refreshToken}`,
        true,
        this.REDIS_TTL_IN_MILLISECONDS,
      );
      const tokenDocument = await this.findToken(refreshToken);
      if (!tokenDocument) {
        throw new NotFoundException('Token not found');
      }
      if (tokenDocument.isRevoked) {
        throw new BadRequestException('Token is already revoked');
      }
      tokenDocument.isRevoked = true;
      tokenDocument.isActive = false;
      await this.refreshTokenRepository.save(tokenDocument);
      return tokenDocument;
    } catch (error) {
      console.error('Error revoking token:', error);
      throw new InternalServerErrorException(
        'An error occurred while revoking token. Please check server logs for details.',
        error.message,
      );
    }
  }
  async removeRevokedTokens(): Promise<number> {
    try {
      const result = await this.refreshTokenRepository.delete({
        isRevoked: true,
      });
      const totalCount = result.affected || 0;
      return totalCount;
    } catch (error) {
      console.error('Error revoking all tokens:', error);
      throw new InternalServerErrorException(
        'An error occurred while revoking all tokens. Please check server logs for details.',
        error.message,
      );
    }
  }
  async checkTokenRevocation(refreshToken: string): Promise<boolean> {
    try {
      if (typeof refreshToken !== 'string') {
        throw new BadRequestException(
          'Invalid token format. Token should be a string',
        );
      }
      const payload: JwtPayload = this.jwtService.decode(refreshToken);
      if (!payload) {
        throw new BadRequestException('Invalid token');
      }
      const tokenDocument = await this.findToken(refreshToken);
      if (!tokenDocument) {
        throw new NotFoundException('Token not found');
      }
      if (tokenDocument.isRevoked) {
        throw new BadRequestException('Token is already revoked');
      }
      return false;
    } catch (error) {
      console.error('Error checking token revocation:', error);
      throw new InternalServerErrorException(
        'An error occurred while checking token revocation. Please check server logs for details.',
        error.message,
      );
    }
  }
  /**
   * Function to handle cron jobs
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async handleCron(): Promise<number> {
    return await this.removeRevokedTokens();
  }
  /**
   * Function to get user agent information
   * @param userAgent
   * @returns
   */
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

  /**
   * Function to revoke all tokens for a user
   * @param userId
   * @returns tokens
   */
  async revokeAllTokensForUser(userId: string): Promise<RefreshToken[]> {
    try {
      if (typeof userId !== 'string') {
        throw new BadRequestException(
          'Invalid user ID format. User ID should be a string',
        );
      }
      const tokens = await this.refreshTokenRepository.find({
        where: { user: { id: userId }, isActive: true, isRevoked: false },
      });
      tokens.forEach((token) => {
        token.isRevoked = true;
        token.isActive = false;
      });
      await this.refreshTokenRepository.save(tokens);
      return tokens;
    } catch (error) {
      console.error('Error revoking all tokens for user:', error);
      throw new InternalServerErrorException(
        'An error occurred while revoking all tokens for user. Please check server logs for details.',
        error.message,
      );
    }
  }
  /**
   * Function to revoke all tokens
   * @returns tokens
   */
  async revokeAllTokens(): Promise<RefreshToken[]> {
    try {
      const tokens = await this.refreshTokenRepository.find({
        where: { isActive: true, isRevoked: false },
      });
      tokens.forEach((token) => {
        token.isRevoked = true;
        token.isActive = false;
      });
      await this.refreshTokenRepository.save(tokens);
      return tokens;
    } catch (error) {
      console.error('Error revoking all tokens:', error);
      throw new InternalServerErrorException(
        'An error occurred while revoking all tokens. Please check server logs for details.',
        error.message,
      );
    }
  }
  create(createRefreshTokenDto: CreateRefreshTokenDto) {
    return 'This action adds a new refreshToken';
  }

  findAll() {
    return `This action returns all refreshTokens`;
  }

  findOne(id: number) {
    return `This action returns a #${id} refreshToken`;
  }

  update(id: number, updateRefreshTokenDto: UpdateRefreshTokenDto) {
    return `This action updates a #${id} refreshToken`;
  }

  remove(id: number) {
    return `This action removes a #${id} refreshToken`;
  }
}
