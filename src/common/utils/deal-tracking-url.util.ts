/**
 * URL pública que registra el clic y redirige al `affiliateUrl` del deal.
 * Requiere `APP_PUBLIC_URL` apuntando al mismo backend que sirve `GET /api/track/deals/:id`.
 */
export function buildDealAffiliateTrackingUrl (
	publicBaseUrl: string,
	dealId: string,
): string {
	const base = publicBaseUrl.replace( /\/+$/, '' );
	return `${ base }/api/track/deals/${ dealId }`;
}
