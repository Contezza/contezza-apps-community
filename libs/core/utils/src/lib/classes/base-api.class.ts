import { HttpClient } from '../interfaces';

export abstract class BaseApi {
    constructor(protected readonly http: HttpClient) {}
}
