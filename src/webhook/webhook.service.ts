import { HandleErrorService } from 'src/common/services';
import { ConfigService } from '@nestjs/config';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { SendMessageService } from '../send-message/send-message.service';
import { WebhookCallbackQueryDto, WebhookMessageDto, WebhookUpdateDto } from './dto';

@Injectable()
export class WebhookService {

	private readonly webhookSecret: string;

	constructor (
		private readonly configService: ConfigService,
		private readonly sendMessageService: SendMessageService,
		private readonly handleErrorService: HandleErrorService
	) {
		this.webhookSecret = this.configService.get( 'TELEGRAM_WEBHOOK_SECRET' );
	}

	async handleUpdate ( update: WebhookUpdateDto, secretToken: string ) {

		// Verificar el token secreto
		if ( secretToken !== this.webhookSecret ) {
			this.handleErrorService.handleUnautorizedException( 'Invalid webhook secret token' );
		}

		try {

			// Aquí procesamos la actualización recibida
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

		// Procesar mensajes recibidos
		console.log( 'Received message:', message );

		// Mensaje de bienvenida
		if ( message.text === '/start' ) {
			await this.sendMessageService.startWebApp( message.chat.id );
		}

	}

	private async handleCallbackQuery ( callbackQuery: WebhookCallbackQueryDto ) {

		// Procesar callback queries (botones inline)
		console.log( 'Received callback query:', callbackQuery );
		// Implementa la lógica para manejar diferentes callbacks

	}

} 