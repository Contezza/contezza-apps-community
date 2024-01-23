import { Injectable } from '@angular/core';

import { ClassPropertyDescription } from '@alfresco/js-api';

@Injectable({ providedIn: 'root' })
export class PropertyRegistryService<TExtras extends Record<string, any> = Record<string, never>> extends Map<
    string,
    TExtras extends Record<string, never> ? ClassPropertyDescription : ClassPropertyDescription & TExtras
> {}
