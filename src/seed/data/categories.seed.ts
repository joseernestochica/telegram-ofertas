export interface CategorySeedRow {
	name: string;
	slug: string;
	hashtag: string;
	amazonNodeId?: string | null;
}

/** Categorías generalistas para Ganga Bot (Fase B). */
export const CATEGORY_SEED: CategorySeedRow[] = [
	{ name: 'Electrónica', slug: 'electronica', hashtag: '#Electrónica' },
	{ name: 'Informática', slug: 'informatica', hashtag: '#Informática' },
	{ name: 'Hogar', slug: 'hogar', hashtag: '#Hogar' },
	{ name: 'Moda', slug: 'moda', hashtag: '#Moda' },
	{ name: 'Belleza', slug: 'belleza', hashtag: '#Belleza' },
	{ name: 'Juguetes', slug: 'juguetes', hashtag: '#Juguetes' },
	{ name: 'Deportes', slug: 'deportes', hashtag: '#Deportes' },
	{ name: 'Libros', slug: 'libros', hashtag: '#Libros' },
	{ name: 'Bebé', slug: 'bebe', hashtag: '#Bebé' },
	{ name: 'Motor', slug: 'motor', hashtag: '#Motor' },
];
