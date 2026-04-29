import { inject, Injectable } from '@angular/core';

import { Actions, createEffect, ofType } from '@ngrx/effects';

import { filter, map, of, switchMap } from 'rxjs';

import { DialogLoaderService, DialogService } from '@contezza/core/dialogs';
import { EffectsHelper } from '@contezza/core/effects-helper';
import { showSnackbarInfo } from '@contezza/core/notifications';
import { TRANSLATE } from '@contezza/core/translate';

import { email, ExtensionService, share, show } from '@contezza/content-services/share/shared';
import { DynamicFormDialogService } from '@contezza/dynamic-forms/dialog';

import { ShareViaEmailService } from '../services/share-via-email.service';

@Injectable()
export class Effects {
    private readonly actions$ = inject(Actions);
    private readonly helper = inject(EffectsHelper);
    private readonly translate = inject(TRANSLATE);
    private readonly dialog = inject(DialogService);
    private readonly dialogLoader = inject(DialogLoaderService);
    private readonly dfDialog = inject(DynamicFormDialogService);
    private readonly extensions = inject(ExtensionService);
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
            switchMap(({ payload }) => {
                const { nodes } = payload;

                const number = nodes.length;
                const singular = number === 1;
                const body = singular
                    ? this.translate('CONTENT_SERVICES.SHARE.DIALOGS.EMAIL.DEFAULT_BODY.SINGLE')
                    : this.translate('CONTENT_SERVICES.SHARE.DIALOGS.EMAIL.DEFAULT_BODY.MULTIPLE', { number });

                return this.dfDialog
                    .open({
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
                    })
                    .pipe(
                        filter(Boolean),
                        this.helper.execute(response => this.shareViaEmailService.share(payload, response)),
                    );
            }),
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
