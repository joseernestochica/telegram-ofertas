import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetResponse } from '../common/interfaces/get-response.interface';
import { AmazonService } from '../amazon/amazon.service';
import { HandleErrorService } from '../common/services/handle-error.service';
import { buildGetResponse } from '../common/utils/get-response.util';
import { ListDealsQueryDto } from './dto/list-deals-query.dto';
import { UpsertDealDto } from './dto/upsert-deal.dto';
import { DealEvent } from './entities/deal-event.entity';
import { Deal } from './entities/deal.entity';
import { DealEventType, DealStatus } from './entities/deal.enums';

@Injectable()
export class DealService {

	constructor (
		@InjectRepository( Deal )
		private readonly dealRepository: Repository<Deal>,
		@InjectRepository( DealEvent )
		private readonly dealEventRepository: Repository<DealEvent>,
		private readonly amazonService: AmazonService,
		private readonly handleErrorService: HandleErrorService,
	) { }

	async findAll ( query: ListDealsQueryDto ): Promise<GetResponse<Deal>> {
		const page = query.page ?? 1;
		const limit = query.limit ?? 50;
		const qb = this.dealRepository.createQueryBuilder( 'd' )
			.leftJoinAndSelect( 'd.category', 'category' )
			.orderBy( 'd.detectedAt', 'DESC' )
			.skip( ( page - 1 ) * limit )
			.take( limit );
		if ( query.status ) {
			qb.andWhere( 'd.status = :status', { status: query.status } );
		}
		const [ data, total ] = await qb.getManyAndCount();
		const lastPage = Math.max( 1, Math.ceil( total / limit ) );
		return buildGetResponse( data, { total, page, lastPage } );
	}

	async findById ( id: string ): Promise<Deal> {
		const deal = await this.dealRepository
			.createQueryBuilder( 'd' )
			.leftJoinAndSelect( 'd.category', 'category' )
			.leftJoinAndSelect( 'd.events', 'events' )
			.where( 'd.id = :id', { id } )
			.orderBy( 'events.createdAt', 'DESC' )
			.getOne();
		if ( !deal ) {
			this.handleErrorService.handleNotFoundException( `Deal ${ id } no encontrado` );
		}
		return deal;
	}

	async markAsPublished ( id: string ): Promise<Deal> {
		const deal = await this.dealRepository.findOne( { where: { id } } );
		if ( !deal ) {
			this.handleErrorService.handleNotFoundException( `Deal ${ id } no encontrado` );
		}
		deal.status = DealStatus.PUBLISHED;
		deal.publishedAt = new Date();
		await this.dealRepository.save( deal );
		await this.dealEventRepository.insert( {
			dealId: id,
			type: DealEventType.PUBLISHED,
			metadata: null,
		} );
		return this.findById( id );
	}

	async markAsSkipped ( id: string ): Promise<Deal> {
		const deal = await this.dealRepository.findOne( { where: { id } } );
		if ( !deal ) {
			this.handleErrorService.handleNotFoundException( `Deal ${ id } no encontrado` );
		}
		deal.status = DealStatus.SKIPPED;
		await this.dealRepository.save( deal );
		await this.dealEventRepository.insert( {
			dealId: id,
			type: DealEventType.SKIPPED,
			metadata: null,
		} );
		return this.findById( id );
	}

	async upsertByAsin ( dto: UpsertDealDto ): Promise<Deal> {
		try {
			const existing = await this.dealRepository.findOne( { where: { asin: dto.asin } } );
			const now = new Date();
			const currency = dto.currency ?? 'EUR';
			const status = dto.status ?? DealStatus.PENDING;
			const detectedAt = dto.detectedAt ?? now;
			const affiliateUrl = this.amazonService.buildAffiliateUrl( dto.asin );

			if ( !existing ) {
				const deal = this.dealRepository.create( {
					asin: dto.asin,
					title: dto.title,
					imageUrl: dto.imageUrl ?? null,
					categoryId: dto.categoryId ?? null,
					currency,
					oldPrice: dto.oldPrice,
					newPrice: dto.newPrice,
					discountPct: dto.discountPct,
					affiliateUrl,
					ratingStars: dto.ratingStars ?? null,
					reviewCount: dto.reviewCount ?? null,
					source: dto.source,
					status,
					detectedAt,
					publishedAt: null,
					externalPayload: dto.externalPayload ?? null,
				} );
				const saved = await this.dealRepository.save( deal );
				await this.dealEventRepository.insert( {
					dealId: saved.id,
					type: DealEventType.DETECTED,
					metadata: dto.externalPayload ?? null,
				} );
				return this.findById( saved.id );
			}

			existing.title = dto.title;
			existing.imageUrl = dto.imageUrl ?? null;
			existing.categoryId = dto.categoryId ?? null;
			existing.currency = currency;
			existing.oldPrice = dto.oldPrice;
			existing.newPrice = dto.newPrice;
			existing.discountPct = dto.discountPct;
			existing.affiliateUrl = affiliateUrl;
			if ( dto.ratingStars !== undefined ) {
				existing.ratingStars = dto.ratingStars;
			}
			if ( dto.reviewCount !== undefined ) {
				existing.reviewCount = dto.reviewCount;
			}
			existing.source = dto.source;
			existing.status = status;
			existing.detectedAt = detectedAt;
			existing.externalPayload = dto.externalPayload ?? null;
			await this.dealRepository.save( existing );
			return this.findById( existing.id );
		} catch ( error ) {
			if ( error instanceof HttpException ) {
				throw error;
			}
			this.handleErrorService.handleDBException( error );
		}
	}

	/** Incrementa el contador de clics y devuelve la URL de afiliado destino (HTTP 302). */
	async incrementAffiliateClickAndGetTargetUrl ( id: string ): Promise<string> {
		const result = await this.dealRepository.increment(
			{ id },
			'affiliateClickCount',
			1,
		);
		if ( !result.affected ) {
			this.handleErrorService.handleNotFoundException( `Deal ${ id } no encontrado` );
		}
		const row = await this.dealRepository.findOne( {
			where: { id },
			select: [ 'affiliateUrl' ],
		} );
		if ( !row ) {
			this.handleErrorService.handleNotFoundException( `Deal ${ id } no encontrado` );
		}
		return row.affiliateUrl.trim();
	}
}
