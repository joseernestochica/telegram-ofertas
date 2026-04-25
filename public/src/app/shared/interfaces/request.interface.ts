export interface Request<T> {
	body?: T;
	id?: string;
	page?: number;
	limit?: number;
	sort?: string;
	order?: string;
}