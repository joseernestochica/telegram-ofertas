import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from 'environments/environment';
import { Profile, ProfileProps } from '../models/profile.model';
import { Response } from 'shared/interfaces/response.interface';
import { Request } from 'shared/interfaces/request.interface';

@Injectable( {
	providedIn: 'root'
} )
export class ProfileService {

	private urlApi = environment.apiUrl;

	constructor (
		private http: HttpClient,
	) { }

	async getProfileByUser (): Promise<Profile | undefined> {

		try {

			const url = `${ this.urlApi }/profile/user`;
			const res = await lastValueFrom( this.http.get<Response<Profile>>( url ) );

			if ( !res || !res.data ) {
				return undefined;
			}

			return res.data as Profile;

		} catch ( error ) {
			console.error( 'Error al obtener el perfil:', error );
			return undefined;
		}
	}

	async createProfile ( request: Request<Profile> ): Promise<Profile | undefined> {

		try {

			const url = `${ this.urlApi }/profile`;

			const res = await lastValueFrom( this.http.post<Response<Profile>>( url, request.body ) );

			if ( !res || !res.data ) {
				return undefined;
			}

			return res.data as Profile;

		} catch ( error ) {
			console.error( 'Error al crear el perfil:', error );
			throw error;
		}
	}

	async updateProfile ( request: Request<Profile> ): Promise<Profile | undefined> {

		try {

			const url = `${ this.urlApi }/profile`;

			const res = await lastValueFrom( this.http.patch<Response<Profile>>( url, request.body ) );

			if ( !res || !res.data ) {
				return undefined;
			}

			return res.data as Profile;

		} catch ( error ) {
			console.error( 'Error al actualizar el perfil:', error );
			throw error;
		}
	}

	async getHoroscopes (): Promise<ProfileProps[] | undefined> {

		try {

			const url = `${ this.urlApi }/profile-options/horoscopes`;

			const res = await lastValueFrom( this.http.get<Response<string[]>>( url ) );

			if ( !res || !res.data ) {
				return undefined;
			}

			return res.data as ProfileProps[];

		} catch ( error ) {
			console.error( 'Error al obtener los horóscopos:', error );
			return undefined;
		}
	}

	async getGenders (): Promise<ProfileProps[] | undefined> {

		try {

			const url = `${ this.urlApi }/profile-options/genders`;

			const res = await lastValueFrom( this.http.get<Response<ProfileProps[]>>( url ) );

			if ( !res || !res.data ) {
				return undefined;
			}

			return res.data as ProfileProps[];

		} catch ( error ) {
			console.error( 'Error al obtener los géneros:', error );
			return undefined;
		}
	}

	async getInterests (): Promise<ProfileProps[] | undefined> {

		try {

			const url = `${ this.urlApi }/profile-options/interests`;

			const res = await lastValueFrom( this.http.get<Response<ProfileProps[]>>( url ) );

			if ( !res || !res.data ) {
				return undefined;
			}

			return res.data as ProfileProps[];

		} catch ( error ) {
			console.error( 'Error al obtener los intereses:', error );
			return undefined;
		}
	}

	async getGenderPreferences (): Promise<ProfileProps[] | undefined> {

		try {

			const url = `${ this.urlApi }/profile-options/gender-preferences`;

			const res = await lastValueFrom( this.http.get<Response<ProfileProps[]>>( url ) );

			if ( !res || !res.data ) {
				return undefined;
			}

			return res.data as ProfileProps[];

		} catch ( error ) {
			console.error( 'Error al obtener las preferencias de género:', error );
			return undefined;
		}
	}

	async getOccupations (): Promise<ProfileProps[] | undefined> {

		try {

			const url = `${ this.urlApi }/profile-options/occupations`;

			const res = await lastValueFrom( this.http.get<Response<ProfileProps[]>>( url ) );

			if ( !res || !res.data ) {
				return undefined;
			}

			return res.data as ProfileProps[];

		} catch ( error ) {
			console.error( 'Error al obtener las ocupaciones:', error );
			return undefined;
		}
	}

	async getSchools (): Promise<ProfileProps[] | undefined> {

		try {

			const url = `${ this.urlApi }/profile-options/schools`;

			const res = await lastValueFrom( this.http.get<Response<ProfileProps[]>>( url ) );

			if ( !res || !res.data ) {
				return undefined;
			}

			return res.data as ProfileProps[];

		} catch ( error ) {
			console.error( 'Error al obtener las escuelas:', error );
			return undefined;
		}
	}

	async getLookFors (): Promise<ProfileProps[] | undefined> {

		try {

			const url = `${ this.urlApi }/profile-options/look-fors`;
			const res = await lastValueFrom( this.http.get<Response<ProfileProps[]>>( url ) );

			if ( !res || !res.data ) {
				return undefined;
			}

			return res.data as ProfileProps[];

		} catch ( error ) {
			console.error( 'Error al obtener las búsquedas:', error );
			return undefined;
		}
	}
} 