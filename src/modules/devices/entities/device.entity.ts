import { ApiProperty } from '@nestjs/swagger';
import { User } from '../../users/entities/user.entity';
import {
  Column,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('device')
export class Device {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid', {
    name: 'id',
    primaryKeyConstraintName: 'PK_device_id',
  })
  id: string;

  @ApiProperty()
  @ManyToOne(() => User, (user) => user.devices)
  @JoinColumn({
    name: 'user_id',
    foreignKeyConstraintName: 'FK_device_user_id',
  })
  user: User;

  @ApiProperty()
  @Column({ name: 'unique_device_id' })
  uniqueDeviceId: string;

  @ApiProperty()
  @Column({ name: 'device_type' })
  deviceType: string;

  @ApiProperty()
  @Column({ name: 'device_vendor' })
  deviceVendor: string;

  @ApiProperty()
  @Column({ name: 'device_model' })
  deviceModel: string;

  @ApiProperty()
  @Column({ name: 'os_name' })
  osName: string;

  @ApiProperty()
  @Column({ name: 'os_version' })
  osVersion: string;

  @ApiProperty()
  @Column({ name: 'browser_name' })
  browserName: string;

  @ApiProperty()
  @Column({ name: 'browser_version' })
  browserVersion: string;

  @ApiProperty({
    example:
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.3',
    description: 'The user agent of the device.',
    type: String,
  })
  @Column({ name: 'user_agent' })
  userAgent: string;

  @ApiProperty({
    example: '192.168.1.100',
    description: 'The IP address of the device.',
    type: String,
  })
  @Column({ name: 'ip_address' })
  ipAddress: string;

  @ApiProperty({
    example: 'New York',
    description: 'The city where the device is located.',
    type: String,
  })
  @Column({ nullable: true })
  city: string;

  @ApiProperty({
    example: 'NY',
    description: 'The region where the device is located.',
    type: String,
  })
  @Column({ nullable: true })
  region: string;

  @ApiProperty({
    example: 'United States',
    description: 'The country where the device is located.',
    type: String,
  })
  @Column({ nullable: true })
  country: string;

  @ApiProperty({
    example: 40.7128,
    description: 'The latitude of the device location.',
    type: Number,
  })
  @Column({ nullable: true })
  latitude: number;

  @ApiProperty({
    example: -74.0059,
    description: 'The longitude of the device location.',
    type: Number,
  })
  @Column({ nullable: true })
  longitude: number;
}
