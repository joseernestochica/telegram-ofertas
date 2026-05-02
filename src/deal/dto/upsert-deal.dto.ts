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

	@IsString()
	affiliateUrl: string;

	@IsEnum( DealSource )
	source: DealSource;

	@IsOptional()
	@IsEnum( DealStatus )
	status?: DealStatus;

	@IsOptional()
	@Type( () => Date )
	detectedAt?: Date;

	@IsOptional()
	@IsObject()
	externalPayload?: Record<string, unknown> | null;
}
