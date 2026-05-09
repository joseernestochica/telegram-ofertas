import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import { HandleErrorService } from '../common/services';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

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

	async sendPhoto (
		chatId: number | string,
		photoUrl: string,
		caption: string,
		extra?: Record<string, unknown>,
	): Promise<void> {
		try {
			const url = `${ this.apiUrl }/sendPhoto`;
			await firstValueFrom(
				this.httpService.post( url, {
					chat_id: chatId,
					photo: photoUrl,
					caption,
					parse_mode: 'HTML',
					...extra,
				} ),
			);
		} catch ( error: unknown ) {
			const detail = this.formatTelegramHttpError( error );
			this.logger.error( `sendPhoto: ${ detail }` );
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
