import { Params } from '@angular/router';

export interface ContezzaRouterState {
    url: string;
    params?: Params;
    queryParams?: Params;
    fragment?: string;
}
