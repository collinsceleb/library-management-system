import { Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { DevicesModule } from './modules/devices/devices.module';
import { RefreshTokensModule } from './modules/refresh-tokens/refresh-tokens.module';
import { ScheduleModule } from '@nestjs/schedule';
import { RolesModule } from './modules/roles/roles.module';
import { PermissionsModule } from './modules/permissions/permissions.module';
import { SeedingService } from './common/seeding/seeding.service';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_NAME'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
        logging: false,
        migrations: [],
        subscribers: [],
      }),
    }),
    UsersModule,
    AuthModule,
    DevicesModule,
    RefreshTokensModule,
    RolesModule,
    PermissionsModule,
  ],
  controllers: [],
  providers: [SeedingService],
})
export class AppModule implements OnModuleInit {
  constructor(
    private readonly seedingService: SeedingService,
  ) {}
  async onModuleInit() {
    await this.seedingService.Initialize()
  }
}
