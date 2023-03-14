import { NgModule } from '@angular/core';

import { routerReducer, StoreRouterConnectingModule } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';

import { featureKey } from './feature-key';
import { ContezzaRouterSerializer } from './serializer';

@NgModule({
    imports: [StoreModule.forFeature(featureKey, routerReducer), StoreRouterConnectingModule.forRoot({ serializer: ContezzaRouterSerializer })],
})
export class RouterStoreModule {}
