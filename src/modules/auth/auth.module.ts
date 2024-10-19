import { forwardRef, Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { RefreshTokensModule } from '../refresh-tokens/refresh-tokens.module';
import { RolesModule } from '../roles/roles.module';
import { SharedModule } from '../../common/shared/shared.module';

@Module({
  imports: [
    forwardRef(() =>UsersModule),
    RefreshTokensModule,
    RolesModule,
    SharedModule
  ],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthModule, AuthService]
})
export class AuthModule {}
