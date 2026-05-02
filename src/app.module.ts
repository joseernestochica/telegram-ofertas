import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from './common/common.module';
import { SeedModule } from './seed/seed.module';
import { WebhookModule } from './webhook/webhook.module';
import { SendMessageModule } from './send-message/send-message.module';
import { CategoryModule } from './category/category.module';
import { DealModule } from './deal/deal.module';
import { AppController } from './app.controller';

@Module( {
		imports: [
		ConfigModule.forRoot( { isGlobal: true } ),
		TypeOrmModule.forRoot( {
			ssl: process.env.STAGE === 'prod',
			extra: {
				ssl: process.env.STAGE === 'prod'
					? { rejectUnauthorized: false }
					: null,
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
		CommonModule,
		CategoryModule,
		DealModule,
		SeedModule,
		WebhookModule,
		SendMessageModule,
	],
	controllers: [ AppController ],
} )
export class AppModule { }
