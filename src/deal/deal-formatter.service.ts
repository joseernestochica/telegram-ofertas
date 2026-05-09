import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { buildDealAffiliateTrackingUrl } from '../common/utils/deal-tracking-url.util';
import { escapeTelegramHtml } from '../common/utils/escape-telegram-html.util';
import {
	formatIntegerEs,
	formatMoneyEUR,
	formatReviewCountEs,
} from '../common/utils/format-money.util';
import { Deal } from './entities/deal.entity';
import { DealPreviewPayload } from './interfaces/deal-preview-payload.interface';

const LEGAL_NOTICE =
	'Como Afiliado de Amazon obtengo ingresos por las compras adscritas.';

@Injectable()
export class DealFormatterService {

	private templateCache: string | null = null;

	constructor ( private readonly configService: ConfigService ) { }

	private loadTemplate (): string {
		if ( this.templateCache ) {
			return this.templateCache;
		}
		const filePath = path.resolve( __dirname, '../../static/tpl/deal.html' );
		this.templateCache = fs.readFileSync( filePath, 'utf8' );
		return this.templateCache;
	}

	private escapeHref ( url: string ): string {
		return url.replace( /&/g, '&amp;' );
	}

	private formatRatingStars ( stars: number ): string {
		const hasDecimal = stars % 1 !== 0;
		return new Intl.NumberFormat( 'es-ES', {
			minimumFractionDigits: hasDecimal ? 1 : 0,
			maximumFractionDigits: 1,
		} ).format( stars );
	}

	private buildRatingLine ( deal: Deal ): string {
		const hasStars = deal.ratingStars != null && !Number.isNaN( deal.ratingStars );
		const hasReviews = deal.reviewCount != null && deal.reviewCount >= 0;
		if ( !hasStars && !hasReviews ) {
			return '';
		}
		const parts: string[] = [];
		if ( hasStars ) {
			parts.push(
				`⭐ <b>${ escapeTelegramHtml( this.formatRatingStars( deal.ratingStars! ) ) }</b>/5`,
			);
		}
		if ( hasReviews ) {
			parts.push(
				`${ escapeTelegramHtml( formatReviewCountEs( deal.reviewCount! ) ) } valoraciones`,
			);
		}
		return `${ parts.join( ' · ' ) }\n\n`;
	}

	private categoryHashtagLine ( deal: Deal ): string {
		const raw = deal.category?.hashtag?.trim();
		if ( !raw ) {
			return '';
		}
		const withHash = raw.startsWith( '#' ) ? raw : `#${ raw }`;
		return `<b>${ escapeTelegramHtml( withHash ) }</b>\n\n`;
	}

	formatDealCaption (
		deal: Deal,
		options?: { showExpiredBanner?: boolean },
	): DealPreviewPayload {
		const showExpiredBanner = options?.showExpiredBanner === true;
		const tpl = this.loadTemplate();

		const categoryLine = this.categoryHashtagLine( deal );

		const discountLine = !showExpiredBanner
			? `🔥 <b>-${ Math.round( deal.discountPct ) }%</b>\n\n`
			: '';

		const title = escapeTelegramHtml( deal.title.trim() );
		const titleLine = `<b>${ title }</b>\n\n`;

		const newPrice = formatMoneyEUR( deal.newPrice );
		const oldPrice = formatMoneyEUR( deal.oldPrice );
		const savingsAmt =
			Math.round( Math.max( 0, deal.oldPrice - deal.newPrice ) * 100 ) / 100;
		const savingsStr = formatMoneyEUR( savingsAmt );

		const priceSection = !showExpiredBanner
			? `💚 <b>${ newPrice } €</b> · <s>${ oldPrice } €</s>\n🏷 Ahorras <b>${ savingsStr } €</b>\n\n`
			: `<s><b>${ newPrice } €</b></s> · <s>${ oldPrice } €</s>\n🏷 <b>Expirada</b>\n\n`;

		const ratingLine = this.buildRatingLine( deal );

		const publicUrl = this.configService.get<string>( 'APP_PUBLIC_URL' )?.trim();
		const affiliatePlain = deal.affiliateUrl.trim();
		const trackingPlain = publicUrl
			? buildDealAffiliateTrackingUrl( publicUrl, deal.id )
			: affiliatePlain;
		const linkHrefHtml = this.escapeHref( trackingPlain );

		const ctaLabel = showExpiredBanner
			? 'Ver producto en Amazon'
			: 'Ver oferta en Amazon';
		const ctaLine = `<a href="${ linkHrefHtml }">${ escapeTelegramHtml( ctaLabel ) }</a>\n\n`;

		const expiredNotice = showExpiredBanner
			? `⚠️ <b>Esta oferta ha expirado.</b> Puedes ver el producto en Amazon por si el precio ha bajado de nuevo o hay una oferta similar activa.\n\n`
			: '';

		const clicks = Math.max( 0, deal.affiliateClickCount ?? 0 );
		const metricsLine = `📊 <b>${ escapeTelegramHtml( formatIntegerEs( clicks ) ) }</b> clics al enlace\n\n`;

		let html = tpl
			.replace( /\{\{categoryLine\}\}/g, categoryLine )
			.replace( /\{\{discountLine\}\}/g, discountLine )
			.replace( /\{\{titleLine\}\}/g, titleLine )
			.replace( /\{\{priceSection\}\}/g, priceSection )
			.replace( /\{\{ratingLine\}\}/g, ratingLine )
			.replace( /\{\{metricsLine\}\}/g, metricsLine )
			.replace( /\{\{ctaLine\}\}/g, ctaLine )
			.replace( /\{\{expiredNotice\}\}/g, expiredNotice )
			.replace( /\{\{legalNotice\}\}/g, LEGAL_NOTICE );

		html = html.replace( /\n{3,}/g, '\n\n' ).trim();

		const primaryLabel = showExpiredBanner
			? 'Ver producto en Amazon'
			: 'Ver oferta en Amazon';

		const inlineKeyboard: { text: string; url: string }[][] = [
			[
				{
					text: primaryLabel,
					url: trackingPlain,
				},
			],
		];
		const webUrl = publicUrl?.replace( /\/+$/, '' );
		if ( webUrl ) {
			inlineKeyboard.push( [
				{
					text: 'Abrir en la web',
					url: webUrl,
				},
			] );
		}

		return {
			captionHtml: html,
			photoUrl: deal.imageUrl,
			affiliateUrl: affiliatePlain,
			trackingUrl: trackingPlain,
			trackingEnabled: Boolean( publicUrl ),
			ratingStars: deal.ratingStars,
			reviewCount: deal.reviewCount,
			affiliateClickCount: clicks,
			categoryHashtag: deal.category?.hashtag?.trim() ?? null,
			parseMode: 'HTML',
			inlineKeyboard,
			showExpiredBanner,
		};
	}
}
