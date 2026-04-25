export class UserModel {

	id: string;                  // UUID
	email?: string;             // Opcional ya que permite null
	isActive: boolean;
	roles: string[];            // Array de texto
	idTelegram: number;
	isBoot: boolean;
	username: string;
	firstName: string;
	lastName?: string;          // Opcional ya que permite null
	languageCode: string;
	hash?: string;              // UUID opcional
	createdAt: Date;
	updatedAt: Date;
	images: string[];

	constructor () {
		this.id = '';
		this.isActive = false;
		this.roles = [ 'user' ];    // Valor por defecto de la base de datos
		this.idTelegram = 0;
		this.isBoot = false;
		this.username = '';
		this.firstName = '';
		this.languageCode = 'es'; // Valor por defecto de la base de datos
		this.createdAt = new Date();
		this.updatedAt = new Date();
		this.images = [];
	}

	setUser ( user: Partial<UserModel> ) {
		Object.assign( this, user );
	}
} 