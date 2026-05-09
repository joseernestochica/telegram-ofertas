import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';

import { ApiKeyGuard } from '../common/guards/api-key.guard';

import { GetResponse } from '../common/interfaces/get-response.interface';
import { HandleErrorService } from '../common/services/handle-error.service';
import { buildGetResponse } from '../common/utils/get-response.util';
import { SeedService } from './seed.service';

@ApiTags( 'Seed' )
@Controller( 'seed' )
export class SeedController {
	constructor (
		private readonly seedService: SeedService,
		private readonly handleErrorService: HandleErrorService,
	) { }

	@Get()
	@ApiHeader( { name: 'x-api-key', required: false, description: 'Opcional si usas Authorization Bearer' } )
	@UseGuards( ApiKeyGuard )
	async executeSeed (): Promise<GetResponse<{ ok: boolean; categories: { inserted: number; total: number } }>> {
		if ( process.env.STAGE === 'prod' ) {
			this.handleErrorService.handleForbiddenException( 'No disponible en producción' );
		}
		const payload = await this.seedService.runSeed();
		return buildGetResponse( payload );
	}

	/** Solo entornos no productivos: pobla categorías generalistas de forma idempotente. */
	@Get( 'categories' )
	@ApiHeader( { name: 'x-api-key', required: false, description: 'Opcional si usas Authorization Bearer' } )
	@UseGuards( ApiKeyGuard )
	async seedCategories (): Promise<GetResponse<{ ok: boolean; categories: { inserted: number; total: number } }>> {
		if ( process.env.STAGE === 'prod' ) {
			this.handleErrorService.handleForbiddenException( 'No disponible en producción' );
		}
		const payload = await this.seedService.runSeed();
		return buildGetResponse( payload );
	}

	/**
	 * Inserta ~100 `Deal` de demo repartidos entre categorías (requiere categorías sembradas).
	 * Idempotente por ASIN (re-ejecución solo incrementa `skipped`).
	 */
	@Get( 'demo-deals' )
	@ApiHeader( { name: 'x-api-key', required: false, description: 'Opcional si usas Authorization Bearer' } )
	@UseGuards( ApiKeyGuard )
	async seedDemoDeals (): Promise<GetResponse<{
		inserted: number;
		skipped: number;
		requested: number;
		categoriesUsed: number;
	}>> {
		if ( process.env.STAGE === 'prod' ) {
			this.handleErrorService.handleForbiddenException( 'No disponible en producción' );
		}
		const payload = await this.seedService.seedDemoDeals();
		return buildGetResponse( payload );
	}
}
