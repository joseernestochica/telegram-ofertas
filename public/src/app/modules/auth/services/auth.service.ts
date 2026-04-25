import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, lastValueFrom } from 'rxjs';
import { Router } from '@angular/router';
import { AuthModel } from 'auth/models/auth.model';
import { environment } from 'environments/environment';
import { UserModel } from 'auth/models/user.model';
import { Response } from 'shared/interfaces/response.interface';

@Injectable( {
  providedIn: 'root'
} )
export class AuthService {

  private urlApi = environment.apiUrl;
  private authLocalStorageToken: string = `${ environment.USERDATA_KEY }`;

  currentUserSubject: BehaviorSubject<UserModel | undefined>;
  errorLogin$: BehaviorSubject<boolean>;

  get currentUserValue (): UserModel | undefined {
    return this.currentUserSubject.value;
  }

  set currentUserValue ( user: UserModel | undefined ) {
    this.currentUserSubject.next( user );
  }

  constructor (
    private http: HttpClient,
    private router: Router,
  ) {

    this.currentUserSubject = new BehaviorSubject<UserModel | undefined>( undefined );
    this.errorLogin$ = new BehaviorSubject<boolean>( false );

    // this.getUserByToken();

  }

  async login ( hash: string ): Promise<UserModel | undefined> {

    const body = { hash };
    const url = `${ this.urlApi }/auth/login`;

    try {

      const res = await lastValueFrom( this.http.post<Response<AuthModel>>( url, body ) );
      if ( !res || !res.data ) {
        return undefined;
      }

      const auth = res.data as AuthModel;
      this.setAuthFromLocalStorage( auth );

      const user = await this.getUserByToken();
      return user;

    } catch ( err ) {
      console.error( 'Error en login:', err );
      if ( err instanceof Error ) {
        console.error( 'Mensaje de error:', err.message );
        console.error( 'Stack trace:', err.stack );
      }
      return undefined;
    }

  }

  async logout ( redir = false ) {

    const auth = this.getAuthFromLocalStorage();

    if ( auth ) {
      const url = `${ this.urlApi }/auth/refresh-token/${ auth.user?.id }/${ auth.refreshToken }`;
      await lastValueFrom( this.http.delete( url ) );
    }

    localStorage.removeItem( this.authLocalStorageToken );
    this.currentUserValue = undefined;

    // if ( redir ) { this.router.navigate( [ '/auth/login' ] ); }

  }

  async getUserByToken (): Promise<UserModel | undefined> {

    const auth = this.getAuthFromLocalStorage();
    const roles: string[] = auth && auth.user ? auth.user.roles : [];

    if ( !auth || !auth.token ) {
      return undefined;
    }

    const url = `${ this.urlApi }/auth/check-status`;

    try {

      const res = await lastValueFrom( this.http.get<Response<UserModel>>( url ) );
      if ( !res || !res.data ) { return undefined; }

      const user = res.data as UserModel;

      user.roles = roles;
      this.currentUserSubject.next( user );
      return user;

    } catch ( error ) {
      return undefined;
    }

  }

  async validateToken (): Promise<boolean> {

    const auth = this.getAuthFromLocalStorage();
    if ( !auth ) return false;

    const url = `${ this.urlApi }/auth/check-status`;

    try {
      const res = await lastValueFrom( this.http.get<Response<UserModel>>( url ) );
      return res && res.statusCode === 200;
    } catch ( err ) {
      return false;
    }

  }

  async refreshToken (): Promise<AuthModel | undefined> {

    const auth = this.getAuthFromLocalStorage();
    if ( !auth || !auth.user ) return undefined;

    const url = `${ this.urlApi }/auth/refresh-token`;
    const body = {
      'refreshToken': auth.refreshToken || '',
      'userId': auth.user.id?.toString() || ''
    }

    try {

      const res = await lastValueFrom( this.http.post<Response<AuthModel>>( url, body ) );

      if ( !res || !res.data ) { return undefined; }

      const auth = res.data as AuthModel;
      this.setAuthFromLocalStorage( auth );

      return auth;

    } catch ( err ) {
      return undefined;
    }

  }

  getAuthFromLocalStorage (): AuthModel | undefined {

    const dataLocalStorage = localStorage.getItem( this.authLocalStorageToken );
    if ( !dataLocalStorage ) { return undefined; }

    const authData: AuthModel = JSON.parse( dataLocalStorage );
    return authData;

  }

  setAuthFromLocalStorage ( auth: AuthModel ): boolean {

    if ( auth && auth.token ) {
      localStorage.setItem( this.authLocalStorageToken, JSON.stringify( auth ) );
      return true;
    }

    return false;

  }

  async getHashByIdTelegram ( idTelegram: number ): Promise<string | undefined> {

    try {

      const url = `${ this.urlApi }/auth/user-telegram/${ idTelegram }`;

      const res = await lastValueFrom( this.http.get<Response<UserModel>>( url ) );

      if ( !res || !res.data ) {
        throw new Error( 'No se encontró el hash del usuario' );
      }

      const data = res.data as UserModel;
      return data.hash;

    } catch ( error ) {
      throw error;
    }
  }

}
