import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AmazonModule } from '../amazon/amazon.module';
import { CommonModule } from '../common/common.module';
import { SendMessageModule } from '../send-message/send-message.module';
import { DealFormatterService } from './deal-formatter.service';
import { DealPreviewCardService } from './deal-preview-card.service';
import { DealPublisherService } from './deal-publisher.service';
import { DealController } from './deal.controller';
import { DealTrackController } from './deal-track.controller';
import { DealService } from './deal.service';
import { DealEvent } from './entities/deal-event.entity';
import { Deal } from './entities/deal.entity';

@Module( {
	imports: [
		AmazonModule,
		CommonModule,
		SendMessageModule,
		TypeOrmModule.forFeature( [ Deal, DealEvent ] ),
	],
	controllers: [ DealController, DealTrackController ],
	providers: [
		DealFormatterService,
		DealPreviewCardService,
		DealPublisherService,
		DealService,
	],
	exports: [ DealFormatterService, DealPublisherService, DealService ],
} )
export class DealModule { }
