export class JsonRegistry<ValueType> {
    private readonly register = {};

    get(id: string | string[]): ValueType {
        return this.has(id) && JSON.parse(JSON.stringify(this.getTarget(id)));
    }

    has(id: string | string[]): boolean {
        return !!this.getTarget(id);
    }

    set(id: string | string[], value: ValueType) {
        this.setTarget(id, JSON.parse(JSON.stringify(value)));
    }

    private getTarget(id: string | string[]): any {
        if (typeof id === 'string') {
            id = [id];
        }
        let target = this.register;
        id.forEach((coord) => (target = target?.[coord]));
        return target;
    }

    private setTarget(id: string | string[], value: ValueType) {
        if (typeof id === 'string') {
            id = [id];
        }
        let target = this.register;
        for (let i = 0; i < id.length - 1; i++) {
            const coord = id[i];
            if (!target?.[coord]) {
                target[coord] = {};
            }
            target = target[coord];
        }
        target[id[id.length - 1]] = value;
    }
}
