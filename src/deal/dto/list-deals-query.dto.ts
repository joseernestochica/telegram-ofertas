import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, Max, Min } from 'class-validator';
import { PaginationQueryDto } from '../../common/dto/pagination-query.dto';
import { DealStatus } from '../entities/deal.enums';

export class ListDealsQueryDto extends PaginationQueryDto {

	@IsOptional()
	@IsEnum( DealStatus )
	status?: DealStatus;

	@IsOptional()
	@Type( () => Number )
	@IsInt()
	@Min( 1 )
	@Max( 100 )
	override limit?: number;
}
