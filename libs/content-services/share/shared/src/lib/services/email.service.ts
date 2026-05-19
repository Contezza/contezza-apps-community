import { inject, Injectable } from '@angular/core';

import { map, Observable, of, take } from 'rxjs';

import { UserProfileService } from '@alfresco/aca-shared';
import { Node } from '@alfresco/js-api';

import { EmailParameters } from '@contezza/core/services';
import { TRANSLATE } from '@contezza/core/translate';

import { DynamicFormDialogService } from '@contezza/dynamic-forms/dialog';

import { GeneratedLink } from '../models';

/**
 * Generates and formats emails to be shared.
 * The logic in this service was originally part of {@link Effects} and {@link ShareViaEmailService} and then moved to be available in other libraries.
 */
@Injectable({ providedIn: 'root' })
export class EmailService {
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
    private readonly translate = inject(TRANSLATE);
    private readonly dfDialog = inject(DynamicFormDialogService);

    openEmailDialog(nodes: Node[]): Observable<Omit<EmailParameters, 'from'> | null | undefined> {
        const number = nodes.length;
        const singular = number === 1;
        const body = singular
            ? this.translate('CONTENT_SERVICES.SHARE.DIALOGS.EMAIL.DEFAULT_BODY.SINGLE')
            : this.translate('CONTENT_SERVICES.SHARE.DIALOGS.EMAIL.DEFAULT_BODY.MULTIPLE', { number });

        return this.dfDialog.open<Omit<EmailParameters, 'from'>>({
            width: '700px',
            data: {
                title: singular
                    ? {
                          label: 'CONTENT_SERVICES.SHARE.DIALOGS.EMAIL.TITLE.SINGLE',
                          params: { name: nodes[0].name },
                      }
                    : {
                          label: 'CONTENT_SERVICES.SHARE.DIALOGS.EMAIL.TITLE.MULTIPLE',
                          params: { number },
                      },
                dynamicFormId: {
                    id: 'content-services.dynamic-forms.email',
                    providedDependencies: { initialValue: of({ body }) },
                },
                buttons: { cancel: 'APP.BUTTONS.CANCEL', submit: 'CONTENT_SERVICES.SHARE.ACTIONS.SHARE' },
            },
        });
    }

    makeEmailBody(links: GeneratedLink[], message: string) {
        return this.userProfileService.userProfile$
            .pipe(
                take(1),
                map(profile => [profile.firstName, profile.lastName].filter(value => !!value).join(' ')),
            )
            .pipe(map(sender => EmailService.makeEmailBody(links, sender, message)));
    }
}
