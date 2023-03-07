import { ContezzaLetDirective } from './let.directive';

export interface ContezzaContextWithImplicit<T> {
    $implicit: T;
}

export class ContezzaLetContext<T> implements ContezzaContextWithImplicit<T> {
    constructor(private readonly internalDirectiveInstance: ContezzaLetDirective<T>) {}

    get $implicit(): T {
        return this.internalDirectiveInstance.contezzaLet;
    }

    get contezzaLet(): T {
        return this.internalDirectiveInstance.contezzaLet;
    }
}
