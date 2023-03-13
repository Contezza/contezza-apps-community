import { NgModule } from '@angular/core';

import { StoreModule } from '@ngrx/store';
import { EffectsModule } from '@ngrx/effects';
import { routerReducer, StoreRouterConnectingModule } from '@ngrx/router-store';

import { ContezzaRouterSerializer, routerFeatureKey } from '@contezza/core/utils';

import { nodeBrowserKey, nodeBrowserReducer } from './reducer';
import { NodeBrowserEffects } from './effects';

export const featureKey = 'node-browser';

export const reducers = {
    [routerFeatureKey]: routerReducer,
    [nodeBrowserKey]: nodeBrowserReducer,
};

@NgModule({
    imports: [
        StoreModule.forFeature(featureKey, reducers),
        EffectsModule.forFeature([NodeBrowserEffects]),
        StoreRouterConnectingModule.forRoot({ serializer: ContezzaRouterSerializer }),
    ],
})
export class NodeBrowserStoreModule {}
