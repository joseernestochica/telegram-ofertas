import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { User } from '../../auth/entities/user.entity';
import { Horoscope } from './horoscope.entity';
import { Gender } from './gender.entity';
import { GenderPreference } from './gender-preference.entity';
import { Occupation } from './occupation.entity';
import { Interest } from './interest.entity';
import { School } from './school.entity';
import { LookFor } from './look-for.entity';

@Entity( 'profiles' )
export class Profile {
	@PrimaryGeneratedColumn( 'uuid' )
	id: string;

	@OneToOne( () => User )
	@JoinColumn()
	user: User;

	@Column( 'text', { nullable: true } )
	bio: string;

	@Column( 'date' )
	birthDate: Date;

	@ManyToOne( () => Gender, gender => gender.profiles )
	gender: Gender;

	@ManyToMany( () => GenderPreference, genderPreference => genderPreference.profiles )
	@JoinTable()
	genderPreferences: GenderPreference[];

	@ManyToOne( () => Occupation, occupation => occupation.profiles )
	occupation: Occupation;

	@ManyToOne( () => School, school => school.profiles )
	school: School;

	@ManyToMany( () => Interest, interest => interest.profiles )
	@JoinTable()
	interests: Interest[];

	@Column( 'point', {
		nullable: true, transformer: {
			to: ( value: { x: number, y: number } ) => value ? `(${ value.x },${ value.y })` : null,
			from: ( value: any ) => {
				if ( !value ) return null;
				if ( typeof value === 'string' ) {
					const [ x, y ] = value.replace( /[()]/g, '' ).split( ',' ).map( Number );
					return { x, y };
				}
				if ( typeof value === 'object' && 'x' in value && 'y' in value ) {
					return value;
				}
				return null;
			}
		}
	} )
	location: { x: number, y: number };

	@Column( 'text', { nullable: true } )
	locationText: string;

	@Column( 'text', { nullable: true } )
	locationCountry: string;

	@Column( 'int', { default: 0 } )
	agePreferenceMin: number;

	@Column( 'int', { default: 100 } )
	agePreferenceMax: number;

	@Column( 'int', { default: 50 } )
	searchRadius: number;

	@Column( 'bool', { default: true } )
	showMe: boolean;

	@ManyToOne( () => LookFor, lookFor => lookFor.profiles )
	lookFor: LookFor;

	@Column( 'timestamp', { default: () => 'CURRENT_TIMESTAMP' } )
	createdAt: Date;

	@Column( 'timestamp', { default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' } )
	updatedAt: Date;

	@Column( 'int', { nullable: true } )
	height?: number;

	@ManyToOne( () => Horoscope, horoscope => horoscope.profiles )
	horoscope?: Horoscope;
}

// Te explico los campos más importantes que he incluido:

// 1. `user`: Relación OneToOne con la entidad User
// 2. `bio`: Descripción personal del usuario
// 3. `birthDate`: Fecha de nacimiento
// 4. `gender`: Género del usuario
// 5. `genderPreferences`: Preferencias de género para matches
// 6. `occupation`: Ocupación o trabajo
// 7. `school`: Institución educativa
// 8. `interests`: Array de intereses / pasatiempos
// 9. `location`: Ubicación geográfica( usando tipo point de PostgreSQL )
// 10. `locationText` y `locationCountry`: Texto y país de la ubicación
// 11. `agePreferenceMin` y `agePreferenceMax`: Rango de edad preferido
// 12. `searchRadius`: Radio de búsqueda en kilómetros
// 13. `showMe`: Si el perfil debe mostrarse a otros usuarios
// 14. `lookFor`: Propiedad que indica el propósito de la relación


// Esta estructura te permitirá:
// 1. Mantener la información básica del usuario en la entidad`User`
// 2. Guardar toda la información relacionada con el perfil de dating en la entidad`Profile`
// 3. Tener una relación uno a uno entre ambas entidades
// 4. Manejar las preferencias de búsqueda y matching
// 5. Almacenar información relevante para el sistema de dating

