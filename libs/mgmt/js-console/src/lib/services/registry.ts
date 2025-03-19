import { Injectable } from '@angular/core';
import { IJsConsoleService, ServiceKey } from '@contezza/js-console/shared';

import { OotbService } from './ootb.service';
import { LegacyService } from './legacy.service';

@Injectable({ providedIn: 'root' })
export class Registry extends Map<ServiceKey, IJsConsoleService> {
    constructor(legacy: LegacyService, ootb: OotbService) {
        super([
            [ServiceKey.LEGACY, legacy],
            [ServiceKey.OOTB, ootb],
        ]);
    }
}
