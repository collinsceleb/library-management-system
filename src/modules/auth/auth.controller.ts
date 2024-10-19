import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { UpdateAuthDto } from './dto/update-auth.dto';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { User } from '../users/entities/user.entity';
import { LoginDataDto } from './dto/login-data.dto';
import { Request } from 'express';
import { TokenResponse } from '../../common/interface/token-response/token-response.interface';

@Controller('auth')
@ApiTags('Auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  /**
   * Self-made registration
   * @param createAuthDto
   * @returns User
   */
  @Post('register')
  @ApiCreatedResponse({
    type: User,
    description: 'Self-made registration',
    status: 201,
    schema: { example: User },
  })
  async register(@Body() createAuthDto: CreateAuthDto) {
    return await this.authService.register(createAuthDto);
  }

  @Post('login')
  async login(
    @Body() loginDataDto: LoginDataDto,
    @Req() request: Request,
  ): Promise<TokenResponse> {
    return await this.authService.login(loginDataDto, request);
  }

  @Get()
  findAll() {
    return this.authService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.authService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAuthDto: UpdateAuthDto) {
    return this.authService.update(+id, updateAuthDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.authService.remove(+id);
  }
}
