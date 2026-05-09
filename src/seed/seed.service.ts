import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../category/entities/category.entity';
import { DealEvent } from '../deal/entities/deal-event.entity';
import { Deal } from '../deal/entities/deal.entity';
import { DealEventType } from '../deal/entities/deal.enums';
import { HandleErrorService } from '../common/services/handle-error.service';
import { CategoryService } from '../category/category.service';
import {
	buildDemoDeal,
	DEFAULT_DEMO_DEALS_TOTAL,
	distributeCounts,
} from './deal-demo.seed';

@Injectable()
export class SeedService {

	constructor (
		private readonly categoryService: CategoryService,
		private readonly handleErrorService: HandleErrorService,
		@InjectRepository( Category )
		private readonly categoryRepository: Repository<Category>,
		@InjectRepository( Deal )
		private readonly dealRepository: Repository<Deal>,
		@InjectRepository( DealEvent )
		private readonly dealEventRepository: Repository<DealEvent>,
	) { }

	async runSeed (): Promise<{ ok: boolean; categories: { inserted: number; total: number } }> {
		const categories = await this.categoryService.seedGeneralCategories();
		return { ok: true, categories };
	}

	/**
	 * Inserta ofertas de demostración repartidas entre categorías (idempotente por `asin`).
	 * Requiere categorías existentes (ejecutar seed de categorías antes).
	 */
	async seedDemoDeals ( total: number = DEFAULT_DEMO_DEALS_TOTAL ): Promise<{
		inserted: number;
		skipped: number;
		requested: number;
		categoriesUsed: number;
	}> {
		const categories = await this.categoryRepository.find( { order: { slug: 'ASC' } } );
		if ( categories.length === 0 ) {
			this.handleErrorService.handleBadRequestException(
				'No hay categorías: ejecuta antes el seed de categorías (GET /api/seed/categories).',
			);
		}

		const counts = distributeCounts( total, categories.length );
		let inserted = 0;
		let skipped = 0;
		let globalIndex = 1;

		for ( let c = 0; c < categories.length; c += 1 ) {
			const cat = categories[ c ];
			const n = counts[ c ];
			for ( let k = 0; k < n; k += 1 ) {
				const row = buildDemoDeal( globalIndex, cat );
				const exists = await this.dealRepository.exist( { where: { asin: row.asin } } );
				if ( exists ) {
					skipped += 1;
					globalIndex += 1;
					continue;
				}
				const entity = this.dealRepository.create( row );
				const saved = await this.dealRepository.save( entity );
				await this.dealEventRepository.insert( {
					dealId: saved.id,
					type: DealEventType.DETECTED,
					metadata: { demoSeed: true },
				} );
				inserted += 1;
				globalIndex += 1;
			}
		}

		return {
			inserted,
			skipped,
			requested: total,
			categoriesUsed: categories.length,
		};
	}
}
