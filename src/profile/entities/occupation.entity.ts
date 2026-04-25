import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Profile } from './profile.entity';

@Entity( 'occupations' )
export class Occupation {
	@PrimaryGeneratedColumn( 'uuid' )
	id: string;

	@Column( 'text', { unique: true } )
	name: string;

	@OneToMany( () => Profile, profile => profile.occupation )
	profiles: Profile[];
} 