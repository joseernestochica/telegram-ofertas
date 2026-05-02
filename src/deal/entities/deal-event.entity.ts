import {
	Column,
	CreateDateColumn,
	Entity,
	JoinColumn,
	ManyToOne,
	PrimaryGeneratedColumn,
} from 'typeorm';
import { Deal } from './deal.entity';
import { DealEventType } from './deal.enums';

@Entity( 'deal_event' )
export class DealEvent {

	@PrimaryGeneratedColumn( 'uuid' )
	id: string;

	@Column( { type: 'uuid', name: 'deal_id' } )
	dealId: string;

	@ManyToOne( () => Deal, ( deal ) => deal.events, { onDelete: 'CASCADE' } )
	@JoinColumn( { name: 'deal_id' } )
	deal: Deal;

	@Column( { type: 'varchar', length: 32 } )
	type: DealEventType;

	@Column( { type: 'jsonb', nullable: true } )
	metadata: Record<string, unknown> | null;

	@CreateDateColumn( { type: 'timestamptz', name: 'created_at' } )
	createdAt: Date;
}
