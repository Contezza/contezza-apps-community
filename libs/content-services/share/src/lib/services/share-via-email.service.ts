import { inject, Injectable } from '@angular/core';

import { switchMap } from 'rxjs';

import { EmailParameters, EmailService as CoreEmailService } from '@contezza/core/services';

import { EmailService, ShareActionPayload } from '@contezza/content-services/share/shared';

@Injectable({ providedIn: 'root' })
export class ShareViaEmailService {
    // constructor
    private readonly coreEmailService = inject(CoreEmailService, { optional: true });
    private readonly emailService = inject(EmailService);

    share(payload: ShareActionPayload, parameters: Omit<EmailParameters, 'from'>) {
        if (!this.emailService) {
            throw new Error('No EmailService provided');
        }
        const { nodes, settings, generateLinks } = payload;

        return generateLinks(nodes, settings).pipe(
            switchMap(links => this.emailService.makeEmailBody(links, parameters.body)),
            switchMap(body =>
                this.coreEmailService.send({
                    subject: parameters.subject,
                    to: parameters.to,
                    from: 'noreply@contezza.nl',
                    body,
                }),
            ),
        );
    }
}
