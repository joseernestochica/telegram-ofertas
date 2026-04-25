import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

export interface LocationResult {
	display_name: string;
	lat: string;
	lon: string;
}

@Injectable( {
	providedIn: 'root'
} )
export class LocationLeafletService {

	constructor (
		private http: HttpClient,
	) { }

	async searchLocation ( query: string, countryCode: string ): Promise<LocationResult[]> {

		if ( query.length < 3 ) { return []; }

		try {
			const response = await firstValueFrom(
				this.http.get<LocationResult[]>( `https://nominatim.openstreetmap.org/search`, {
					params: {
						q: query,
						format: 'json',
						limit: '5',
						addressdetails: '1',
						countrycodes: countryCode
					},
					headers: {
						'Accept-Language': 'es'
					}
				} )
			);
			return response;

		} catch ( error ) {
			console.error( 'Error en la búsqueda de ubicación:', error );
			throw error;
		}
	}
} 