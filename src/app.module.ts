import {
  MiddlewareConsumer,
  Module,
  NestModule,
  OnModuleInit,
} from '@nestjs/common';
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
import { SharedModule } from './common/shared/shared.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-redis-store';
import Redis from 'ioredis';
import RedisStore from 'connect-redis';
import * as session from 'express-session';
import * as passport from 'passport';

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
    CacheModule.register({
      isGlobal: true,
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
        ttl: configService.get<number>('REDIS_TTL') * 1000,
      }),
      inject: [ConfigService],
    }),
    UsersModule,
    AuthModule,
    DevicesModule,
    RefreshTokensModule,
    RolesModule,
    PermissionsModule,
    SharedModule,
  ],
  controllers: [],
  providers: [SeedingService],
})
export class AppModule implements OnModuleInit, NestModule {
  constructor(
    private readonly seedingService: SeedingService,
    private readonly configService: ConfigService,
  ) {}
  configure(consumer: MiddlewareConsumer) {
    const redisClient = new Redis({
      host: this.configService.get<string>('REDIS_HOST'),
      port: this.configService.get<number>('REDIS_PORT'),
    });
    const RedisStoreInstance = new RedisStore({
      client: redisClient,
      ttl: this.configService.get<number>('REDIS_TTL') * 1000,
    });
    consumer
      .apply(
        session({
          store: RedisStoreInstance,
          secret: this.configService.get<string>('SESSION_SECRET'),
          resave: false,
          saveUninitialized: false,
          cookie: {
            maxAge: this.configService.get<number>('REDIS_TTL') * 1000,
            httpOnly: true,
            secure: this.configService.get<string>('NODE_ENV') === 'production', // Set to true in production
            sameSite: 'lax', // CSRF protection
            // domain: this.configService.get<string>('COOKIE_DOMAIN'),
          },
        }),
        passport.initialize(),
        passport.session(),
      )
      .forRoutes('*');
  }
  async onModuleInit() {
    // await this.seedingService.Initialize();
  }
}
