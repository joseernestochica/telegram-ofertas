import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { escapeHtmlAttr, escapeTelegramHtml } from '../common/utils/escape-telegram-html.util';
import {
	formatIntegerEs,
	formatMoneyEUR,
	formatReviewCountEs,
} from '../common/utils/format-money.util';
import { DealFormatterService } from './deal-formatter.service';
import { Deal } from './entities/deal.entity';

@Injectable()
export class DealPreviewCardService {

	constructor ( private readonly dealFormatterService: DealFormatterService ) { }

	private renderStarsHtml ( rating: number ): string {
		const filled = Math.min( 5, Math.max( 0, Math.round( rating ) ) );
		let out = '';
		for ( let i = 1; i <= 5; i += 1 ) {
			out += i <= filled ? '★' : '☆';
		}
		return out;
	}

	private formatRatingOneDecimal ( stars: number ): string {
		const hasDecimal = stars % 1 !== 0;
		return new Intl.NumberFormat( 'es-ES', {
			minimumFractionDigits: hasDecimal ? 1 : 0,
			maximumFractionDigits: 1,
		} ).format( stars );
	}

	render ( deal: Deal, showExpiredBanner: boolean ): string {
		const payload = this.dealFormatterService.formatDealCaption( deal, {
			showExpiredBanner,
		} );

		const offerHref = escapeHtmlAttr( payload.trackingUrl.trim() );
		const imgAlt = escapeTelegramHtml(
			deal.title.trim().slice( 0, 120 ),
		);

		const filePath = path.resolve( __dirname, '../../static/tpl/deal-preview-card.html' );
		let html = fs.readFileSync( filePath, 'utf8' );

		const pct = Math.round( deal.discountPct );
		const savingsRaw =
			Math.round( Math.max( 0, deal.oldPrice - deal.newPrice ) * 100 ) / 100;
		const savingsStr = formatMoneyEUR( savingsRaw );
		const newStr = formatMoneyEUR( deal.newPrice );
		const oldStr = formatMoneyEUR( deal.oldPrice );

		const pillCategory = deal.category?.hashtag?.trim()
			? `<div class="pill-cat">${ escapeTelegramHtml(
				deal.category!.hashtag.trim().startsWith( '#' )
					? deal.category!.hashtag.trim()
					: `#${ deal.category!.hashtag.trim() }`,
			) }</div>`
			: '';

		const photo = payload.photoUrl?.trim();
		let visualBlock: string;
		const linkAttr = `href="${ offerHref }" target="_blank" rel="noopener noreferrer"`;

		if ( photo ) {
			const src = escapeHtmlAttr( photo );
			if ( showExpiredBanner ) {
				visualBlock = `
<div class="visual visual--expired">
  <span class="expired-corner">${ escapeTelegramHtml( 'Oferta finalizada' ) }</span>
  <div class="visual-img-wrap">
    <a class="visual-link" ${ linkAttr }>
      <img src="${ src }" alt="${ imgAlt }"/>
    </a>
  </div>
  <div class="expired-overlay"><span class="expired-pill">${ escapeTelegramHtml( 'Oferta finalizada' ) }</span></div>
</div>`.trim();
			} else {
				visualBlock = `
<div class="visual">
  <span class="badge-discount">-${ pct }%</span>
  <a class="visual-link" ${ linkAttr }>
    <img src="${ src }" alt="${ imgAlt }"/>
  </a>
</div>`.trim();
			}
		} else if ( showExpiredBanner ) {
			visualBlock = `
<div class="visual visual--expired">
  <span class="expired-corner">${ escapeTelegramHtml( 'Oferta finalizada' ) }</span>
  <a class="visual-link visual-link--placeholder" ${ linkAttr }>
    <div class="no-img">${ escapeTelegramHtml( 'Sin imagen' ) }</div>
  </a>
  <div class="expired-overlay"><span class="expired-pill">${ escapeTelegramHtml( 'Oferta finalizada' ) }</span></div>
</div>`.trim();
		} else {
			visualBlock = `
<div class="visual">
  <a class="visual-link visual-link--placeholder" ${ linkAttr }>
    <div class="no-img">${ escapeTelegramHtml( 'Sin imagen de producto' ) }</div>
  </a>
