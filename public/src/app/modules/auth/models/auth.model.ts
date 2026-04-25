import { UserModel } from "./user.model";

export class AuthModel {

	constructor (

		public user: UserModel,
		public token: string,
		public refreshToken: string,

	) { }
}
