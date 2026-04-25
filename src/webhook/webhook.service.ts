import { HandleErrorService } from 'src/common/services';
import { ConfigService } from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { SendMessageService } from '../send-message/send-message.service';
import { WebhookCallbackQueryDto, WebhookMessageDto, WebhookUpdateDto } from './dto';

@Injectable()
export class WebhookService {

	private readonly webhookSecret: string;
	private readonly adminChatId: string | undefined;

	constructor (
		private readonly configService: ConfigService,
		private readonly sendMessageService: SendMessageService,
		private readonly handleErrorService: HandleErrorService,
	) {
		this.webhookSecret = this.configService.get( 'TELEGRAM_WEBHOOK_SECRET' );
		this.adminChatId = this.configService.get<string>( 'TELEGRAM_ADMIN_CHAT_ID' );
	}

	async handleUpdate ( update: WebhookUpdateDto, secretToken: string ) {

		if ( secretToken !== this.webhookSecret ) {
			this.handleErrorService.handleUnautorizedException( 'Invalid webhook secret token' );
		}

		try {

			if ( update.message ) {
				await this.handleMessage( update.message );
			} else if ( update.callback_query ) {
				await this.handleCallbackQuery( update.callback_query );
			}

			return { ok: true };

		} catch ( error ) {
			this.handleErrorService.handleBadRequestException( error );
		}
	}

	private async handleMessage ( message: WebhookMessageDto ) {

		const text = message.text?.trim();
		const chatId = message.chat.id;

		if ( text === '/start' ) {
			await this.sendMessageService.sendWelcomeFromTemplate( chatId );
			return;
		}

		if ( text === '/help' ) {
			await this.sendMessageService.sendText(
				chatId,
				'<b>Ganga Bot — Ayuda</b>\n/start — Bienvenida\n/help — Esta ayuda\n🌐 gangabot.com',
			);
			return;
		}

		if ( this.adminChatId && String( chatId ) === this.adminChatId ) {
			if ( text === '/stats' || text === '/publish' || text === '/skip' ) {
				await this.sendMessageService.sendText( chatId, '<i>Comando admin pendiente de implementar.</i>' );
			}
		}
	}

	private async handleCallbackQuery ( callbackQuery: WebhookCallbackQueryDto ) {

		switch ( callbackQuery.data ) {
			default:
				break;
		}
	}
}