</div>`.trim();
		}

		const titleHtml = `<h2 class="title">${ escapeTelegramHtml( deal.title.trim() ) }</h2>`;

		let priceHtml: string;
		if ( showExpiredBanner ) {
			priceHtml = `
<div class="price-row price-row--expired">
  <span class="price-strike"><s><b>${ escapeTelegramHtml( newStr ) } €</b></s></span>
  <span class="price-strike"><s>${ escapeTelegramHtml( oldStr ) } €</s></span>
  <span class="pill-expired">${ escapeTelegramHtml( 'Expirada' ) }</span>
</div>`.trim();
		} else {
			priceHtml = `
<div class="price-row">
  <span class="price-now">${ escapeTelegramHtml( newStr ) } €</span>
  <span class="price-was"><s>${ escapeTelegramHtml( oldStr ) } €</s></span>
  <span class="pill-save">${ escapeTelegramHtml( `Ahorras ${ savingsStr } €` ) }</span>
</div>`.trim();
		}

		let ratingHtml = '';
		const hasRating =
			deal.ratingStars != null && !Number.isNaN( deal.ratingStars );
		const hasReviews =
			deal.reviewCount != null && deal.reviewCount >= 0;
		if ( hasRating || hasReviews ) {
			const starsStr = hasRating
				? this.renderStarsHtml( deal.ratingStars! )
				: '☆☆☆☆☆';
			const numStr = hasRating
				? this.formatRatingOneDecimal( deal.ratingStars! )
				: '—';
			const revStr = hasReviews
				? `${ formatReviewCountEs( deal.reviewCount! ) } valoraciones`
				: '';
			ratingHtml = `
<div class="rating-row">
  <span class="stars" aria-hidden="true">${ starsStr }</span>
  ${ hasRating ? `<span class="rating-num">${ escapeTelegramHtml( numStr ) }</span>` : '' }
  ${ revStr ? `<span>${ escapeTelegramHtml( revStr ) }</span>` : '' }
</div>`.trim();
		}

		const clicks = Math.max( 0, deal.affiliateClickCount ?? 0 );
		const clicksHtml = `
<div class="clicks-row">👁️ <strong>${ escapeTelegramHtml( formatIntegerEs( clicks ) ) }</strong> clics al enlace</div>`.trim();

		const infoExpired = showExpiredBanner
			? `<div class="info-expired">${ escapeTelegramHtml(
				'Esta oferta ha expirado. Puedes ver el producto en Amazon por si ',
			) }<strong>${ escapeTelegramHtml(
				'el precio ha bajado de nuevo',
			) }</strong>${ escapeTelegramHtml(
				' o hay una oferta similar activa.',
			) }</div>`
			: '';

		const rows = payload.inlineKeyboard;
		const actionsParts: string[] = [];
		if ( showExpiredBanner ) {
			actionsParts.push(
				`<span class="btn btn-disabled">${ escapeTelegramHtml( 'Oferta no disponible' ) }</span>`,
			);
		}
		for ( const row of rows ) {
			for ( const btn of row ) {
				const isPrimary =
					btn.text.includes( 'Amazon' ) && !btn.text.includes( 'disponible' );
				const cls = isPrimary ? 'btn btn-primary' : 'btn btn-secondary';
				actionsParts.push(
					`<a class="${ cls }" href="${ escapeHtmlAttr( btn.url ) }">${ escapeTelegramHtml( btn.text ) }</a>`,
				);
			}
		}
		const actionsHtml = `<div class="actions">${ actionsParts.join( '\n' ) }</div>`;

		const legalHtml = `<p class="legal">${ escapeTelegramHtml(
			'Como Afiliado de Amazon obtengo ingresos por las compras adscritas.',
		) }</p>`;

		const cardBody = `
<div class="card-inner">
  ${ pillCategory }
  ${ visualBlock }
  ${ titleHtml }
  ${ priceHtml }
  ${ ratingHtml }
  ${ clicksHtml }
  <div class="divider"></div>
  ${ infoExpired }
  ${ actionsHtml }
  ${ legalHtml }
</div>`.trim();

		html = html
			.replace( /\{\{dealId\}\}/g, deal.id )
			.replace( '{{CARD_BODY}}', cardBody );

		return html;
	}
}
