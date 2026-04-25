import { Module } from '@nestjs/common';
import { SendMessageService } from './send-message.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '../common/common.module';
import { AuthModule } from '../auth/auth.module';

@Module( {
  imports: [
    HttpModule,
    ConfigModule,
    CommonModule,
    AuthModule
  ],
  controllers: [],
  providers: [ SendMessageService ],
  exports: [ SendMessageService ]
} )
export class SendMessageModule { }
