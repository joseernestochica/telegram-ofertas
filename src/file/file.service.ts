import { HandleErrorService } from 'src/common/services';
import { join } from 'path';
import { Injectable, BadRequestException } from '@nestjs/common';
import { existsSync } from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserImage } from '../auth/entities';

@Injectable()
export class FileService {

	constructor (
		private readonly handleErrorService: HandleErrorService,
		@InjectRepository( User )
		private readonly userRepository: Repository<User>,
	) { }

	getStaticImage ( imageName: string, type: string, id: string ): string {

		const path = join( __dirname, '..', '..', 'static', type, id, imageName );

		if ( !existsSync( path ) ) {

			const defaultImagePath = join( __dirname, '..', '..', 'static', 'blank.png' );
			if ( !existsSync( defaultImagePath ) ) {
				throw new BadRequestException( `Image not found and default image not available` );
			}

			return defaultImagePath;

		}

		return path;

	}

	async insertUserImages ( userId: string, files: Express.Multer.File[] ) {

		if ( !files || files.length === 0 ) {
			this.handleErrorService.handleBadRequestException( `Images not found` );
		}

		const user = await this.userRepository.findOneBy( { id: userId } );
		if ( !user ) {
			this.handleErrorService.handleNotFoundException( `User with id ${ userId } not found` );
		}

		const images = files.map( file => ( {
			url: file.filename,
			user: { id: userId }  // Solo referenciamos el ID del usuario
		} ) as UserImage );

		// Actualizamos el usuario con las nuevas imágenes
		user.images = images;
		await this.userRepository.save( user );

		return {
			message: 'Imágenes guardadas correctamente',
			data: images.map( image => ( {
				url: image.url
			} ) )
		};
	}

	async removeUserImages ( userId: string ) {

		const user = await this.userRepository.findOneBy( { id: userId } );
		if ( !user ) { this.handleErrorService.handleBadRequestException( `User not found` ); }

		user.images = [];
		await this.userRepository.save( user );

		return {
			message: 'Imágenes eliminadas correctamente'
		};

	}

}
