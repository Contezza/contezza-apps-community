import { inject, Injectable, InjectionToken, Provider } from '@angular/core';

import { IResolver, provideResolvers, Resolver, ResolverProvider } from '@contezza/core/utils';

/**
 * Input object for {@link MetadataComponent}.
 */
export interface MetadataInput<TItem> {
    item: TItem;
    propertyDisplayListId: string;
    actionId?: string;
}

export type IMetadataInputResolver<TItem = unknown> = IResolver<unknown, MetadataInput<TItem>>;

const METADATA_INPUT_RESOLVER = new InjectionToken<IMetadataInputResolver[]>('METADATA_INPUT_RESOLVER');

/**
 * Registers the given {@link IMetadataInputResolver}'s in {@link MetadataInputResolver}.
 *
 * @param resolvers
 */
export function provideMetadataInputResolvers(...resolvers: ResolverProvider<IMetadataInputResolver>[]): Provider[] {
    return provideResolvers(METADATA_INPUT_RESOLVER, ...resolvers);
}

@Injectable({ providedIn: 'root' })
export class MetadataInputResolver extends Resolver<unknown, MetadataInput<unknown>> {
    constructor() {
        super(inject(METADATA_INPUT_RESOLVER, { optional: true }) ?? []);
    }
}
