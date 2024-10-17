import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Permission } from '../../modules/permissions/entities/permission.entity';
import { Role } from '../../modules/roles/entities/role.entity';
import { User } from '../../modules/users/entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class SeedingService {
  private readonly SUPER_ADMIN_EMAIL =
    this.configService.get<string>('SUPER_ADMIN_EMAIL');
  private readonly SUPER_ADMIN_PASSWORD = this.configService.get<string>(
    'SUPER_ADMIN_PASSWORD',
  );
  private readonly SUPER_ADMIN_USERNAME = this.configService.get<string>(
    'SUPER_ADMIN_USERNAME',
  );
  private readonly SUPER_ADMIN_FIRST_NAME =
    this.configService.get<string>('SUPER_ADMIN_FIRST_NAME');
  private readonly SUPER_ADMIN_LAST_NAME = this.configService.get<string>(
    'SUPER_ADMIN_LAST_NAME',
  );
  private readonly SUPER_ADMIN_IS_VERIFIED = this.configService.get<boolean>(
    'SUPER_ADMIN_IS_VERIFIED',
  );
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Role) private readonly roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private readonly permissionRepository: Repository<Permission>,
    private readonly configService: ConfigService,
  ) {}
  async Initialize() {
    await this.createSuperAdminRole();
    await this.createSuperAdminUser();
    await this.createDefaultPermissions();
    await this.assignDefaultPermissionsToSuperAdmin();
    await this.assignSuperAdminToAllPermissions();
  }
  private async createSuperAdminRole(): Promise<Role> {
    try {
      const existingSuperAdminRole = await this.roleRepository.findOne({
        where: {
          name: 'Super Admin',
        },
      });
      if (!existingSuperAdminRole) {
        const newSuperAdminRole = this.roleRepository.create({
          name: 'Super Admin',
          description: 'Super Admin role',
        });
        return this.roleRepository.save(newSuperAdminRole);
      }
      return existingSuperAdminRole;
    } catch (error) {
      console.error('Error creating SuperAdmin role:', error);
      return null;
    }
  }
  private async createSuperAdminUser(): Promise<User> {
    try {
      const superAdminRole = await this.createSuperAdminRole();
      if (superAdminRole) {
        const existingSuperAdmin = await this.userRepository.findOne({
          where: {
            email: this.SUPER_ADMIN_EMAIL,
          },
        });
        if (!existingSuperAdmin) {
          const newSuperAdmin = this.userRepository.create({
            email: this.SUPER_ADMIN_EMAIL,
            password: this.SUPER_ADMIN_PASSWORD,
            username: this.SUPER_ADMIN_USERNAME,
            firstName: this.SUPER_ADMIN_FIRST_NAME,
            lastName: this.SUPER_ADMIN_LAST_NAME,
            isEmailVerified: this.SUPER_ADMIN_IS_VERIFIED,
            role: superAdminRole.id as unknown as Role,
          });
          await newSuperAdmin.hashPassword();
          return this.userRepository.save(newSuperAdmin);
        }
      }
      return null;
    } catch (error) {
      console.error('Error creating SuperAdmin:', error);
      return null;
    }
  }
  private async createDefaultPermissions(): Promise<void> {
    const defaultPermissions = [
      {
        name: 'create_permission',
        description: 'Permission to create permissions',
      },
      {
        name: 'create_role',
        description: 'Permission to create roles',
      },
      {
        name: 'assign_role_to_permission',
        description: 'Permission to assign role to permission',
      },
      {
        name: 'assign_permission_to_role',
        description: 'Permission to assign permission to role',
      },
      // ... other default permissions
    ];

    for (const permissionData of defaultPermissions) {
      const existingPermission = await this.permissionRepository.findOne({
        where: {
          name: permissionData.name,
        },
      });
      if (!existingPermission) {
        const newPermission = this.permissionRepository.create(permissionData);
        await this.permissionRepository.save(newPermission);
      }
    }
  }
  private async assignDefaultPermissionsToSuperAdmin(): Promise<void> {
    const superAdminRole = await this.roleRepository.findOne({
      where: {
        name: 'Super Admin',
      },
    });
    if (superAdminRole) {
      // Fetch all default permissions
      const defaultPermissions = await this.permissionRepository.find();

      // Assign all permissions to SuperAdmin role
      await Promise.all(
        defaultPermissions.map(async (permission) => {
          // Use QueryBuilder to update the role's permissions
          await this.roleRepository
            .createQueryBuilder()
            .relation(Role, 'permissions')
            .of(superAdminRole.id)
            .add(permission.id);
        }),
      );
    }
  }
  private async assignSuperAdminToAllPermissions(): Promise<void> {
    const superAdminRole = await this.roleRepository.findOne({
      where: {
        name: 'Super Admin',
      },
    });
    if (!superAdminRole) {
      throw new Error('SuperAdmin role not found');
    }
    // Fetch all permissions
    const permissions = await this.permissionRepository.find();

    await Promise.all(
      permissions.map(async (permission) => {
        await this.permissionRepository
          .createQueryBuilder()
          .relation(Permission, 'roles')
          .of(permission.id)
          .add(superAdminRole.id);
      }),
    );
  }
}
