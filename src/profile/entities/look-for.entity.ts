import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Profile } from './profile.entity';

@Entity( 'look_fors' )
export class LookFor {
	@PrimaryGeneratedColumn( 'uuid' )
	id: string;

	@Column( 'text', { unique: true } )
	name: string;

	@OneToMany( () => Profile, profile => profile.lookFor )
	profiles: Profile[];
} 