import { Type } from 'class-transformer';
import {
	IsEnum,
	IsNumber,
	IsObject,
	IsOptional,
	IsString,
	IsUUID,
	Max,
	Min,
	MinLength,
} from 'class-validator';
import { DealSource, DealStatus } from '../entities/deal.enums';

export class UpsertDealDto {

	@IsString()
	@MinLength( 10 )
	asin: string;

	@IsString()
	title: string;

	@IsOptional()
	@IsString()
	imageUrl?: string | null;

	@IsOptional()
	@IsUUID()
	categoryId?: string | null;

	@IsOptional()
	@IsString()
	currency?: string;

	@IsNumber()
	@Min( 0 )
	oldPrice: number;

	@IsNumber()
	@Min( 0 )
	newPrice: number;

	@IsNumber()
	@Min( 0 )
	@Max( 100 )
	discountPct: number;

	@IsEnum( DealSource )
	source: DealSource;

	@IsOptional()
	@Type( () => Number )
	@IsNumber()
	@Min( 0 )
	@Max( 5 )
	ratingStars?: number;

	@IsOptional()
	@Type( () => Number )
	@IsNumber()
	@Min( 0 )
	reviewCount?: number;

	@IsOptional()
	@IsEnum( DealStatus )
	status?: DealStatus;

	/** URL corta para el canal (p. ej. https://amzlink.to/…); opcional. */
	@IsOptional()
	@IsString()
	telegramOfferUrl?: string | null;

	@IsOptional()
	@Type( () => Date )
	detectedAt?: Date;

	@IsOptional()
	@IsObject()
	externalPayload?: Record<string, unknown> | null;
}
