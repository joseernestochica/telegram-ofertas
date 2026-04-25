import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Profile } from './profile.entity';

@Entity( 'horoscopes' )
export class Horoscope {
	@PrimaryGeneratedColumn( 'uuid' )
	id: string;

	@Column( 'text', { unique: true } )
	name: string;

	@OneToMany( () => Profile, profile => profile.horoscope )
	profiles: Profile[];
} 