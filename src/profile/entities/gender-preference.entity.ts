import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Profile } from './profile.entity';

@Entity( 'gender_preferences' )
export class GenderPreference {
	@PrimaryGeneratedColumn( 'uuid' )
	id: string;

	@Column( 'text', { unique: true } )
	name: string;

	@ManyToMany( () => Profile, profile => profile.genderPreferences )
	profiles: Profile[];
} 