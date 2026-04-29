import { Observable } from 'rxjs';

export interface EmailParameters {
    from: string;
    to: string;
    subject: string;
    body: string;
}

export abstract class EmailService {
    abstract send(parameters: EmailParameters): Observable<unknown>;
}
