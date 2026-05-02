import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { timingSafeEqual } from 'crypto';
import { HandleErrorService } from '../services/handle-error.service';

/**
 * Compara cadenas en tiempo constante cuando tienen la misma longitud.
 */
function safeEqualString ( a: string, b: string ): boolean {
	if ( a.length !== b.length ) {
		return false;
	}
	return timingSafeEqual( Buffer.from( a, 'utf8' ), Buffer.from( b, 'utf8' ) );
}

/**
 * Protege escrituras: enviar `Authorization: Bearer <API_KEY>` o cabecera `x-api-key`.
 * Requiere `API_KEY` en entorno; si no está definida, las rutas protegidas responden error de configuración.
 */
@Injectable()
export class ApiKeyGuard implements CanActivate {

	constructor (
		private readonly configService: ConfigService,
		private readonly handleErrorService: HandleErrorService,
	) { }

	canActivate ( context: ExecutionContext ): boolean {
		const expected = this.configService.get<string>( 'API_KEY' )?.trim();
		if ( !expected ) {
			this.handleErrorService.handleInternalServerErrorException(
				'API_KEY no configurada: no se pueden validar peticiones de escritura',
			);
		}

		const request = context.switchToHttp().getRequest<Request>();
		const auth = request.headers.authorization;
		let bearer: string | undefined;
		if ( typeof auth === 'string' && /^Bearer\s+/i.test( auth ) ) {
			bearer = auth.replace( /^Bearer\s+/i, '' ).trim();
		}
		const headerKey = request.headers[ 'x-api-key' ];
		const xKey = typeof headerKey === 'string' ? headerKey.trim() : undefined;
		const provided = bearer || xKey;

		if ( provided && safeEqualString( provided, expected ) ) {
			return true;
		}

		this.handleErrorService.handleUnautorizedException(
			'API key inválida o ausente (Authorization: Bearer … o x-api-key)',
		);
	}
}
