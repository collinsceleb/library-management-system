import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RefreshTokensService } from './refresh-tokens.service';
import { CreateRefreshTokenDto } from './dto/create-refresh-token.dto';
import { UpdateRefreshTokenDto } from './dto/update-refresh-token.dto';

@Controller('refresh-tokens')
export class RefreshTokensController {
  constructor(private readonly refreshTokensService: RefreshTokensService) {}

  @Patch('revoke-all-tokens-for-user/:userId')
  async revokeAllTokensForUser(@Param('userId') userId: string) {
    return await this.refreshTokensService.revokeAllTokensForUser(userId);
  }

  @Patch('revoke-all-tokens')
  async revokeAllTokens() {
    return await this.refreshTokensService.revokeAllTokens();
  }
}
