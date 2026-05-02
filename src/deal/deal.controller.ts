import {
	Body,
	Controller,
	Get,
	Param,
	ParseUUIDPipe,
	Patch,
	Post,
	Query,
	UseGuards,
} from '@nestjs/common';
import { ApiHeader, ApiTags } from '@nestjs/swagger';
import { ApiKeyGuard } from '../common/guards/api-key.guard';
import { GetResponse } from '../common/interfaces/get-response.interface';
import { buildGetResponse } from '../common/utils/get-response.util';
import { ListDealsQueryDto } from './dto/list-deals-query.dto';
import { UpsertDealDto } from './dto/upsert-deal.dto';
import { DealService } from './deal.service';
import { Deal } from './entities/deal.entity';

@ApiTags( 'Deals' )
@Controller( 'deals' )
export class DealController {

	constructor ( private readonly dealService: DealService ) { }

	@Get()
	findAll (
		@Query() query: ListDealsQueryDto,
	): Promise<GetResponse<Deal>> {
		return this.dealService.findAll( query );
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
