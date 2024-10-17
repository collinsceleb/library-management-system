/* eslint-disable prettier/prettier */
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../../modules/auth/auth.service';
import { LoginDataDto } from 'src/modules/auth/dto/login-data.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super();
  }

  async validate(loginDataDto: LoginDataDto) {
    const user = await this.authService.validateUser(loginDataDto);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
