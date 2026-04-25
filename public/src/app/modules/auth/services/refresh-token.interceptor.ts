import { HttpInterceptorFn, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpRequest, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of, from } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';
import { AuthService } from './auth.service';

// Variables compartidas a nivel de módulo
let isRefreshing = false;
const refreshTokenSubject = new BehaviorSubject<any>( null );

export const refreshTokenInterceptor: HttpInterceptorFn = ( req, next ) => {
	const authService = inject( AuthService );
	const router = inject( Router );

	if ( authService.getAuthFromLocalStorage() ) {
		const authData = authService.getAuthFromLocalStorage();
		req = addToken( req, authData?.token || '' );
	}

	return next( req ).pipe(
		catchError( ( error: any ) => {
			if ( error instanceof HttpErrorResponse && error.status === 401 ) {
				console.info( 'Refresh token' );
				return handle401Error( req, next, authService, isRefreshing, refreshTokenSubject );
			} else if ( error.status === 406 ) {
				authService.errorLogin$.next( true );
				authService.logout( true );
				return of( error );
			}
			throw error;
		} )
	);
};

function addToken ( request: HttpRequest<any>, token: string ): HttpRequest<any> {
	return request.clone( {
		setHeaders: {
			Authorization: `Bearer ${ token }`
		}
	} );
}

function handle401Error (
	request: HttpRequest<any>,
	next: HttpHandlerFn,
	authService: AuthService,
	isRefreshing: boolean,
	refreshTokenSubject: BehaviorSubject<any>
): Observable<HttpEvent<any>> {
	if ( !isRefreshing ) {
		isRefreshing = true;
		refreshTokenSubject.next( null );

		return from( authService.refreshToken() ).pipe(
			switchMap( newAuth => {
				isRefreshing = false;
				refreshTokenSubject.next( newAuth?.token );
				return next( addToken( request, newAuth?.token || '' ) );
			} ),
			catchError( err => {
				isRefreshing = false; // Importante: resetear el estado
				console.log( err, 'error al actualizar el token' );
				authService.logout();
				return of( err );
			} )
		);
	} else {
		return refreshTokenSubject.pipe(
			filter( token => token != null ),
			take( 1 ),
			switchMap( jwt => {
				return next( addToken( request, jwt ) );
			} ),
			catchError( err => {
				return of( err );
			} )
		);
	}
}
