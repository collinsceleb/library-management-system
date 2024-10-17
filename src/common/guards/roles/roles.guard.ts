import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSIONS_KEY } from '../../decorators/permissions/permissions.decorator';
import { User } from '../../../modules/users/entities/user.entity';
import { Role } from '../../../modules/roles/entities/role.entity';
import { Request } from 'express';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );
    if (!requiredPermissions) {
      return true;
    }
    const request: Request = context.switchToHttp().getRequest();
    const user = request.user as User;
    console.log('user', user);

    if (!user) {
      return false;
    }
    const userWithRoles = await this.userRepository.findOne({
      where: { id: user.id },
      relations: ['role', 'role.permissions', 'permissions'],
    });
    console.log('userWithRoles', userWithRoles);

    if (!userWithRoles?.role) {
      return false;
    }

    // Combine both role-based and user-specific permissions
    const userPermissions = new Set<string>();

    // Add role-based permissions
    const roleWithPermissions = await this.roleRepository.findOne({
      where: { id: userWithRoles.role.id },
      relations: ['permissions'],
    });
    console.log(
      'roleWithPermissions.permissions',
      roleWithPermissions.permissions,
    );
    console.log('roleWithPermissions', roleWithPermissions);
    roleWithPermissions.permissions.forEach((permission) =>
      userPermissions.add(permission.name),
    );

    // Add user-specific granted permissions
    userWithRoles.permissions.forEach((permission) =>
      userPermissions.add(permission.name),
    );

    console.log('userPermissions', userPermissions);
    // Remove denied permissions from the final set
    userWithRoles.deniedPermissions?.forEach((permission) =>
      userPermissions.delete(permission.name),
    );
    return requiredPermissions.every((permission) =>
      userPermissions.has(permission),
    );
  }
}
