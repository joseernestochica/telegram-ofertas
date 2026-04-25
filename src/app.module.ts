import { join } from 'path';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServeStaticModule } from '@nestjs/serve-static';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { FileModule } from './file/file.module';
import { AuthModule } from './auth/auth.module';
import { LocationModule } from './location/location.module';
import { WebhookModule } from './webhook/webhook.module';
import { SendMessageModule } from './send-message/send-message.module';
import { ProfileModule } from './profile/profile.module';
import { AppController } from './app.controller';

@Module( {
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot( {
      ssl: process.env.STAGE === 'prod',
      extra: {
        ssl: process.env.STAGE === 'prod'
          ? { rejectUnauthorized: false }
          : null
      },
      type: 'postgres',
      host: process.env.DB_HOST,
      port: parseInt( process.env.DB_PORT, 10 ) || 5432,
      username: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      autoLoadEntities: true,
      synchronize: true,
    } ),
    ServeStaticModule.forRoot( {
      rootPath: join( __dirname, '..', 'public', 'dist', 'front', 'browser' ),
    } ),
    CommonModule,
    SeedModule,
    FileModule,
    AuthModule,
    LocationModule,
    WebhookModule,
    SendMessageModule,
    ProfileModule
  ],
  controllers: [ AppController ],
} )
export class AppModule { }


