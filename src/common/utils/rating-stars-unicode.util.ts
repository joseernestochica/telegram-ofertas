/** Estrellas ★/☆ en texto plano (vista previa web y caption Telegram). */
export function renderRatingStarsUnicode ( rating: number ): string {
	const filled = Math.min( 5, Math.max( 0, Math.round( rating ) ) );
	let out = '';
	for ( let i = 1; i <= 5; i += 1 ) {
		out += i <= filled ? '★' : '☆';
	}
	return out;
}
