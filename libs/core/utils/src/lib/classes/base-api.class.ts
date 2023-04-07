import { HttpClient } from '@contezza/core/utils';

export abstract class BaseApi {
    protected constructor(protected readonly http: HttpClient) {}
}
