import { Type } from 'class-transformer';
import { IsNumber, IsOptional, ValidateNested, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class WebhookChatDto {
	@ApiProperty( { description: 'ID del chat' } )
	@IsNumber()
	id: number;

	@ApiProperty( { description: 'Tipo de chat', enum: [ 'private', 'group', 'supergroup', 'channel' ] } )
	@IsOptional()
	type: 'private' | 'group' | 'supergroup' | 'channel';

	@ApiProperty( { description: 'Título del chat', required: false } )
	@IsOptional()
	title?: string;

	@ApiProperty( { description: 'Nombre de usuario del chat', required: false } )
	@IsOptional()
	username?: string;

	@ApiProperty( { description: 'Nombre del chat', required: false } )
	@IsOptional()
	first_name?: string;

	@ApiProperty( { description: 'Apellido del chat', required: false } )
	@IsOptional()
	last_name?: string;
}

export class WebhookUserDto {
	@ApiProperty( { description: 'ID del usuario' } )
	@IsNumber()
	id: number;

	@ApiProperty( { description: 'Indica si es un bot' } )
	@IsOptional()
	is_bot: boolean;

	@ApiProperty( { description: 'Nombre del usuario' } )
	@IsOptional()
	first_name: string;

	@ApiProperty( { description: 'Apellido del usuario', required: false } )
	@IsOptional()
	last_name?: string;

	@ApiProperty( { description: 'Nombre de usuario', required: false } )
	@IsOptional()
	username?: string;

	@ApiProperty( { description: 'Código de idioma', required: false } )
	@IsOptional()
	language_code?: string;
}

export class WebhookPhotoDto {
	@ApiProperty( { description: 'ID único del archivo' } )
	@IsOptional()
	@IsString()
	file_id: string;

	@ApiProperty( { description: 'ID único del archivo para reutilización' } )
	@IsOptional()
	@IsString()
	file_unique_id: string;

	@ApiProperty( { description: 'Ancho de la foto' } )
	@IsNumber()
	width: number;

	@ApiProperty( { description: 'Alto de la foto' } )
	@IsNumber()
	height: number;

	@ApiProperty( { description: 'Tamaño del archivo', required: false } )
	@IsOptional()
	@IsNumber()
	file_size?: number;
}

export class WebhookThumbnailDto {
	@ApiProperty( { description: 'ID único del archivo' } )
	@IsOptional()
	@IsString()
	file_id: string;

	@ApiProperty( { description: 'ID único del archivo para reutilización' } )
	@IsOptional()
	@IsString()
	file_unique_id: string;

	@ApiProperty( { description: 'Tamaño del archivo' } )
	@IsOptional()
	@IsNumber()
	file_size: number;

	@ApiProperty( { description: 'Ancho de la miniatura' } )
	@IsOptional()
	@IsNumber()
	width: number;

	@ApiProperty( { description: 'Alto de la miniatura' } )
	@IsOptional()
	@IsNumber()
	height: number;
}

export class WebhookDocumentDto {
	@ApiProperty( { description: 'ID único del archivo' } )
	@IsOptional()
	@IsString()
	file_id: string;

	@ApiProperty( { description: 'ID único del archivo para reutilización' } )
	@IsOptional()
	@IsString()
	file_unique_id: string;

	@ApiProperty( { description: 'Nombre del archivo' } )
	@IsOptional()
	@IsString()
	file_name?: string;

	@ApiProperty( { description: 'MIME type del archivo' } )
	@IsOptional()
	@IsString()
	mime_type?: string;

	@ApiProperty( { description: 'Tamaño del archivo' } )
	@IsOptional()
	@IsNumber()
	file_size?: number;

	@ApiProperty( { description: 'Miniatura del documento' } )
	@IsOptional()
	@ValidateNested()
	@Type( () => WebhookThumbnailDto )
	thumbnail?: WebhookThumbnailDto;

	@ApiProperty( { description: 'Miniatura del documento (alias)' } )
	@IsOptional()
	@ValidateNested()
	@Type( () => WebhookThumbnailDto )
	thumb?: WebhookThumbnailDto;
}

export class WebhookMessageDto {
	@ApiProperty( { description: 'ID del mensaje' } )
	@IsNumber()
	message_id: number;

	@ApiProperty( { description: 'Usuario que envió el mensaje' } )
	@ValidateNested()
	@Type( () => WebhookUserDto )
	from: WebhookUserDto;

	@ApiProperty( { description: 'Chat donde se envió el mensaje' } )
	@ValidateNested()
	@Type( () => WebhookChatDto )
	chat: WebhookChatDto;

	@ApiProperty( { description: 'Fecha del mensaje' } )
	@IsNumber()
	date: number;

	@ApiProperty( { description: 'Texto del mensaje', required: false } )
	@IsOptional()
	text?: string;

	@ApiProperty( { description: 'Fotos del mensaje', required: false, type: [ WebhookPhotoDto ] } )
	@IsOptional()
	@ValidateNested( { each: true } )
	@Type( () => WebhookPhotoDto )
	photo?: WebhookPhotoDto[];

	@ApiProperty( { description: 'Documento del mensaje', required: false, type: WebhookDocumentDto } )
	@IsOptional()
	@ValidateNested()
	@Type( () => WebhookDocumentDto )
	document?: WebhookDocumentDto;
}

export class WebhookCallbackQueryDto {
	@ApiProperty( { description: 'ID de la callback query' } )
	id: string;

	@ApiProperty( { description: 'Usuario que generó la callback query' } )
	@ValidateNested()
	@Type( () => WebhookUserDto )
	from: WebhookUserDto;

	@ApiProperty( { description: 'Mensaje asociado a la callback query', required: false } )
	@IsOptional()
	@ValidateNested()
	@Type( () => WebhookMessageDto )
	message?: WebhookMessageDto;

	@ApiProperty( { description: 'Datos de la callback query' } )
	data: string;
}

export class WebhookUpdateDto {
	@ApiProperty( { description: 'ID de la actualización' } )
	@IsNumber()
	update_id: number;

	@ApiProperty( { description: 'Mensaje recibido', required: false } )
	@IsOptional()
	@ValidateNested()
	@Type( () => WebhookMessageDto )
	message?: WebhookMessageDto;

	@ApiProperty( { description: 'Callback query recibida', required: false } )
	@IsOptional()
	@ValidateNested()
	@Type( () => WebhookCallbackQueryDto )
	callback_query?: WebhookCallbackQueryDto;
} 