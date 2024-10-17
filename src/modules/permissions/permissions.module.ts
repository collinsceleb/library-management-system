import { forwardRef, Module } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { PermissionsController } from './permissions.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Permission } from './entities/permission.entity';
import { RolesModule } from '../roles/roles.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Permission]),
    forwardRef(() => RolesModule),
    forwardRef(() => UsersModule),
  ], // Circular dependency],
  controllers: [PermissionsController],
  providers: [PermissionsService],
  exports: [TypeOrmModule],
})
export class PermissionsModule {}
