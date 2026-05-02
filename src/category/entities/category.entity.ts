import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity( 'category' )
@Index( [ 'slug' ], { unique: true } )
export class Category {

	@PrimaryGeneratedColumn( 'uuid' )
	id: string;

	@Column( { unique: true } )
	name: string;

	@Column( { unique: true } )
	slug: string;

	@Column()
	hashtag: string;

	@Column( { type: 'varchar', nullable: true, name: 'amazon_node_id' } )
	amazonNodeId: string | null;
}
