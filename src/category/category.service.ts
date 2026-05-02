import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetResponse } from '../common/interfaces/get-response.interface';
import { buildGetResponse } from '../common/utils/get-response.util';
import { ListCategoriesQueryDto } from './dto/list-categories-query.dto';
import { Category } from './entities/category.entity';
import { CATEGORY_SEED } from '../seed/data/categories.seed';

@Injectable()
export class CategoryService {

	constructor (
		@InjectRepository( Category )
		private readonly categoryRepository: Repository<Category>,
	) { }

	async findAll ( query: ListCategoriesQueryDto ): Promise<GetResponse<Category>> {
		const page = query.page ?? 1;
		const limit = query.limit ?? 100;
		const [ data, total ] = await this.categoryRepository.findAndCount( {
			order: { name: 'ASC' },
			skip: ( page - 1 ) * limit,
			take: limit,
		} );
		const lastPage = Math.max( 1, Math.ceil( total / limit ) );
		return buildGetResponse( data, { total, page, lastPage } );
	}

	async findBySlug ( slug: string ): Promise<Category | null> {
		return this.categoryRepository.findOne( { where: { slug } } );
	}

	/**
	 * Inserta categorías iniciales si aún no existen (idempotente por `slug`).
	 */
	async seedGeneralCategories (): Promise<{ inserted: number; total: number }> {
		let inserted = 0;
		for ( const row of CATEGORY_SEED ) {
			const exists = await this.categoryRepository.exist( { where: { slug: row.slug } } );
			if ( exists ) {
				continue;
			}
			await this.categoryRepository.insert( {
				name: row.name,
				slug: row.slug,
				hashtag: row.hashtag,
				amazonNodeId: row.amazonNodeId ?? null,
			} );
			inserted += 1;
		}
		const total = await this.categoryRepository.count();
		return { inserted, total };
	}
}
