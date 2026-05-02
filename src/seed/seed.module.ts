import { Module } from '@nestjs/common';
import { CommonModule } from '../common/common.module';
import { SeedService } from './seed.service';
import { SeedController } from './seed.controller';
import { CategoryModule } from '../category/category.module';

@Module( {
	controllers: [ SeedController ],
	providers: [ SeedService ],
	imports: [ CommonModule, CategoryModule ],
} )
export class SeedModule { }
