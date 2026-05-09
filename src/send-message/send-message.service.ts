import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { HandleErrorService } from '../common/services';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { TelegramSendResult } from './interfaces/telegram-send-result.interface';
import { buildTelegramInlineKeyboardMarkup } from './utils/telegram-inline-keyboard.util';

@Injectable()
export class SendMessageService {

	private readonly logger = new Logger( SendMessageService.name );
	private readonly apiUrl: string;
	private readonly channelId: string | undefined;

	constructor (
		private readonly configService: ConfigService,
		private readonly httpService: HttpService,
		private readonly handleErrorService: HandleErrorService,
	) {
		const base = this.configService.get<string>( 'TELEGRAM_API_URL' );
		const token = this.configService.get<string>( 'TELEGRAM_BOT_TOKEN' );
		this.apiUrl = `${ base }${ token }`;
		this.channelId = this.configService.get<string>( 'TELEGRAM_CHANNEL_ID' );
	}

	private formatTelegramHttpError ( error: unknown ): string {
		const axiosLike = error as {
			response?: { data?: { description?: string; error_code?: number } };
			message?: string;
		};
		const desc = axiosLike.response?.data?.description;
		const code = axiosLike.response?.data?.error_code;
		if ( desc ) {
			return `Telegram API: ${ desc }${ code != null ? ` (código ${ code })` : '' }`;
		}
		if ( error instanceof Error ) {
			return error.message;
		}
		return String( error );
	}

	async sendText (
		chatId: number | string,
		html: string,
		extra?: Record<string, unknown>,
	): Promise<void> {
		try {
			const url = `${ this.apiUrl }/sendMessage`;
			await firstValueFrom(
				this.httpService.post( url, {
					chat_id: chatId,
					text: html,
					parse_mode: 'HTML',
					...extra,
				} ),
			);
		} catch ( error: unknown ) {
			const detail = this.formatTelegramHttpError( error );
			this.logger.error( `sendText: ${ detail }` );
			this.handleErrorService.handleBadRequestException( detail );
		}
	}

	/**
	 * Envía foto con caption HTML y opcional `reply_markup` (p. ej. botones URL).
	 * Devuelve ids para `editMessageCaption` / `editMessageReplyMarkup` en el canal.
	 */
	async sendPhoto (
		chatId: number | string,
		photoUrl: string,
		caption: string,
		extra?: Record<string, unknown>,
	): Promise<TelegramSendResult> {
		try {
			const url = `${ this.apiUrl }/sendPhoto`;
			const res = await firstValueFrom(
				this.httpService.post<{
					ok?: boolean;
					result?: { message_id?: number; chat?: { id?: number | string } };
				}>( url, {
					chat_id: chatId,
					photo: photoUrl,
					caption,
					parse_mode: 'HTML',
					...extra,
				} ),
			);
			return this.extractSendResult( res.data, 'sendPhoto' );
		} catch ( error: unknown ) {
			const detail = this.formatTelegramHttpError( error );
			this.logger.error( `sendPhoto: ${ detail }` );
			this.handleErrorService.handleBadRequestException( detail );
		}
	}

	/** Mensaje HTML con teclado inline (fallback si la oferta no tiene `imageUrl`). */
	async sendHtmlMessage (
		chatId: number | string,
		html: string,
		extra?: Record<string, unknown>,
	): Promise<TelegramSendResult> {
		try {
			const url = `${ this.apiUrl }/sendMessage`;
			const res = await firstValueFrom(
				this.httpService.post<{
					ok?: boolean;
					result?: { message_id?: number; chat?: { id?: number | string } };
				}>( url, {
					chat_id: chatId,
					text: html,
					parse_mode: 'HTML',
					...extra,
				} ),
			);
			return this.extractSendResult( res.data, 'sendHtmlMessage' );
		} catch ( error: unknown ) {
			const detail = this.formatTelegramHttpError( error );
			this.logger.error( `sendHtmlMessage: ${ detail }` );
			this.handleErrorService.handleBadRequestException( detail );
		}
	}

	/** Actualiza el pie de una foto ya publicada (p. ej. banner «Finalizado»). */
	async editMessageCaption (
		chatId: number | string,
		messageId: number,
		caption: string,
		extra?: Record<string, unknown>,
	): Promise<void> {
		try {
			const url = `${ this.apiUrl }/editMessageCaption`;
			await firstValueFrom(
				this.httpService.post( url, {
					chat_id: chatId,
					message_id: messageId,
					caption,
					parse_mode: 'HTML',
					...extra,
				} ),
			);
		} catch ( error: unknown ) {
			const detail = this.formatTelegramHttpError( error );
			this.logger.error( `editMessageCaption: ${ detail }` );
			this.handleErrorService.handleBadRequestException( detail );
		}
	}

	getConfiguredChannelId (): string | undefined {
		return this.channelId;
	}

	/** Expuesto para el publisher; usa el mismo shape que `DealFormatterService`. */
	buildReplyMarkupFromRows (
		rows: { text: string; url: string }[][],
	): { inline_keyboard: { text: string; url: string }[][] } {
		return buildTelegramInlineKeyboardMarkup( rows );
	}

	private extractSendResult (
		data: { ok?: boolean; result?: { message_id?: number; chat?: { id?: number | string } } },
		context: string,
	): TelegramSendResult {
		const messageId = data?.result?.message_id;
		const chatIdRaw = data?.result?.chat?.id;
		if ( messageId == null || chatIdRaw == null ) {
			const detail = `${ context }: respuesta Telegram sin message_id o chat.id`;
			this.logger.error( detail );
			this.handleErrorService.handleBadRequestException( detail );
		}
		return {
			messageId,
			chatId: String( chatIdRaw ),
		};
	}

	/** Igual que `editMessageCaption`, pero para mensajes enviados solo como texto (`sendMessage`). */
	async editMessageText (
		chatId: number | string,
		messageId: number,
		text: string,
		extra?: Record<string, unknown>,
	): Promise<void> {
		try {
			const url = `${ this.apiUrl }/editMessageText`;
			await firstValueFrom(
				this.httpService.post( url, {
					chat_id: chatId,
					message_id: messageId,
					text,
					parse_mode: 'HTML',
					...extra,
				} ),
			);
		} catch ( error: unknown ) {
			const detail = this.formatTelegramHttpError( error );
			this.logger.error( `editMessageText: ${ detail }` );
			this.handleErrorService.handleBadRequestException( detail );
		}
	}

	async sendToChannel ( html: string ): Promise<void> {
		if ( !this.channelId ) {
			this.logger.warn( 'TELEGRAM_CHANNEL_ID no configurado; sendToChannel omitido' );
			return;
		}
		await this.sendText( this.channelId, html );
	}

	async sendWelcomeFromTemplate ( chatId: number ): Promise<void> {
		const filePath = path.resolve( __dirname, '../../static/tpl/message-welcome.html' );
		const message = fs.readFileSync( filePath, 'utf8' );
		await this.sendText( chatId, message );
	}
}
