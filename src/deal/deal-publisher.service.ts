import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { HandleErrorService } from '../common/services/handle-error.service';
import { TelegramSendResult } from '../send-message/interfaces/telegram-send-result.interface';
import { SendMessageService } from '../send-message/send-message.service';
import { DealFormatterService } from './deal-formatter.service';
import { DealService } from './deal.service';
import { DealEvent } from './entities/deal-event.entity';
import { Deal } from './entities/deal.entity';
import { DealEventType, DealStatus } from './entities/deal.enums';

@Injectable()
export class DealPublisherService {

	constructor (
		@InjectRepository( Deal )
		private readonly dealRepository: Repository<Deal>,
		@InjectRepository( DealEvent )
		private readonly dealEventRepository: Repository<DealEvent>,
		private readonly dealService: DealService,
		private readonly dealFormatterService: DealFormatterService,
		private readonly sendMessageService: SendMessageService,
		private readonly handleErrorService: HandleErrorService,
	) { }

	/** Publica la ficha en el canal configurado, guarda ids para futuras ediciones y marca el deal como publicado. */
	async publishDealToChannel ( dealId: string ): Promise<Deal> {
		const channelId = this.sendMessageService.getConfiguredChannelId();
		if ( !channelId ) {
			this.handleErrorService.handleBadRequestException(
				'TELEGRAM_CHANNEL_ID no configurado; no se puede publicar en Telegram',
			);
		}

		try {
			const deal = await this.dealService.findById( dealId );
			const payload = this.dealFormatterService.formatDealCaption( deal );
			const replyMarkup = this.sendMessageService.buildReplyMarkupFromRows(
				payload.inlineKeyboard,
			);

			let sent: TelegramSendResult;
			const photo = payload.photoUrl?.trim();
			if ( photo ) {
				sent = await this.sendMessageService.sendPhoto(
					channelId,
					photo,
					payload.captionHtml,
					{ reply_markup: replyMarkup },
				);
			} else {
				sent = await this.sendMessageService.sendHtmlMessage(
					channelId,
					payload.captionHtml,
					{ reply_markup: replyMarkup },
				);
			}

			deal.telegramPublishedChatId = sent.chatId;
			deal.telegramPublishedMessageId = sent.messageId;
			deal.telegramPublishedIsPhoto = Boolean( photo );
			deal.status = DealStatus.PUBLISHED;
			deal.publishedAt = new Date();
			await this.dealRepository.save( deal );

			await this.dealEventRepository.insert( {
				dealId,
				type: DealEventType.PUBLISHED,
				metadata: {
					telegramChatId: sent.chatId,
					telegramMessageId: sent.messageId,
					via: 'channel_send',
				},
			} );

			return this.dealService.findById( dealId );
		} catch ( error: unknown ) {
			if ( error instanceof HttpException ) {
				throw error;
			}
			this.handleErrorService.handleDBException( error );
		}
	}

	/**
	 * Edita el mensaje ya publicado añadiendo el banner «Finalizado» (misma práctica que la competencia).
	 * Requiere `telegramPublishedChatId` y `telegramPublishedMessageId`.
	 */
	async applyExpiredBannerOnChannel ( dealId: string ): Promise<Deal> {
		try {
			const deal = await this.dealService.findById( dealId );
			if (
				deal.telegramPublishedChatId == null
				|| deal.telegramPublishedMessageId == null
			) {
				this.handleErrorService.handleBadRequestException(
					'El deal no tiene mensaje de Telegram persistido; no se puede editar la ficha',
				);
			}

			const payload = this.dealFormatterService.formatDealCaption( deal, {
				showExpiredBanner: true,
			} );
			const replyMarkup = this.sendMessageService.buildReplyMarkupFromRows(
				payload.inlineKeyboard,
			);

			if ( deal.telegramPublishedIsPhoto ) {
				await this.sendMessageService.editMessageCaption(
					deal.telegramPublishedChatId,
					deal.telegramPublishedMessageId,
					payload.captionHtml,
					{ reply_markup: replyMarkup },
				);
			} else {
				await this.sendMessageService.editMessageText(
					deal.telegramPublishedChatId,
					deal.telegramPublishedMessageId,
					payload.captionHtml,
					{ reply_markup: replyMarkup },
				);
			}

			deal.status = DealStatus.EXPIRED;
			await this.dealRepository.save( deal );

			return this.dealService.findById( dealId );
		} catch ( error: unknown ) {
			if ( error instanceof HttpException ) {
				throw error;
			}
			this.handleErrorService.handleDBException( error );
		}
	}
}
