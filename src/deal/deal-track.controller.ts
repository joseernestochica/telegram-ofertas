import { Controller, Get, Param, ParseUUIDPipe, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { DealService } from './deal.service';

/** Redirección pública: cuenta el clic y envía a Amazon (sin API key). */
@ApiTags( 'Track' )
@Controller( 'track' )
export class DealTrackController {

	constructor ( private readonly dealService: DealService ) { }

	@Get( 'deals/:id' )
	@ApiOperation( {
		summary:
			'Redirige al enlace de afiliado del deal e incrementa el contador de clics del canal',
	} )
	async redirectToAffiliate (
		@Param( 'id', new ParseUUIDPipe( { version: '4' } ) ) id: string,
		@Res() res: Response,
	): Promise<void> {
		const target = await this.dealService.incrementAffiliateClickAndGetTargetUrl( id );
		res.redirect( 302, target );
	}
}
