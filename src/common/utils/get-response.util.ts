import { GetResponse } from '../interfaces/get-response.interface';

export function buildGetResponse<T> (
	data: T | T[],
	meta?: Pick<GetResponse<T>, 'total' | 'page' | 'lastPage' | 'message'>,
): GetResponse<T> {
	return {
		data,
		statusCode: 200,
		...meta,
	};
}
