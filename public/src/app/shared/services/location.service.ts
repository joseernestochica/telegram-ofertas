import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from 'environments/environment';
import { Country, Location } from '../interfaces/location.interface';
import { Response } from '../interfaces/response.interface';

@Injectable( {
	providedIn: 'root'
} )
export class LocationService {

	private urlApi = environment.apiUrl;

	constructor (
		private http: HttpClient
	) { }

	async getCountries (): Promise<Country[]> {
		try {
			const url = `${ this.urlApi }/location/countries?lang=es`;
			const res = await lastValueFrom( this.http.get<Response<Location>>( url ) );

			if ( !res || !res.data ) {
				throw new Error( 'No se encontraron países' );
			}

			return ( res.data as Location ).countries || [];

		} catch ( error ) {
			console.error( 'Error al obtener los países:', error );
			throw error;
		}
	}
} 