import {
  Controller,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpCode,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { RefreshTokensService } from './refresh-tokens.service';
import { CreateRefreshTokenDto } from './dto/create-refresh-token.dto';
import { Request } from 'express';
import { ApiBearerAuth } from '@nestjs/swagger';
import { TokenResponse } from '../../common/interface/token-response/token-response.interface';

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
  @Post('refresh/:uniqueDeviceId')
  async refreshToken(
    @Body() createRefreshTokenDto: CreateRefreshTokenDto,
    @Param('uniqueDeviceId') uniqueDeviceId: string,
    @Req() request: Request,
  ): Promise<TokenResponse> {
    return await this.refreshTokensService.refreshToken(
      createRefreshTokenDto,
      uniqueDeviceId,
      request,
    );
  }
  @ApiBearerAuth()
  @Post('revoke')
  async revokeToken(@Body('refreshToken') refreshToken: string) {
    return await this.refreshTokensService.revokeToken(refreshToken);
  }

  @ApiBearerAuth()
  @Delete('tokens/cleanup')
  @HttpCode(HttpStatus.NO_CONTENT)
  async cleanupTokens(): Promise<number> {
    return await this.refreshTokensService.handleCron();
  }
}
