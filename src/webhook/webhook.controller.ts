import { Controller, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { ApiTags } from '@nestjs/swagger';
import { WebhookUpdateDto } from './dto';

@ApiTags( 'Webhook' )
@Controller( 'webhook' )
export class WebhookController {

	constructor (
		private readonly webhookService: WebhookService
	) { }

	@Post()
	@HttpCode( 200 )
	async handleWebhook (
		@Body() update: any,
		@Headers( 'x-telegram-bot-api-secret-token' ) secretToken: string
	) {
		return this.webhookService.handleUpdate( update, secretToken );
	}

} 