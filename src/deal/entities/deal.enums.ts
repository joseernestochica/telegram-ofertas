export enum DealSource {
	KEEPA = 'keepa',
	MANUAL = 'manual',
	PAAPI = 'paapi',
}

export enum DealStatus {
	PENDING = 'PENDING',
	APPROVED = 'APPROVED',
	PUBLISHED = 'PUBLISHED',
	SKIPPED = 'SKIPPED',
	EXPIRED = 'EXPIRED',
}

export enum DealEventType {
	DETECTED = 'detected',
	APPROVED = 'approved',
	PUBLISHED = 'published',
	SKIPPED = 'skipped',
	ERROR = 'error',
}
