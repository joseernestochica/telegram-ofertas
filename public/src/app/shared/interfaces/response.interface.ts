
export interface Response<T> {
	data?: T[] | T;
	total?: number;
	page?: number;
	lastPage?: number;
	message?: string;
	statusCode?: number;
}
