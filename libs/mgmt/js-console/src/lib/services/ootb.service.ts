import { Injectable } from '@angular/core';

import { IJsConsoleService } from '@contezza/js-console/shared';

@Injectable({ providedIn: 'root' })
export class OotbService implements IJsConsoleService {
    check() {
        return 'ootb';
    }

    // TODO: implement interface methods
}
