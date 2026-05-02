import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { DealController } from './deal.controller';
import { DealService } from './deal.service';
import { DealEvent } from './entities/deal-event.entity';
import { Deal } from './entities/deal.entity';

@Module( {
	imports: [
		CommonModule,
		TypeOrmModule.forFeature( [ Deal, DealEvent ] ),
	],
	controllers: [ DealController ],
	providers: [ DealService ],
	exports: [ DealService ],
} )
export class DealModule { }
