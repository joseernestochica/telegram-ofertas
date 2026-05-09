import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AmazonService {

	private readonly tag: string;
	private readonly marketplaceHost: string;

	constructor ( private readonly configService: ConfigService ) {
		this.tag = this.configService.get<string>( 'AMAZON_AFFILIATE_TAG' ) ?? 'gangabot06-21';
		this.marketplaceHost = this.configService.get<string>( 'AMAZON_MARKETPLACE' ) ?? 'www.amazon.es';
	}

	/** URL de producto con tag de afiliado (Amazon.es por defecto). */
	buildAffiliateUrl ( asin: string ): string {
		const clean = asin.trim().toUpperCase();
		return `https://${ this.marketplaceHost }/dp/${ clean }?tag=${ encodeURIComponent( this.tag ) }`;
	}
}
