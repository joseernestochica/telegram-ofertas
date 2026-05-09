import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommonModule } from '../common/common.module';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { CategoryModule } from '../category/category.module';
import { Category } from '../category/entities/category.entity';
import { DealEvent } from '../deal/entities/deal-event.entity';
import { Deal } from '../deal/entities/deal.entity';

@Module( {
	controllers: [ SeedController ],
	providers: [ SeedService ],
	imports: [
		CommonModule,
		CategoryModule,
		TypeOrmModule.forFeature( [ Category, Deal, DealEvent ] ),
	],
} )
export class SeedModule { }
