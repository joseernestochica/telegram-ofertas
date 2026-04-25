import { Module } from '@nestjs/common';
import { SendMessageService } from './send-message.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from '../common/common.module';

@Module( {
	imports: [
		HttpModule,
		ConfigModule,
		CommonModule,
	],
	controllers: [],
	providers: [ SendMessageService ],
	exports: [ SendMessageService ],
} )
export class SendMessageModule { }
