import {
  BadRequestException,
  Inject,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreatePermissionDto } from './dto/create-permission.dto';
import { UpdatePermissionDto } from './dto/update-permission.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from './entities/permission.entity';

@Injectable()
export class PermissionsService {
  constructor(
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
  ) {}
  async createPermission(
    createPermissionDto: CreatePermissionDto,
  ): Promise<Permission> {
    try {
      const { name, description } = createPermissionDto;
      const existingPermission = await this.permissionRepository.findOne({
        where: { name },
      });
      if (existingPermission) {
        throw new BadRequestException('Permission already exists');
      }
      const permission = this.permissionRepository.create({
        name: name,
        description: description,
      });
      return await this.permissionRepository.save(permission);
    } catch (error) {
      console.error('Error creating permission:', error);
      throw new InternalServerErrorException(
        'An error occurred while creating permission. Please check server logs for details.',
        error,
      );
    }
  }

  findAll() {
    return `This action returns all permissions`;
  }

  findOne(id: number) {
    return `This action returns a #${id} permission`;
  }

  update(id: number, updatePermissionDto: UpdatePermissionDto) {
    return `This action updates a #${id} permission`;
  }

  remove(id: number) {
    return `This action removes a #${id} permission`;
  }
}
