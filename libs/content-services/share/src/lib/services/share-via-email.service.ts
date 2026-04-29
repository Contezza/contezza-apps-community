import { inject, Injectable } from '@angular/core';

import { forkJoin, map, switchMap, take } from 'rxjs';

import { UserProfileService } from '@alfresco/aca-shared';

import { EmailParameters, EmailService } from '@contezza/core/services';

import { GeneratedLink, ShareActionPayload } from '@contezza/content-services/share/shared';

@Injectable({ providedIn: 'root' })
export class ShareViaEmailService {
    private static makeEmailBody(links: GeneratedLink[], sender: string, body: string): string {
        return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd"><html><head>
            <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
        </head>
          <body>
        <table width="100%">
            <body>
                <table width="100%">
                    <tbody>
                        <tr>
                            <td class="wrapper" width="600" align="center">
                                <!-- Header image -->
                                <table class="section header" cellpadding="0" cellspacing="0" width="600">
                                    <tr>
                                        <td class="column">
                                            <table>
                                                <tbody>
                                                    <tr>
                                                        <td align="left">
                                                            <img src="https://docs.contezza.nl/assets/contezza-aca/images/contezza_logo.png" alt="picsum" width="600" style="max-width: 260px;" />
                                                            <h3 style="font-family: Verdana, Geneva, Tahoma, sans-serif; font-size: 24px; padding-bottom: 20px;">Nieuw bericht van ${sender} </h3>
                                                            <p style="font-family: Verdana, Geneva, Tahoma, sans-serif; font-size: 12px; padding-bottom: 20px;">${body}</p>
                                                            <div style="width: 100%; height: 86px; display: flex;">
                                                            ${links
                                                                .map(
                                                                    link =>
                                                                        `<a style="margin: auto; background-color: #212121; font: bold 14px Arial; text-decoration: none; color: whitesmoke; padding: 12px 24px 12px 24px; border: 2px solid #181818" href="${link.link}">${link.label}</a>`,
                                                                )
                                                                .join('<br>')}
                                                            </div>
                                                        </td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        </td>
                                    </tr>
                                </table>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </body>
        </table>
    </body>
    </html>

    `;
    }

    // constructor
    private readonly userProfileService = inject(UserProfileService);
    private readonly emailService = inject(EmailService, { optional: true });

    share(payload: ShareActionPayload, parameters: Omit<EmailParameters, 'from'>) {
        if (!this.emailService) {
            throw new Error('No SEND_EMAIL provided');
        }
        const { nodes, settings, generateLinks } = payload;
        const links$ = generateLinks(nodes, settings);
        const sender$ = this.userProfileService.userProfile$.pipe(
            take(1),
            map(profile => [profile.firstName, profile.lastName].filter(value => !!value).join(' ')),
        );

        return forkJoin([links$, sender$]).pipe(
            switchMap(([links, sender]) => {
                const emailBody = ShareViaEmailService.makeEmailBody(links, sender, parameters.body);
                return this.emailService.send({
                    subject: parameters.subject,
                    to: parameters.to,
                    from: 'noreply@contezza.nl',
                    body: emailBody,
                });
            }),
        );
    }
}
