export interface ResponseTelegram {
	ok: boolean;
	result: Result;
}

export interface Result {
	message_id: number;
	from: Chat;
	chat: Chat;
	date: number;
	text: string;
	reply_markup: ReplyMarkup;
}

export interface Chat {
	id: number;
	first_name: string;
	username: string;
	type?: string;
	is_bot?: boolean;
}

export interface ReplyMarkup {
	inline_keyboard: Array<InlineKeyboard[]>;
}

export interface InlineKeyboard {
	text: string;
	web_app: WebApp;
}

export interface WebApp {
	url: string;
}
