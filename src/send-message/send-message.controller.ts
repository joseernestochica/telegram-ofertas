import { Controller, Post, Body, Logger } from '@nestjs/common';
import { SendMessageService } from './send-message.service';

@Controller( 'send-message' )
export class SendMessageController {

	private readonly logger = new Logger( SendMessageController.name );

	constructor ( private readonly sendMessageService: SendMessageService ) { }

	@Post( 'welcome' )
	async sendWelcomeMessage ( @Body( 'chat_id' ) chatId: number ) {
		await this.sendMessageService.sendMessageWelcome( chatId );
		return { success: true };
	}

	@Post( 'webapp' )
	async startWebApp ( @Body( 'chat_id' ) chatId: number ) {

		this.logger.debug( `Recibida solicitud de inicio de WebApp para chat_id: ${ chatId }` );

		if ( !chatId ) {
			this.logger.error( 'chat_id no proporcionado' );
			throw new Error( 'chat_id es requerido' );
		}

		await this.sendMessageService.startWebApp( chatId );
		return { success: true };
	}

	@Post( 'profile' )
	async saveProfile (
		@Body( 'chat_id' ) chatId: number,
		@Body( 'profile_data' ) profileData: string
	) {
		this.logger.debug( `Recibidos datos de perfil para chat_id: ${ chatId }` );
		this.logger.debug( `Datos recibidos: ${ profileData }` );

		if ( !chatId || !profileData ) {
			this.logger.error( 'Faltan datos requeridos' );
			throw new Error( 'chat_id y profile_data son requeridos' );
		}

		try {
			const profile = JSON.parse( profileData );
			await this.sendMessageService.confirmProfileSave( chatId, profile );
			return { success: true };
		} catch ( error ) {
			this.logger.error( `Error al procesar datos del perfil: ${ error.message }` );
			throw error;
		}
	}
} 