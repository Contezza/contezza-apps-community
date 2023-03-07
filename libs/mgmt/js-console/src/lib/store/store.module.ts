import { NgModule } from '@angular/core';

import { routerReducer, StoreRouterConnectingModule } from '@ngrx/router-store';
import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { ContezzaRouterSerializer, routerFeatureKey } from '@contezza/common';

import { jsConsoleKey, jsConsoleReducer } from './reducer';
import { JsConsoleEffects } from './effects';
import { featureKey } from './feature-key';

export const reducers = {
    [routerFeatureKey]: routerReducer,
    [jsConsoleKey]: jsConsoleReducer,
};

@NgModule({
    imports: [
        StoreModule.forFeature(featureKey, reducers),
        EffectsModule.forFeature([JsConsoleEffects]),
        StoreRouterConnectingModule.forRoot({ serializer: ContezzaRouterSerializer }),
    ],
})
export class JsConsoleStoreModule {}
