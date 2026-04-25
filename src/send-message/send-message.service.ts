import { AuthService } from 'src/auth/auth.service';
import { Chat } from './interfaces/response-telegram.interface';
import { ConfigService } from '@nestjs/config';
import { CreateUserDto } from 'src/auth/dto';
import { firstValueFrom } from 'rxjs';
import { HandleErrorService } from '../common/services';
import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class SendMessageService {

	private readonly logger = new Logger( SendMessageService.name );
	private readonly apiUrl: string;
	private readonly webAppUrl: string;

	constructor (

		private readonly configService: ConfigService,
		private readonly httpService: HttpService,
		private readonly handleErrorService: HandleErrorService,
		private readonly authService: AuthService

	) {

		this.apiUrl = `${ this.configService.get( 'TELEGRAM_API_URL' ) }${ this.configService.get( 'TELEGRAM_BOT_TOKEN' ) }`;
		this.webAppUrl = this.configService.get( 'WEBAPP_URL' );

		// Verificar configuración
		this.logger.log( `API URL base: ${ this.configService.get( 'TELEGRAM_API_URL' ) }` );
		this.logger.log( `WebApp URL: ${ this.webAppUrl }` );

	}

	async sendMessageWelcome ( chatId: number ): Promise<void> {

		try {

			const url = `${ this.apiUrl }/sendMessage`;

			const filePath = path.resolve( __dirname, '../../static/tpl/message-welcome.html' );
			const message = fs.readFileSync( filePath, 'utf8' );

			this.logger.debug( `Enviando mensaje de bienvenida a chat_id: ${ chatId }` );

			const response = await firstValueFrom(
				this.httpService.post( url, { chat_id: chatId, text: message, parse_mode: 'HTML' } )
			);

			this.logger.debug( `Respuesta de Telegram: ${ JSON.stringify( response.data ) }` );

		} catch ( error ) {
			this.logger.error( `Error al enviar mensaje de bienvenida: ${ JSON.stringify( error.response?.data || error.message ) }` );
			this.handleErrorService.handleBadRequestException( error );
		}
	}

	async startWebApp ( chatId: number ): Promise<void> {

		try {

			const hash = uuidv4();

			const url = `${ this.apiUrl }/sendMessage`;
			const webAppUrl = `${ this.webAppUrl }?hash=${ hash }`;
			// const webAppUrl = `${ this.webAppUrl }/auth/login`;

			this.logger.debug( `Iniciando WebApp para chat_id: ${ chatId }` );
			this.logger.debug( `URL de la WebApp: ${ webAppUrl }` );

			const keyboard = {
				inline_keyboard: [ [
					{
						text: "Abrir Dating App",
						web_app: { url: webAppUrl }
					}
				] ]
			};

			const response = await firstValueFrom(
				this.httpService.post( url, {
					chat_id: chatId,
					text: "¡Haz clic en el botón para abrir la aplicación!",
					reply_markup: JSON.stringify( keyboard ) // Importante: stringify del keyboard
				} )
			);

			this.logger.debug( `Respuesta de Telegram: ${ JSON.stringify( response.data ) }` );

			const dataChat: Chat = response.data?.result?.chat;
			if ( !dataChat ) {
				this.logger.error( `No se encontró el chat en la respuesta de Telegram` );
				return;
			}

			const user: CreateUserDto = {
				idTelegram: dataChat.id,
				firstName: dataChat.first_name,
				username: dataChat.username,
				isActive: true
			};

			await this.authService.create( user, hash );

		} catch ( error ) {
			this.logger.error( `Error al iniciar WebApp: ${ JSON.stringify( error.response?.data || error.message ) }` );
			this.handleErrorService.handleBadRequestException( error );
		}

	}

	async confirmProfileSave ( chatId: number, profile: any ): Promise<void> {

		try {
			const url = `${ this.apiUrl }/sendMessage`;

			this.logger.debug( `Confirmando guardado de perfil para chat_id: ${ chatId }` );
			this.logger.debug( `Datos del perfil: ${ JSON.stringify( profile ) }` );

			const message = `
¡Perfil actualizado! 🎉

👤 Nombre: ${ profile.name }
📅 Edad: ${ profile.age }
💝 Buscando: ${ profile.lookingFor }
🎯 Rango de edad: ${ profile.agePreference.min }-${ profile.agePreference.max }

📝 Bio:
${ profile.bio }
`;
			const response = await firstValueFrom(
				this.httpService.post( url, {
					chat_id: chatId,
					text: message,
					parse_mode: 'HTML'
				} )
			);

			this.logger.debug( `Respuesta de Telegram: ${ JSON.stringify( response.data ) }` );
		} catch ( error ) {
			this.logger.error( `Error al confirmar perfil: ${ JSON.stringify( error.response?.data || error.message ) }` );
			this.handleErrorService.handleBadRequestException( error );
		}

	}

}

