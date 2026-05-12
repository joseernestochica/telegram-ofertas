import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { formatPercentAsEmojiKeycaps } from '../common/utils/format-percent-emoji-digits.util';
import { buildDealAffiliateTrackingUrl } from '../common/utils/deal-tracking-url.util';
import { escapeTelegramHtml } from '../common/utils/escape-telegram-html.util';
import {
	formatMoneyEUR,
	formatReviewCountEs,
} from '../common/utils/format-money.util';
import { Deal } from './entities/deal.entity';
import { DealPreviewPayload } from './interfaces/deal-preview-payload.interface';

const LEGAL_NOTICE =
	'En calidad de Afiliado de Amazon obtengo ingresos por las compras adscritas.';

/** Quita un prefijo inicial tipo `[Demo 7]` del título mostrado (el valor en BD no cambia). */
function stripBracketTitlePrefix ( title: string ): string {
	return title.trim().replace( /^\[[^\]]+\]\s*/, '' );
}

@Injectable()
export class DealFormatterService {

	constructor ( private readonly configService: ConfigService ) { }

	private escapeHref ( url: string ): string {
		return url.replace( /&/g, '&amp;' );
	}

	private formatRatingOneDecimal ( stars: number ): string {
		const hasDecimal = stars % 1 !== 0;
		return new Intl.NumberFormat( 'es-ES', {
			minimumFractionDigits: hasDecimal ? 1 : 0,
			maximumFractionDigits: 1,
		} ).format( stars );
	}

	/** Línea «⭐️ nota · valoraciones»; cadena vacía si no hay datos. */
	private buildRatingLine ( deal: Deal ): string {
		const hasStars = deal.ratingStars != null && !Number.isNaN( deal.ratingStars );
		const hasReviews = deal.reviewCount != null && deal.reviewCount >= 0;
		if ( !hasStars && !hasReviews ) {
			return '';
		}
		const note = hasStars
			? escapeTelegramHtml( this.formatRatingOneDecimal( deal.ratingStars! ) )
			: '—';
		const revPart = hasReviews
			? `${ escapeTelegramHtml( formatReviewCountEs( deal.reviewCount! ) ) } valoraciones`
			: '';
		const core = revPart
			? `⭐️ <b>${ note }</b> · ${ revPart }`
			: `⭐️ <b>${ note }</b>`;
		return core;
	}

	formatDealCaption (
		deal: Deal,
		options?: { showExpiredBanner?: boolean },
	): DealPreviewPayload {
		const showExpiredBanner = options?.showExpiredBanner === true;
		const pct = Math.round( deal.discountPct );

		const displayTitle = escapeTelegramHtml(
			stripBracketTitlePrefix( deal.title ),
		);

		const pctEmoji = formatPercentAsEmojiKeycaps( pct );

		const headlineBlock = showExpiredBanner
			? `⚠️ <b>Oferta finalizada</b>\n\n<b>${ displayTitle }</b>`
			: `<b>${ displayTitle }</b> -${ pctEmoji }`;

		const newPrice = formatMoneyEUR( deal.newPrice );
		const oldPrice = formatMoneyEUR( deal.oldPrice );
		const savingsAmt =
			Math.round( Math.max( 0, deal.oldPrice - deal.newPrice ) * 100 ) / 100;
		const savingsStr = formatMoneyEUR( savingsAmt );

		const priceBlock = showExpiredBanner
			? `💰 <s><b>${ newPrice } €</b></s>  <s>${ oldPrice } €</s>  · <b>Expirada</b>`
			: `💰 <b>${ newPrice } €</b>  <s>${ oldPrice } €</s>  · Ahorras <b>${ savingsStr } €</b> ✂️`;

		const ratingLine = this.buildRatingLine( deal );
		const priceAndRating =
			ratingLine === ''
				? priceBlock
				: `${ priceBlock }\n\n${ ratingLine }`;

		const publicUrl = this.configService.get<string>( 'APP_PUBLIC_URL' )?.trim();
		const affiliatePlain = deal.affiliateUrl.trim();
		const trackingPlain = publicUrl
			? buildDealAffiliateTrackingUrl( publicUrl, deal.id )
			: affiliatePlain;

		const shortOffer = deal.telegramOfferUrl?.trim();
		const useAffiliateDirect =
			this.configService.get<string>(
				'TELEGRAM_PUBLISH_USE_AFFILIATE_URL',
				'false',
			) === 'true';

		let publishUrl: string;
		if ( shortOffer ) {
			publishUrl = shortOffer;
		} else if ( useAffiliateDirect ) {
			publishUrl = affiliatePlain;
		} else {
			publishUrl = trackingPlain;
		}

		const linkHref = this.escapeHref( publishUrl );
		const linkVerb =
			showExpiredBanner ? 'Ver producto en Amazon' : 'Ver oferta en Amazon';
		/** 👉 icono de llamada a la acción del enlace. */
		const linkBlock =
			`👉 <a href="${ linkHref }">${ escapeTelegramHtml( linkVerb ) }</a>`;

		/** Telegram HTML no admite tamaños de fuente; cursiva es lo más discreto admitido. */
		const legalBlock = `<i>${ escapeTelegramHtml( LEGAL_NOTICE ) }</i>`;

		const showDisclaimer =
			this.configService.get<string>(
				'TELEGRAM_AFFILIATE_DISCLAIMER',
				'false',
			) === 'true';

		const captionParts = [
			headlineBlock,
			priceAndRating,
			linkBlock,
		];
		if ( showDisclaimer ) {
			captionParts.push( legalBlock );
		}
		let captionHtml = captionParts.join( '\n\n' );
		captionHtml = captionHtml.replace( /\n{3,}/g, '\n\n' ).trim();

		const clicks = Math.max( 0, deal.affiliateClickCount ?? 0 );

		const primaryLabel = showExpiredBanner
			? '👉 Ver producto en Amazon'
			: '👉 Ver oferta en Amazon';

		const inlineKeyboard: { text: string; url: string }[][] = [
			[
				{
					text: primaryLabel,
					url: publishUrl,
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
			captionHtml,
			photoUrl: deal.imageUrl,
			affiliateUrl: affiliatePlain,
			trackingUrl: publishUrl,
			trackingEnabled:
				Boolean( publicUrl ) && publishUrl === trackingPlain,
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
