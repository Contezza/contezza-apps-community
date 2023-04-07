import { HttpClient } from '../interfaces';

export abstract class BaseApi {
    protected constructor(protected readonly http: HttpClient) {}
}
