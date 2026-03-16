import { NgModule } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { jsConsoleKey, jsConsoleReducer } from './reducer';
import { JsConsoleEffects } from './effects';
import { featureKey } from './feature-key';

export const reducers = {
    [jsConsoleKey]: jsConsoleReducer,
};

@NgModule({
    imports: [StoreModule.forFeature(featureKey, reducers), EffectsModule.forFeature([JsConsoleEffects])],
})
export class JsConsoleStoreModule {}
