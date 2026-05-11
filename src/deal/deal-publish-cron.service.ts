import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Cron } from '@nestjs/schedule';
import { DealPublisherService } from './deal-publisher.service';
import { DealService } from './deal.service';

@Injectable()
export class DealPublishCronService {

	private readonly logger = new Logger( DealPublishCronService.name );

	constructor (
		private readonly configService: ConfigService,
		private readonly dealService: DealService,
		private readonly dealPublisherService: DealPublisherService,
	) { }

	@Cron( process.env.PUBLISH_CRON ?? '*/10 * * * *' )
	async publishTick (): Promise<void> {
		const enabled =
			this.configService.get<string>( 'PUBLISH_ENABLED', 'true' ) !== 'false';
		if ( !enabled ) {
			return;
		}

		const start = this.parseHour(
			this.configService.get<string>( 'PUBLISH_WINDOW_START' ),
			9,
		);
		const end = this.parseHour(
			this.configService.get<string>( 'PUBLISH_WINDOW_END' ),
			22,
		);
		const hourUtc = new Date().getUTCHours();
		if ( hourUtc < start || hourUtc > end ) {
			return;
		}

		const max = this.parsePositiveInt(
			this.configService.get<string>( 'PUBLISH_MAX_PER_DAY' ),
			6,
		);
		const today = await this.dealService.countPublishedEventsToday();
		if ( today >= max ) {
			this.logger.debug(
				`Límite diario de publicaciones (${ max }) alcanzado (${ today } en UTC hoy)`,
			);
			return;
		}

		const deal = await this.dealService.findOldestApprovedDeal();
		if ( !deal ) {
			return;
		}

		try {
			await this.dealPublisherService.publishDealToChannel( deal.id );
			this.logger.log(
				`Cron: publicado deal ${ deal.id } (asin=${ deal.asin })`,
			);
		} catch ( error: unknown ) {
			const msg = error instanceof Error ? error.message : String( error );
			this.logger.warn( `Cron: fallo al publicar ${ deal.id }: ${ msg }` );
		}
	}

	private parseHour ( raw: string | undefined, fallback: number ): number {
		const n = parseInt( raw ?? '', 10 );
		if ( !Number.isFinite( n ) || n < 0 || n > 23 ) {
			return fallback;
		}
		return n;
	}

	private parsePositiveInt ( raw: string | undefined, fallback: number ): number {
		const n = parseInt( raw ?? '', 10 );
		if ( !Number.isFinite( n ) || n < 1 ) {
			return fallback;
		}
		return n;
	}
}
