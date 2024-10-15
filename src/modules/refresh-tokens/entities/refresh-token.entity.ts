import { ApiProperty } from '@nestjs/swagger';
import { Device } from '../../devices/entities/device.entity';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  Entity,
  Index,
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
  @Index('user_id_idx')
  user: User;

  @ApiProperty()
  @ManyToOne(() => Device, (device) => device.id)
  @JoinColumn({ name: 'device_id' })
  device: Device;

  @ApiProperty()
  @Column({ name: 'is_active', default: true })
  @Index('is_active_idx')
  isActive: boolean;

  @ApiProperty()
  @Column({ name: 'is_revoked', default: false })
  @Index('is_revoked_idx')
  isRevoked: boolean;

  @ApiProperty()
  @Column({ name: 'expires_at', nullable: true, type: 'timestamptz' })
  expiresAt: Date;
}
