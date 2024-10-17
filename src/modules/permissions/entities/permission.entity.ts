import { ApiProperty } from '@nestjs/swagger';
import { Role } from '../../roles/entities/role.entity';
import { Column, Entity, ManyToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity('permission')
export class Permission {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174001' })
  @PrimaryGeneratedColumn('uuid', { name: 'id', primaryKeyConstraintName: 'PK_permission_id' })
  id: string;

  @ApiProperty({ example: 'create_user' })
  @Column({ unique: true })
  name: string;

  @ApiProperty({ example: 'Create a new user' })
  @Column()
  description: string;

  @ApiProperty()
  @ManyToMany(() => Role, (role) => role.permissions)
  roles: Role[];
}
