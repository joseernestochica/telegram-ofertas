import { Injectable } from '@nestjs/common';
import { CategoryService } from '../category/category.service';

@Injectable()
export class SeedService {

	constructor ( private readonly categoryService: CategoryService ) { }

	async runSeed (): Promise<{ ok: boolean; categories: { inserted: number; total: number } }> {
		const categories = await this.categoryService.seedGeneralCategories();
		return { ok: true, categories };
	}
}
