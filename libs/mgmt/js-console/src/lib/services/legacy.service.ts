import { Injectable } from '@angular/core';

import { IJsConsoleService } from '@contezza/js-console/shared';

@Injectable({ providedIn: 'root' })
export class LegacyService implements IJsConsoleService {
    check() {
        return 'legacy';
    }

    // TODO: implement interface methods
}
