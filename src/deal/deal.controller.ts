import {
	Body,
	Controller,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	Res,
	UseGuards,
} from '@nestjs/common';
import {
	ApiBody,
	ApiHeader,
	ApiOperation,
	ApiProduces,
	ApiTags,
} from '@nestjs/swagger';
import { Response } from 'express';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { GetResponse } from '../common/interfaces/get-response.interface';
import { buildGetResponse } from '../common/utils/get-response.util';
import { DealFormatterService } from './deal-formatter.service';
import { DealPreviewCardService } from './deal-preview-card.service';
import { DealPublisherService } from './deal-publisher.service';
import { DealPreviewBodyDto } from './dto/deal-preview-body.dto';
import { ListDealsQueryDto } from './dto/list-deals-query.dto';
import { UpsertDealDto } from './dto/upsert-deal.dto';
import { DealService } from './deal.service';
import { Deal } from './entities/deal.entity';
import { DealPreviewPayload } from './interfaces/deal-preview-payload.interface';

@ApiTags( 'Deals' )
@Controller( 'deals' )
export class DealController {

	constructor (
		private readonly dealService: DealService,
		private readonly dealFormatterService: DealFormatterService,
		private readonly dealPreviewCardService: DealPreviewCardService,
		private readonly dealPublisherService: DealPublisherService,
	) { }

	@Get()
	findAll (
		@Query() query: ListDealsQueryDto,
	): Promise<GetResponse<Deal>> {
		return this.dealService.findAll( query );
	}

	@Get( ':id/preview-card' )
	@ApiOperation( {
		summary: 'Vista previa HTML de la ficha (útil en dev; abre el URL en el navegador)',
	} )
	@ApiProduces( 'text/html' )
	async previewCard (
		@Param( 'id', new ParseUUIDPipe( { version: '4' } ) ) id: string,
		@Query( 'expired' ) expired: string | undefined,
		@Res() res: Response,
	): Promise<void> {
		const deal = await this.dealService.findById( id );
		const html = this.dealPreviewCardService.render(
			deal,
			expired === '1' || expired === 'true',
		);
		res.type( 'html' ).send( html );
	}

	@Get( ':id' )
	async findOne (
		@Param( 'id', new ParseUUIDPipe( { version: '4' } ) ) id: string,
	): Promise<GetResponse<Deal>> {
		const deal = await this.dealService.findById( id );
		return buildGetResponse( deal );
	}

	@Post( 'upsert' )
	@ApiHeader( { name: 'x-api-key', required: false, description: 'Opcional si usas Authorization Bearer' } )
	@UseGuards( ApiKeyGuard )
	async upsert (
		@Body() dto: UpsertDealDto,
	): Promise<GetResponse<Deal>> {
		const deal = await this.dealService.upsertByAsin( dto );
		return buildGetResponse( deal );
	}

	@Post( ':id/preview' )
	@ApiHeader( { name: 'x-api-key', required: false, description: 'Opcional si usas Authorization Bearer' } )
	@ApiBody( { type: DealPreviewBodyDto, required: false } )
	@UseGuards( ApiKeyGuard )
	async preview (
		@Param( 'id', new ParseUUIDPipe( { version: '4' } ) ) id: string,
		@Body() body: DealPreviewBodyDto = {},
	): Promise<GetResponse<DealPreviewPayload>> {
		const deal = await this.dealService.findById( id );
		const payload = this.dealFormatterService.formatDealCaption( deal, {
			showExpiredBanner: body?.showExpiredBanner === true,
		} );
		return buildGetResponse( payload );
	}

	@Post( ':id/publish' )
	@ApiOperation( {
		summary: 'Publicar ficha en el canal de Telegram (foto + caption + botones). Persiste message_id para ediciones.',
	} )
	@ApiHeader( { name: 'x-api-key', required: false, description: 'Opcional si usas Authorization Bearer' } )
	@UseGuards( ApiKeyGuard )
	async publish (
		@Param( 'id', new ParseUUIDPipe( { version: '4' } ) ) id: string,
	): Promise<GetResponse<Deal>> {
		const deal = await this.dealPublisherService.publishDealToChannel( id );
		return buildGetResponse( deal );
	}

	@Patch( ':id/channel-expired' )
	@ApiOperation( {
		summary:
			'Editar en Telegram el mensaje ya publicado (banner «Finalizado»). Requiere ids persistidos.',
	} )
	@ApiHeader( { name: 'x-api-key', required: false, description: 'Opcional si usas Authorization Bearer' } )
	@UseGuards( ApiKeyGuard )
	async markExpiredOnChannel (
		@Param( 'id', new ParseUUIDPipe( { version: '4' } ) ) id: string,
	): Promise<GetResponse<Deal>> {
		const deal = await this.dealPublisherService.applyExpiredBannerOnChannel( id );
		return buildGetResponse( deal );
	}

	@Patch( ':id/published' )
	@ApiHeader( { name: 'x-api-key', required: false, description: 'Opcional si usas Authorization Bearer' } )
	@UseGuards( ApiKeyGuard )
	async markPublished (
		@Param( 'id', new ParseUUIDPipe( { version: '4' } ) ) id: string,
	): Promise<GetResponse<Deal>> {
		const deal = await this.dealService.markAsPublished( id );
		return buildGetResponse( deal );
	}

	@Patch( ':id/skipped' )
	@ApiHeader( { name: 'x-api-key', required: false, description: 'Opcional si usas Authorization Bearer' } )
	@UseGuards( ApiKeyGuard )
	async markSkipped (
		@Param( 'id', new ParseUUIDPipe( { version: '4' } ) ) id: string,
	): Promise<GetResponse<Deal>> {
		const deal = await this.dealService.markAsSkipped( id );
		return buildGetResponse( deal );
	}
}
