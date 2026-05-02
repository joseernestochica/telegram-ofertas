import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	InternalServerErrorException,
	Logger,
	NotFoundException,
	UnauthorizedException,
} from '@nestjs/common';

@Injectable()
export class HandleErrorService {

	private logger = new Logger( 'CommonHandleErrorService' );

	handleDBException ( error: any ): never {
		if ( error.code === '23505' ) {
			this.logger.error( error.message );
			throw new BadRequestException( error.detail );
		}

		this.logger.error( error.message );
		throw new InternalServerErrorException( 'Check server logs' );

	}

	handleNotFoundException ( message: string ): never {
		this.logger.error( message );
		throw new NotFoundException( message );
	}

	handleBadRequestException ( message: string ): never {
		this.logger.error( message );
		throw new BadRequestException( message );
	}

	handleUnautorizedException ( message: string ): never {
		this.logger.error( message );
		throw new UnauthorizedException( message );
	}

	handleForbiddenException ( message: string ): never {
		this.logger.error( message );
		throw new ForbiddenException( message );
	}

	handleInternalServerErrorException ( message: string ): never {
		this.logger.error( message );
		throw new InternalServerErrorException( message );
	}

}

