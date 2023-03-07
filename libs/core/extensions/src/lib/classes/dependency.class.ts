import { Observable, ReplaySubject } from 'rxjs';
import { filter } from 'rxjs/operators';

export class ContezzaDependency<T = any> {
    private isDestroyed = false;
    private subject = new ReplaySubject<T>(1);

    constructor(public key: string) {}

    get source(): Observable<T> {
        return this.subject.pipe(filter(() => !this.isDestroyed));
    }

    destroy() {
        this.isDestroyed = true;
    }

    next(value?: T) {
        this.isDestroyed = false;
        this.subject.next(value);
    }
}
