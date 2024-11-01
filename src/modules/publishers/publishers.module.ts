import { Module } from '@nestjs/common';
import { PublishersService } from './publishers.service';
import { PublishersController } from './publishers.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Publisher } from './entities/publisher.entity';
import { HelperModule } from '../../common/utils/helper/helper.module';

@Module({
  imports: [TypeOrmModule.forFeature([Publisher]), HelperModule],
  controllers: [PublishersController],
  providers: [PublishersService],
})
export class PublishersModule {}
