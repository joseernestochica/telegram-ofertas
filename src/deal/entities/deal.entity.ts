import {
	Column,
	Entity,
	Index,
	JoinColumn,
	ManyToOne,
	OneToMany,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Category } from '../../category/entities/category.entity';
import { DealEvent } from './deal-event.entity';
import { DealSource, DealStatus } from './deal.enums';

@Entity( 'deal' )
@Index( [ 'status', 'detectedAt' ] )
@Index( [ 'asin' ], { unique: true } )
@Index( [ 'publishedAt' ] )
export class Deal {

	@PrimaryGeneratedColumn( 'uuid' )
	id: string;

	@Column( { length: 32 } )
	asin: string;

	@Column( { type: 'text' } )
	title: string;

	@Column( { type: 'text', nullable: true, name: 'image_url' } )
	imageUrl: string | null;

	@Column( { type: 'uuid', nullable: true, name: 'category_id' } )
	categoryId: string | null;

	@ManyToOne( () => Category, { nullable: true, onDelete: 'SET NULL' } )
	@JoinColumn( { name: 'category_id' } )
	category: Category | null;

	@Column( { length: 8, default: 'EUR' } )
	currency: string;

	@Column( { type: 'double precision', name: 'old_price' } )
	oldPrice: number;

	@Column( { type: 'double precision', name: 'new_price' } )
	newPrice: number;

	@Column( { type: 'double precision', name: 'discount_pct' } )
	discountPct: number;

	@Column( { type: 'text', name: 'affiliate_url' } )
	affiliateUrl: string;

	/**
	 * URL pública corta para Telegram (p. ej. amzlink.to/…). Si está vacío, se usa tracking o afiliado según env.
	 */
	@Column( { type: 'text', nullable: true, name: 'telegram_offer_url' } )
	telegramOfferUrl: string | null;

	/** Media en Amazon (p. ej. Keepa: valor/10 si llega como 0–50). Rango típico 0–5. */
	@Column( { type: 'double precision', nullable: true, name: 'rating_stars' } )
	ratingStars: number | null;

	/** Número de opiniones en Amazon (Keepa `reviewCount`, etc.). */
	@Column( { type: 'int', nullable: true, name: 'review_count' } )
	reviewCount: number | null;

	/** Clics acumulados en el enlace intermedio (canal Telegram → tracking → Amazon). */
	@Column( { type: 'int', default: 0, name: 'affiliate_click_count' } )
	affiliateClickCount: number;

	@Column( { type: 'varchar', length: 16 } )
	source: DealSource;

	@Column( { type: 'varchar', length: 16 } )
	status: DealStatus;

	@Column( { type: 'timestamptz', name: 'detected_at' } )
	detectedAt: Date;

	@Column( { type: 'timestamptz', nullable: true, name: 'published_at' } )
	publishedAt: Date | null;

	/** Chat donde quedó el mensaje (típico: canal `-100…`), para `editMessageCaption`. */
	@Column( { type: 'varchar', length: 32, nullable: true, name: 'telegram_published_chat_id' } )
	telegramPublishedChatId: string | null;

	/** `message_id` devuelto por Telegram al publicar la ficha con foto o texto. */
	@Column( { type: 'int', nullable: true, name: 'telegram_published_message_id' } )
	telegramPublishedMessageId: number | null;

	/** `true` si se usó `sendPhoto`; si `false`, el mensaje es texto y las ediciones van con `editMessageText`. */
	@Column( { type: 'boolean', default: false, name: 'telegram_published_is_photo' } )
	telegramPublishedIsPhoto: boolean;

	@Column( { type: 'jsonb', nullable: true, name: 'external_payload' } )
	externalPayload: Record<string, unknown> | null;

	@OneToMany( () => DealEvent, ( ev ) => ev.deal )
	events: DealEvent[];
}
