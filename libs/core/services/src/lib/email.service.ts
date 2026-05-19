import { Observable } from 'rxjs';

export interface EmailParameters {
    from: string;
    to: string;
    subject: string;
    body: string;
}

/**
 * Base contract for sending emails.
 *
 * Implementations of this service are responsible for delivering email messages using a specific provider or transport mechanism.
 */
export abstract class EmailService {
    /**
     * Sends an email using the provided parameters.
     *
     * @param parameters - Configuration and content required to send the email.
     * @returns An observable that emits the provider response or completion state.
     */
    abstract send(parameters: EmailParameters): Observable<unknown>;
}
