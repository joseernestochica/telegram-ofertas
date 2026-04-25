import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Profile } from './profile.entity';

@Entity( 'schools' )
export class School {
	@PrimaryGeneratedColumn( 'uuid' )
	id: string;

	@Column( 'text', { unique: true } )
	name: string;

	@OneToMany( () => Profile, profile => profile.school )
	profiles: Profile[];
} 