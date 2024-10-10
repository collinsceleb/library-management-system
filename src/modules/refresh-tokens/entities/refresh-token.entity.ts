import { ApiProperty } from '@nestjs/swagger';
import { Device } from 'src/modules/devices/entities/device.entity';
import { User } from 'src/modules/users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('refresh_token')
export class RefreshToken {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  token: string;

  @ApiProperty()
  @ManyToOne(() => User, (user) => user.refreshTokens)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty()
  @ManyToOne(() => Device, (device) => device.id)
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @ApiProperty()
  @Column({ name: 'is_active', default: true })
  isActive: boolean;

  @ApiProperty()
  @Column({ name: 'is_revoked', default: false })
  isRevoked: boolean;

  @ApiProperty()
  @Column({ name: 'expires_at', nullable: true, type: 'timestamptz' })
  expiresAt: Date;
}
