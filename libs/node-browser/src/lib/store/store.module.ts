import { NgModule } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';
import { StoreModule } from '@ngrx/store';

import { nodeBrowserKey, nodeBrowserReducer } from './reducer';
import { NodeBrowserEffects } from './effects';
import { featureKey } from './feature-key';

export const reducers = {
    [nodeBrowserKey]: nodeBrowserReducer,
};

@NgModule({
    imports: [StoreModule.forFeature(featureKey, reducers), EffectsModule.forFeature([NodeBrowserEffects])],
})
export class NodeBrowserStoreModule {}
