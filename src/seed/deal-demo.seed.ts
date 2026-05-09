import { Deal } from '../deal/entities/deal.entity';
import { DealSource, DealStatus } from '../deal/entities/deal.enums';
import { Category } from '../category/entities/category.entity';

const AFFILIATE_TAG = 'gangabot06-21';

/** Imagen de prueba (Picsum): misma semilla → misma foto; distinta por índice. Solo desarrollo. */
export function demoProductImageUrl ( index: number ): string {
	const seed = encodeURIComponent( `gangabot-demo-${ index }` );
	return `https://picsum.photos/seed/${ seed }/480/480`;
}

/** Reparto equitativo: `total` entre `categories.length` filas. */
export function distributeCounts ( total: number, bucketCount: number ): number[] {
	if ( bucketCount <= 0 ) {
		return [];
	}
	const base = Math.floor( total / bucketCount );
	const rem = total % bucketCount;
	return Array.from( { length: bucketCount }, ( _, i ) => base + ( i < rem ? 1 : 0 ) );
}

export function buildDemoDeal (
	index: number,
	category: Category,
): Pick<Deal, 'asin' | 'title' | 'imageUrl' | 'categoryId' | 'currency' | 'oldPrice' | 'newPrice' | 'discountPct' | 'affiliateUrl' | 'ratingStars' | 'reviewCount' | 'affiliateClickCount' | 'source' | 'status' | 'detectedAt' | 'publishedAt' | 'externalPayload'> {
	const asin = `B0${ String( index ).padStart( 8, '0' )}`;
	const oldPrice = 40 + ( index % 35 ) + Math.floor( index / 10 );
	const discountPct = 15 + ( index % 45 );
	const newPrice = Math.max( 0.01, Math.round( oldPrice * ( 100 - discountPct ) / 100 * 100 ) / 100 );
	const detectedAt = new Date( Date.now() - index * 60_000 );

	return {
		asin,
		title: `[Demo ${ index }] Oferta de prueba · ${ category.name }`,
		imageUrl: demoProductImageUrl( index ),
		categoryId: category.id,
		currency: 'EUR',
		oldPrice,
		newPrice,
		discountPct,
		affiliateUrl: `https://www.amazon.es/dp/${ asin }?tag=${ AFFILIATE_TAG }`,
		ratingStars: Math.min( 5, 3.5 + ( index % 5 ) * 0.3 ),
		reviewCount: 50 + index * 13,
		affiliateClickCount: index % 7,
		source: DealSource.MANUAL,
		status: DealStatus.PENDING,
		detectedAt,
		publishedAt: null,
		externalPayload: { demoSeed: true, index },
	};
}

export const DEFAULT_DEMO_DEALS_TOTAL = 100;
