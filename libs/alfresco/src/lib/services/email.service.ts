import { inject, Injectable, makeEnvironmentProviders } from '@angular/core';

import { Store } from '@ngrx/store';

import { filter, map, Observable, switchMap, take } from 'rxjs';

import { AppStore, getAppSelection } from '@alfresco/aca-shared/store';

import { EmailParameters, EmailService as CoreEmailService } from '@contezza/core/services';
import { AlfrescoUtils } from '@contezza/core/utils';

import { CommunityRepoApi, mailAction } from '@contezza/alfresco/apis';

@Injectable()
export class EmailService extends CoreEmailService {
    static provide() {
        return makeEnvironmentProviders([
            {
                provide: CoreEmailService,
                useClass: EmailService,
            },
        ]);
    }

    // constructor
    private readonly store = inject<Store<AppStore>>(Store);
    private readonly api = inject(CommunityRepoApi);

    send(parameters: EmailParameters): Observable<unknown> {
        // use last selected node as actionedUponNode because this parameter is required by actionQueue
        return this.store.select(getAppSelection).pipe(
            take(1),
            map(selection => selection.last?.entry.id),
            filter(Boolean),
            switchMap(id => {
                const { body, ...rest } = parameters;
                return this.api.queueAction(
                    {},
                    mailAction(AlfrescoUtils.toNoderef(id), {
                        ...rest,
                        text: body,
                    }),
                );
            }),
        );
    }
}
