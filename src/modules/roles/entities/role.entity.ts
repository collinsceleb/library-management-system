import { ApiProperty } from '@nestjs/swagger';
import { Permission } from '../../permissions/entities/permission.entity';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('roles')
export class Role {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @PrimaryGeneratedColumn('uuid',{ name: 'id', primaryKeyConstraintName: 'PK_role_id' })
  id: string;

  @ApiProperty({ example: 'admin' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ example: 'Administrator role' })
  @Column()
  description: string;

  @ApiProperty()
  @ManyToMany(() => Permission, (permission) => permission.roles)
  @JoinTable({
    name: 'role_permissions',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_role_permissions_role_id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_role_permissions_permission_id',
    },
  })
  permissions: Permission[];

  @ApiProperty()
  @ManyToMany(() => User, (user) => user.role)
  users: User[];
}
