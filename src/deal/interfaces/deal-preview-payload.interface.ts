/** Salida de `DealFormatterService` para preview y futuro publisher (Fase E). */
export interface DealPreviewPayload {

	/** Texto HTML para `caption` en sendPhoto / sendMessage con parse_mode HTML. */
	captionHtml: string;

	photoUrl: string | null;

	/** URL de afiliado destino (Amazon), persistida en BD. */
	affiliateUrl: string;

	/** URL usada en la ficha y botones (tracking `/api/track/deals/:id` si hay `APP_PUBLIC_URL`). */
	trackingUrl: string;

	/** `true` si los enlaces cuentan clics en el servidor (requiere URL pública correcta). */
	trackingEnabled: boolean;

	ratingStars: number | null;

	reviewCount: number | null;

	affiliateClickCount: number;

	categoryHashtag: string | null;

	parseMode: 'HTML';

	/** Filas de botones URL para `reply_markup.inline_keyboard` en Telegram Bot API. */
	inlineKeyboard: { text: string; url: string }[][];

	showExpiredBanner: boolean;
}
