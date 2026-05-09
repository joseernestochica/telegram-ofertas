import { HandleErrorService } from 'src/common/services';
import { ConfigService } from '@nestjs/config';
import { Injectable, Logger } from '@nestjs/common';
import { GetResponse } from '../common/interfaces/get-response.interface';
import { buildGetResponse } from '../common/utils/get-response.util';
import { SendMessageService } from '../send-message/send-message.service';
import { WebhookCallbackQueryDto, WebhookMessageDto, WebhookUpdateDto } from './dto';

@Injectable()
export class WebhookService {

	private readonly logger = new Logger( WebhookService.name );
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

	async handleUpdate ( update: WebhookUpdateDto, secretToken: string ): Promise<GetResponse<{ ok: boolean }>> {

		this.logger.log( `Webhook update_id=${ update.update_id }` );

		if ( secretToken !== this.webhookSecret ) {
			this.handleErrorService.handleUnautorizedException( 'Invalid webhook secret token' );
		}

		try {

			if ( update.message ) {
				await this.handleMessage( update.message );
			} else if ( update.callback_query ) {
				await this.handleCallbackQuery( update.callback_query );
			}

			return buildGetResponse( { ok: true } );

		} catch ( error: unknown ) {
			const message = error instanceof Error ? error.message : String( error );
			this.handleErrorService.handleBadRequestException( message );
		}
	}

	private async handleMessage ( message: WebhookMessageDto ) {

		const text = message.text?.trim();
		const chatId = message.chat.id;
		this.logger.log(
			`chat_id=${ message.chat.id } user_id=${ message.from?.id } text=${ JSON.stringify( text ) }`,
		);

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
