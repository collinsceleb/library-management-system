import { Module } from '@nestjs/common';
import { RefreshTokensService } from './refresh-tokens.service';
import { RefreshTokensController } from './refresh-tokens.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { SharedModule } from '../../common/shared/shared.module';
import { DevicesModule } from '../devices/devices.module';
import { HelperModule } from '../../common/utils/helper/helper.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshToken]),
    SharedModule,
    DevicesModule,
    HelperModule,
  ],
  controllers: [RefreshTokensController],
  providers: [RefreshTokensService],
  exports: [TypeOrmModule, RefreshTokensModule, RefreshTokensService],
})
export class RefreshTokensModule {}
