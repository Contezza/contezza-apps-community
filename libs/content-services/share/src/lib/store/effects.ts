import { inject, Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { filter, map, switchMap } from 'rxjs';

import { DialogLoaderService, DialogService } from '@contezza/core/dialogs';
import { EffectsHelper } from '@contezza/core/effects-helper';
import { showSnackbarInfo } from '@contezza/core/notifications';

import { email, EmailService, ExtensionService, share, show } from '@contezza/content-services/share/shared';

import { ShareViaEmailService } from '../services/share-via-email.service';

@Injectable()
export class Effects {
    // constructor
    private readonly actions$ = inject(Actions);
    private readonly helper = inject(EffectsHelper);
    private readonly dialog = inject(DialogService);
    private readonly dialogLoader = inject(DialogLoaderService);
    private readonly extensions = inject(ExtensionService);
    private readonly emailService = inject(EmailService);
    private readonly shareViaEmailService = inject(ShareViaEmailService);

    readonly share$ = createEffect(() =>
        this.actions$.pipe(
            ofType(share),
            this.helper.getPayload('nodes'),
            switchMap(nodes =>
                this.dialogLoader
                    .open(() => import('@contezza/content-services/share/components/settings-form').then(m => m.SettingsFormDialogComponent), {
                        width: '600px',
                        autoFocus: false,
                        data: {
                            nodes,
                        },
                    })
                    .pipe(
                        filter(Boolean),
                        map(settings => this.extensions.makeShareAction(nodes, settings)),
                    ),
            ),
        ),
    );

    // channel actions

    readonly email$ = createEffect(() =>
        this.actions$.pipe(
            ofType(email),
            switchMap(({ payload }) =>
                this.emailService.openEmailDialog(payload.nodes).pipe(
                    filter(Boolean),
                    this.helper.execute(response => this.shareViaEmailService.share(payload, response)),
                ),
            ),
            map(() => showSnackbarInfo({ payload: 'CONTENT_SERVICES.SHARE.MESSAGES.INFO.SHARED' })),
        ),
    );

    readonly show$ = createEffect(
        () =>
            this.actions$.pipe(
                ofType(show),
                switchMap(action => {
                    const { generateLinks, nodes, settings } = action.payload;
                    return generateLinks(nodes, settings);
                }),
                switchMap(links =>
                    this.dialog.open({
                        width: '700px',
                        autoFocus: false,
                        data: {
                            title: 'CONTENT_SERVICES.SHARE.DIALOGS.LINKS.TITLE',
                            content: {
                                component: () => import('@contezza/content-services/share/components/links').then(_ => _.LinksComponent),
                                inputs: { links: links.map(_ => _.link) },
                            },
                            actions: [
                                {
                                    id: 'close',
                                    title: 'APP.BUTTONS.CLOSE',
                                },
                            ],
                        },
                    }),
                ),
            ),
        { dispatch: false },
    );
}
