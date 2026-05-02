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

	@Column( { type: 'text', nullable: true } )
	imageUrl: string | null;

	@Column( { type: 'uuid', nullable: true } )
	categoryId: string | null;

	@ManyToOne( () => Category, { nullable: true, onDelete: 'SET NULL' } )
	@JoinColumn( { name: 'categoryId' } )
	category: Category | null;

	@Column( { length: 8, default: 'EUR' } )
	currency: string;

	@Column( { type: 'double precision' } )
	oldPrice: number;

	@Column( { type: 'double precision' } )
	newPrice: number;

	@Column( { type: 'double precision' } )
	discountPct: number;

	@Column( { type: 'text' } )
	affiliateUrl: string;

	@Column( { type: 'varchar', length: 16 } )
	source: DealSource;

	@Column( { type: 'varchar', length: 16 } )
	status: DealStatus;

	@Column( { type: 'timestamptz' } )
	detectedAt: Date;

	@Column( { type: 'timestamptz', nullable: true } )
	publishedAt: Date | null;

	@Column( { type: 'jsonb', nullable: true } )
	externalPayload: Record<string, unknown> | null;

	@OneToMany( () => DealEvent, ( ev ) => ev.deal )
	events: DealEvent[];
}
