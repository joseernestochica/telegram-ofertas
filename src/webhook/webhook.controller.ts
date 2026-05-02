import { Controller, Post, Body, Headers, HttpCode } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { GetResponse } from '../common/interfaces/get-response.interface';
import { WebhookUpdateDto } from './dto';
import { WebhookService } from './webhook.service';

@ApiTags( 'Webhook' )
@Controller( 'webhook' )
export class WebhookController {

	constructor (
		private readonly webhookService: WebhookService
	) { }

	@Post()
	@HttpCode( 200 )
	handleWebhook (
		@Body() update: WebhookUpdateDto,
		@Headers( 'x-telegram-bot-api-secret-token' ) secretToken: string
	): Promise<GetResponse<{ ok: boolean }>> {
		return this.webhookService.handleUpdate( update, secretToken );
	}

}
