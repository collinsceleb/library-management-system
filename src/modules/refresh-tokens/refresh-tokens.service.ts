import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateRefreshTokenDto } from './dto/create-refresh-token.dto';
import { UpdateRefreshTokenDto } from './dto/update-refresh-token.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RefreshToken } from './entities/refresh-token.entity';

@Injectable()
export class RefreshTokensService {
  constructor(
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
  ) {}

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
