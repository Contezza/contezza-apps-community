import { NgModule } from '@angular/core';

import { EffectsModule } from '@ngrx/effects';

import { ErrorHandler } from './services/error.handler';
import { Effects } from './store/effects';

@NgModule({
    imports: [EffectsModule.forFeature([Effects])],
    providers: [ErrorHandler.PROVIDER],
})
export class NotificationsModule {}
