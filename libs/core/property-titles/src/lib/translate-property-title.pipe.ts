import { Pipe, PipeTransform } from '@angular/core';

import { TranslateService } from '@ngx-translate/core';

import { map, Observable, startWith } from 'rxjs';

import { PropertyTitleService } from './property-title.service';

/**
 * Transforms a key into an observable which retrieves an Alfresco property from the repository and returns its title.
 * Moreover, this observable reacts to language changes in the app (based on `@ngx-translate`) and updates the title accordingly.
 */
@Pipe({ standalone: true, name: 'translatePropertyTitle' })
export class TranslatePropertyTitlePipe implements PipeTransform {
    private readonly language$ = this.translate.onLangChange.pipe(
        map((_) => _.lang),
        startWith(this.translate.currentLang)
    );

    constructor(private readonly translate: TranslateService, private readonly service: PropertyTitleService) {}

    transform(key: string): Observable<string> | undefined {
        return this.service.get(key, this.language$);
    }
}
