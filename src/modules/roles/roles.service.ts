import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Role } from './entities/role.entity';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
  ) {}
  async createRole(createRoleDto: CreateRoleDto): Promise<Role> {
    try {
      const { name, description } = createRoleDto;
      const existingRole = await this.roleRepository.findOne({
        where: { name },
      });
      if (existingRole) {
        throw new BadRequestException('Role already exists');
      }
      const role = this.roleRepository.create({
        name: name,
        description: description,
      });
      return await this.roleRepository.save(role);
    } catch (error) {
      console.error('error creating role', error);      
      throw new InternalServerErrorException(
        'An error occurred while validating user. Please check server logs for details.',
        error,
      );
    }
  }

  findAll() {
    return `This action returns all roles`;
  }

  findOne(id: number) {
    return `This action returns a #${id} role`;
  }

  update(id: number, updateRoleDto: UpdateRoleDto) {
    return `This action updates a #${id} role`;
  }

  remove(id: number) {
    return `This action removes a #${id} role`;
  }
}
