import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { PermissionsService } from './permissions.service';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { Permission } from './entities/permission.entity';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles/roles.guard';
import { Permissions } from '../../common/decorators/permissions/permissions.decorator';

@UseGuards(JwtAuthGuard, RolesGuard)
@ApiTags('Permissions')
@Controller('permissions')
export class PermissionsController {
  constructor(private readonly permissionsService: PermissionsService) {}

  @Post('create-permission')
  @Permissions('create_permission')
  async createPermission(
    @Body() createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    return await this.permissionsService.createPermission(createPermissionDto);
  }

  @Get()
  findAll() {
    return this.permissionsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.permissionsService.findOne(+id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updatePermissionDto: UpdatePermissionDto,
  ) {
    return this.permissionsService.update(+id, updatePermissionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.permissionsService.remove(+id);
  }
}
