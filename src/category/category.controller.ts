import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetResponse } from '../common/interfaces/get-response.interface';
import { CategoryService } from './category.service';
import { ListCategoriesQueryDto } from './dto/list-categories-query.dto';
import { Category } from './entities/category.entity';

@ApiTags( 'Categories' )
@Controller( 'categories' )
export class CategoryController {

	constructor ( private readonly categoryService: CategoryService ) { }

	@Get()
	findAll (
		@Query() query: ListCategoriesQueryDto,
	): Promise<GetResponse<Category>> {
		return this.categoryService.findAll( query );
	}
}
