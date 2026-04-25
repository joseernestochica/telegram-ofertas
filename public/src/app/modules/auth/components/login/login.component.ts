import { Component, OnInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TelegramWebappService } from '@zakarliuka/ng-telegram-webapp';
import { SharedModule } from 'shared/shared.module';
import { AuthService } from 'auth/services/auth.service';
import { Router } from '@angular/router';

declare global {
	interface Window {
		Telegram: any;
	}
}

@Component( {
	selector: 'app-login',
	standalone: true,
	imports: [
		CommonModule,
		SharedModule
	],
	templateUrl: './login.component.html',
	styleUrls: [ './login.component.scss' ]
} )
export class LoginComponent implements OnInit {

	@ViewChild( 'telegramLoginButton', { static: true } ) telegramLoginButton!: ElementRef;

	private userTelegramId: number = 995263889;

	userProfilePhoto: string = 'assets/images/demo/perfil.png';
	userName: string = 'Ernesto';

	constructor (
		private telegramService: TelegramWebappService,
		private authService: AuthService,
		private router: Router
	) { }

	ngOnInit () {
		this.initTelegramUser();
	}

	private async initTelegramUser () {

		try {
			// Intentamos obtener la información del usuario de Telegram
			const user = this.telegramService.webApp.initDataUnsafe?.user;

			if ( user ) {

				this.userName = user.first_name;
				this.userTelegramId = user.id;

				if ( user.photo_url ) {
					this.userProfilePhoto = user.photo_url;
				}

			} else {
				console.log( 'No se encontró información del usuario de Telegram' );
			}
		} catch ( error ) {
			console.error( 'Error al obtener información del usuario:', error );
		}

	}

	async onClickLogin () {

		try {

			const hash = await this.authService.getHashByIdTelegram( this.userTelegramId );

			if ( !hash ) {
				throw new Error( 'No se encontró el hash del usuario' );
			}

			const userLogin = await this.authService.login( hash );
			if ( !userLogin ) {
				throw new Error( 'No se encontró el usuario' );
			}

			const user = await this.authService.getUserByToken();
			if ( !user ) {
				throw new Error( 'No se encontró el usuario' );
			}

			this.router.navigate( [ 'app/home' ] );

		} catch ( error ) {
			console.error( error );
			this.router.navigate( [ 'error' ] );
		}
	}

} 