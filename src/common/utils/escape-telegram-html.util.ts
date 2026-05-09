/** Caracteres que deben escaparse para parse_mode HTML de Telegram (texto libre). */
export function escapeTelegramHtml ( raw: string ): string {
	return raw
		.replace( /&/g, '&amp;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' );
}

/** Valores dentro de atributos HTML (p. ej. `src`/`href` en la vista previa navegador). */
export function escapeHtmlAttr ( raw: string ): string {
	return raw
		.replace( /&/g, '&amp;' )
		.replace( /"/g, '&quot;' )
		.replace( /'/g, '&#39;' )
		.replace( /</g, '&lt;' )
		.replace( />/g, '&gt;' );
}
