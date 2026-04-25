import { Entity, PrimaryGeneratedColumn, Column, ManyToMany, JoinTable } from 'typeorm';
import { Profile } from './profile.entity';

@Entity( 'interests' )
export class Interest {
	@PrimaryGeneratedColumn( 'uuid' )
	id: string;

	@Column( 'text', { unique: true } )
	name: string;

	@ManyToMany( () => Profile, profile => profile.interests )
	profiles: Profile[];
} 