import { NgModule } from '@angular/core';

import { routerReducer, RouterStateSerializer } from '@ngrx/router-store';
import { StoreModule } from '@ngrx/store';

import { featureKey } from './feature-key';
import { SerializerService } from './serializer.service';

@NgModule({
    imports: [StoreModule.forFeature(featureKey, routerReducer)],
    providers: [{ provide: RouterStateSerializer, useExisting: SerializerService }],
})
export class RouterStoreModule {}
