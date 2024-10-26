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
import { ApiAcceptedResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TokenResponse } from '../../common/class/token-response/token-response';

@ApiTags('Refresh Tokens')
@Controller('refresh-tokens')
export class RefreshTokensController {
  constructor(private readonly refreshTokensService: RefreshTokensService) {}

  @Patch('revoke-all-tokens-for-user/:userId')
  @ApiBearerAuth()
  async revokeAllTokensForUser(@Param('userId') userId: string) {
    return await this.refreshTokensService.revokeAllTokensForUser(userId);
  }

  @Patch('revoke-all-tokens')
  @ApiBearerAuth()
  @HttpCode(HttpStatus.NO_CONTENT)
  async revokeAllTokens() {
    return await this.refreshTokensService.revokeAllTokens();
  }
  @Post('refresh/:uniqueDeviceId')
  @ApiAcceptedResponse({ type: TokenResponse, description: 'Token refreshed successfully' })
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
