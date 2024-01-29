import { Injectable } from '@angular/core';

import { Subject } from 'rxjs';

import { ClassPropertyDescription } from '@alfresco/js-api';

type PropertyWithRequiredName = Omit<ClassPropertyDescription, 'name'> & { name: ClassPropertyDescription['name'] };
type OrLoading<T> = (T & { loading?: boolean; batch?: Subject<string>[] }) | { loading: true; batch: Subject<string>[] };

@Injectable({ providedIn: 'root' })
export class PropertyRegistryService<TExtras extends Record<string, any> = Record<string, never>> extends Map<
    string,
    OrLoading<TExtras extends Record<string, never> ? PropertyWithRequiredName : PropertyWithRequiredName & TExtras>
> {}
