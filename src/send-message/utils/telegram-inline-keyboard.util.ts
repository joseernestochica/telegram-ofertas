import { InlineKeyboardButton } from '../interfaces/telegram-send-result.interface';

/** Convierte filas `{ text, url }` al formato `reply_markup` de Telegram Bot API. */
export function buildTelegramInlineKeyboardMarkup (
	rows: { text: string; url: string }[][],
): { inline_keyboard: InlineKeyboardButton[][] } {
	return {
		inline_keyboard: rows.map( ( row ) =>
			row.map( ( btn ) => ( { text: btn.text, url: btn.url } ) ),
		),
	};
}
