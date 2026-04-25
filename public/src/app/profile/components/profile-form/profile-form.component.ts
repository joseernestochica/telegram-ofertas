import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormArray } from '@angular/forms';
import { ProfileService } from '../../services/profile.service';
import { Profile, ProfileProps } from '../../models/profile.model';
import { MessageService } from 'primeng/api';
import { PrimeNgModule } from 'shared/primeng.module';
import { LocationLeafletService, LocationResult } from '../../services/location-leaflet.service';
import { LocationService } from 'shared/services/location.service';
import { Country } from 'shared/interfaces/location.interface';

@Component( {
	selector: 'app-profile-form',
	standalone: true,
	imports: [ PrimeNgModule, ReactiveFormsModule, CommonModule ],
	providers: [ MessageService, LocationLeafletService, LocationService ],
	templateUrl: './profile-form.component.html',
	styleUrls: [ './profile-form.component.scss' ]
} )
export class ProfileFormComponent implements OnInit {

	private countryUser = 'es';

	profileForm: FormGroup;
	loading = false;
	profile: Profile | undefined;
	locationSuggestions: LocationResult[] = [];
	countries: Country[] = [];

	// Opciones para los dropdowns
	genders: ProfileProps[] = [];
	genderPreferences: ProfileProps[] = [];
	occupations: ProfileProps[] = [];
	schools: ProfileProps[] = [];
	interests: ProfileProps[] = [];
	lookFors: ProfileProps[] = [];
	horoscopes: ProfileProps[] = [];

	maxDate: Date;
	minDate: Date;

	constructor (
		private fb: FormBuilder,
		private profileService: ProfileService,
		private messageService: MessageService,
		private locationLeafletService: LocationLeafletService,
		private locationService: LocationService
	) {

		this.profileForm = this.fb.group( {
			bio: [ '', [ Validators.required, Validators.minLength( 100 ) ] ],
			birthDate: [ null, [ Validators.required ] ],
			gender: [ null, [ Validators.required ] ],
			genderPreferences: [ [], [ Validators.required ] ],
			occupation: [ null ],
			school: [ null ],
			interests: [ [] ],
			locationSearch: [ '', [ Validators.required ] ],
			location: this.fb.group( {
				x: [ null ],
				y: [ null ]
			} ),
			locationText: [ '' ],
			locationCountry: [ this.countryUser, [ Validators.required ] ],
			ageRange: [ [ 18, 60 ] ],
			searchRadius: [ 10 ],
			showMe: [ true ],
			lookFor: [ null, [ Validators.required ] ],
			height: [ null ],
			horoscope: [ null ]
		} );

		// Fecha máxima: 18 años atrás desde hoy
		this.maxDate = new Date();
		this.maxDate.setFullYear( this.maxDate.getFullYear() - 18 );

		// Fecha mínima: 100 años atrás (o el límite que prefieras)
		this.minDate = new Date();
		this.minDate.setFullYear( this.minDate.getFullYear() - 100 );

	}

	async ngOnInit () {
		await this.loadProfile();
		await this.loadOptions();
	}

	private async loadProfile () {

		this.profile = await this.profileService.getProfileByUser();

		if ( this.profile ) {
			this.setLoadParams();
		}

	}

	private setLoadParams () {
		console.log( this.profile );
		const birthDate = this.profile?.birthDate ? new Date( this.profile.birthDate ) : null;

		this.profileForm.patchValue( {
			bio: this.profile?.bio,
			birthDate: birthDate,
			gender: this.profile?.gender?.id,
			genderPreferences: this.profile?.genderPreferences,
			occupation: this.profile?.occupation,
			school: this.profile?.school,
			interests: this.profile?.interests,
			location: this.profile?.location,
			locationText: this.profile?.locationText,
			locationSearch: this.profile?.locationText,
			locationCountry: this.profile?.locationCountry,
			ageRange: [ this.profile?.agePreferenceMin, this.profile?.agePreferenceMax ],
			searchRadius: this.profile?.searchRadius,
			showMe: this.profile?.showMe,
			lookFor: this.profile?.lookFor?.id,
			height: this.profile?.height,
			horoscope: this.profile?.horoscope
		} );

		this.profileForm.get( 'locationCountry' )?.valueChanges.subscribe( ( value ) => {
			this.countryUser = value.isoCode;
		} );

	}

