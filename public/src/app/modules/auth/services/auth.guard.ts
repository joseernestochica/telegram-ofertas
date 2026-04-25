import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

@Injectable( {
	providedIn: 'root'
} )
export class AuthGuard implements CanActivate {

	constructor (
		private authService: AuthService,
		private router: Router
	) { }

	async canActivate ( route: ActivatedRouteSnapshot, state: RouterStateSnapshot ): Promise<boolean> {

		const currentUser = await this.authService.getUserByToken();

		if ( currentUser ) { return true; } // Login correcto

		this.authService.logout( true );
		this.router.navigate( [ '/auth/login' ] );

		return false;

	}

}
