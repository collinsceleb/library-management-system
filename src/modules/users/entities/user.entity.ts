import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  JoinTable,
  ManyToMany,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import * as argon2 from 'argon2';
import { ApiProperty } from '@nestjs/swagger';
import { RefreshToken } from '../../refresh-tokens/entities/refresh-token.entity';
import { Device } from '../../devices/entities/device.entity';
import { Role } from '../../roles/entities/role.entity';
import { Permission } from '../../permissions/entities/permission.entity';

@Entity('users')
export class User {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @PrimaryGeneratedColumn('uuid', { name: 'id', primaryKeyConstraintName: 'PK_user_id' })
  id: string;

  @ApiProperty({ example: 'John' })
  @Column({ name: 'first_name' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  @Column({ name: 'last_name' })
  lastName: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  @Column({ unique: true })
  email: string;

  @ApiProperty({ example: 'johndoe' })
  @Column({ unique: true })
  username: string;

  @ApiProperty({ example: 'P@ssw0rd' })
  @Column()
  password: string;

  @ApiProperty({ example: true })
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty({ example: false })
  @Column({ name: 'is_deleted', default: false })
  isDeleted: boolean;

  @ApiProperty({ example: false })
  @Column({ name: 'is_blocked', default: false })
  isBlocked: boolean;

  @ApiProperty({ example: false })
  @Column({ name: 'is_admins_creation', default: false })
  isAdminsCreation: boolean;

  @ApiProperty({ example: false })
  @Column({ name: 'is_password_changed', default: false })
  isPasswordChanged: boolean;

  @ApiProperty({ example: false })
  @Column({ name: 'is_email_verified', default: false })
  isEmailVerified: boolean;

  @ApiProperty({ example: 'https://example.com/profile.jpg' })
  @Column({ name: 'profile_picture', nullable: true })
  profilePicture: string;

  @ApiProperty({ example: '2023-05-01T00:00:00.000Z' })
  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt: Date;

  @ApiProperty({ example: '2023-05-01T00:00:00.000Z' })
  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt: Date;

  @ApiProperty({ example: '2023-05-01T00:00:00.000Z' })
  @Column({ name: 'last_login', nullable: true, type: 'timestamptz' })
  lastLogin: Date;

  @ApiProperty()
  @OneToMany(() => RefreshToken, (refreshToken) => refreshToken.user)
  refreshTokens: RefreshToken[];

  @ApiProperty()
  @OneToMany(() => Device, (device) => device.user)
  devices: Device[];

  @ApiProperty()
  @ManyToOne(() => Role, (role) => role.users)
  @JoinColumn({ name: 'role_id', foreignKeyConstraintName: 'FK_user_role_id' })
  role: Role;

  @ApiProperty()
  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'user_permissions',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'fk_user_permissions_user_id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'fk_user_permissions_permission_id',
    },
  })
  permissions: Permission[];

  @ApiProperty()
  @ManyToMany(() => Permission)
  @JoinTable({
    name: 'user_denied_permissions',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_user_denied_permissions_user_id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
      foreignKeyConstraintName: 'FK_user_denied_permissions_permission_id',
    },
  })
  deniedPermissions: Permission[];

  async hashPassword(): Promise<void> {
    this.password = await argon2.hash(this.password);
  }

  async comparePassword(plainPassword: string): Promise<boolean> {
    return await argon2.verify(this.password, plainPassword);
  }
}
