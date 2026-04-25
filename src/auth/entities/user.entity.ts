import { Entity, PrimaryGeneratedColumn, Column, BeforeInsert, BeforeUpdate, OneToMany, OneToOne } from 'typeorm';
import { Profile } from '../../profile/entities/profile.entity';
import { RefreshToken } from './';
import { UserImage } from './user-image.entity';

@Entity( 'users' )
export class User {

	@PrimaryGeneratedColumn( 'uuid' )
	id: string;

	@Column( 'int', { unique: true } )
	idTelegram: number;

	@Column( 'bool', { default: false } )
	isBoot: boolean;

	@Column( 'text' )
	username: string;

	@Column( 'text' )
	firstName: string;

	@Column( 'text', { nullable: true } )
	lastName?: string;

	@Column( 'text', { nullable: true } )
	email?: string;

	@Column( 'text', { default: 'es' } )
	languageCode: string;

	@Column( 'text', { array: true, default: [ 'user' ] } )
	roles: string[];

	@Column( 'uuid', { nullable: true } )
	hash?: string;

	@Column( 'bool', { default: false } )
	isActive?: boolean;

	@Column( 'timestamp', { default: () => 'CURRENT_TIMESTAMP' } )
	createdAt: Date;

	@Column( 'timestamp', { default: () => 'CURRENT_TIMESTAMP', onUpdate: 'CURRENT_TIMESTAMP' } )
	updatedAt: Date;

	@OneToMany(
		() => RefreshToken,
		( refreshToken ) => refreshToken.user,
		{ cascade: true, eager: false }
	)
	refreshToken: RefreshToken[];

	@OneToMany(
		() => UserImage,
		( userImage ) => userImage.user,
		{ cascade: true, eager: true }
	)
	images: UserImage[];

	@OneToOne(
		() => Profile,
		( profile ) => profile.user,
		{ cascade: true }
	)
	profile: Profile;

}
