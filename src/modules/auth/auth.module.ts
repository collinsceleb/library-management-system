import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { HelperModule } from '../../common/utils/helper/helper.module';
import { DevicesModule } from '../devices/devices.module';
import { RefreshTokensModule } from '../refresh-tokens/refresh-tokens.module';
import { JwtStrategy } from '../../common/strategies/jwt.strategy';
import { RolesModule } from '../roles/roles.module';

@Module({
  imports: [
    PassportModule.register({ session: true, defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET_KEY'),
        signOptions: {
          expiresIn: `${configService.get<number>('JWT_EXPIRATION_TIME') * 1000}ms`,
        },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    HelperModule,
    DevicesModule,
    RefreshTokensModule,
    RolesModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
})
export class AuthModule {}