	private async loadOptions () {

		this.genders = await this.profileService.getGenders() || [];
		this.genderPreferences = await this.profileService.getGenderPreferences() || [];
		this.occupations = await this.profileService.getOccupations() || [];
		this.schools = await this.profileService.getSchools() || [];
		this.interests = await this.profileService.getInterests() || [];
		this.lookFors = await this.profileService.getLookFors() || [];
		this.horoscopes = await this.profileService.getHoroscopes() || [];
		this.countries = await this.locationService.getCountries() || [];

		if ( this.profile && this.profile?.locationCountry ) {
			this.profileForm.get( 'locationCountry' )?.setValue( this.countries.find( ( country: Country ) => country.isoCode === this.profile?.locationCountry ) );
		}

	}

	private setValuesProfile ( formValue: any ): Profile {
		console.log( formValue );
		const newProfile: Profile = {
			bio: formValue.bio,
			birthDate: formValue.birthDate,
			gender: formValue.gender,
			agePreferenceMin: formValue.ageRange[ 0 ],
			agePreferenceMax: formValue.ageRange[ 1 ],
			location: {
				x: formValue.location.x,
				y: formValue.location.y
			},
			locationText: formValue.locationSearch?.display_name,
			locationCountry: formValue.locationCountry?.isoCode,
			genderPreferences: formValue.genderPreferences.map( ( gender: ProfileProps ) => gender.id ),
			occupation: formValue.occupation?.id,
			school: formValue.school?.id,
			interests: formValue.interests.map( ( interest: ProfileProps ) => interest.id ),
			searchRadius: formValue.searchRadius,
			showMe: formValue.showMe,
			lookFor: formValue.lookFor,
			height: formValue.height,
			horoscope: formValue.horoscope?.id,
		}

		console.log( newProfile );

		return newProfile;

	}

	async onSubmit () {

		if ( this.profileForm.invalid ) {
			this.profileForm.markAllAsTouched();
			this.messageService.add( {
				severity: 'error',
				summary: 'Error',
				detail: 'Por favor, completa todos los campos requeridos'
			} );
			return;
		}

		this.loading = true;

		try {

			const formValue = this.profileForm.value;
			const valuesProfile = this.setValuesProfile( formValue );

			if ( this.profile ) {

				await this.profileService.updateProfile( { body: valuesProfile } );

				this.messageService.add( {
					severity: 'success',
					summary: 'Ok',
					detail: 'Perfil actualizado correctamente'
				} );

			} else {

				await this.profileService.createProfile( { body: valuesProfile } );

				this.messageService.add( {
					severity: 'success',
					summary: 'Ok',
					detail: 'Perfil creado correctamente'
				} );

			}
		} catch ( error ) {
			this.messageService.add( {
				severity: 'error',
				summary: 'Error',
				detail: 'Ha ocurrido un error al guardar el perfil'
			} );
		} finally {
			this.loading = false;
		}
	}

	compareGender ( gender1: ProfileProps, gender2: ProfileProps ): boolean {
		return gender1?.id === gender2?.id;
	}

	async searchLocation ( event: any ) {

		const query = event.query;

		try {

			this.locationSuggestions = await this.locationLeafletService.searchLocation( query, this.countryUser.toLowerCase() );

		} catch ( error ) {
			this.messageService.add( {
				severity: 'error',
				summary: 'Error',
				detail: 'Error al buscar la ubicación'
			} );
		}
	}

	onLocationSelect ( event: any ) {

		this.profileForm.patchValue( {
			location: {
				x: parseFloat( event.value.lon ),
				y: parseFloat( event.value.lat )
			}
		} );

	}
} 