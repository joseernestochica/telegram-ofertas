export interface InlineKeyboardButton {
	text: string;
	url: string;
}

/** Respuesta mínima de `sendMessage` / `sendPhoto` para persistir ediciones. */
export interface TelegramSendResult {
	messageId: number;
	chatId: string;
}
