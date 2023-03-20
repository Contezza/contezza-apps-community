export type OrArray<T> = T | T[];

export class ContezzaArrayUtils {
    static partition<T>(items: T[], condition: (item: T) => boolean): [T[], T[]] {
        return items.reduce(
            ([trues, falses], item) => {
                if (condition(item)) {
                    trues.push(item);
                } else {
                    falses.push(item);
                }
                return [trues, falses];
            },
            [[], []]
        );
    }

    /**
     * Partitions the given array based on the given function.
     * The function associates a key to each array element, elements having the same key are grouped together.
     * The object having these keys as keys and the corresponding element groups as values is returned.
     *
     * @param array An array to be partitioned.
     * @param keyExtractor Function which associates a key to each array element
     */
    static partitionByKey<T, KeyType extends string = string>(array: T[], keyExtractor: (item: T) => KeyType): Record<KeyType, T[]> {
        return array.reduce((acc, item) => {
            const key = keyExtractor(item);
            if (!acc[key]) {
                acc[key] = [];
            }
            acc[key].push(item);
            return acc;
        }, {} as Record<KeyType, T[]>);
    }

    static sortBy<T>(array: T[], property: keyof T): T[] {
        return array.sort((a, b) => {
            const nameA = a[property];
            const nameB = b[property];
            if (nameA < nameB) {
                return -1;
            } else if (nameA > nameB) {
                return 1;
            } else {
                return 0;
            }
        });
    }

    /**
     * Returns `[0, 1, ..., end - 1]`.
     *
     * @param end Stops the sequence if matched or exceeded.
     */
    static range(end: number): number[];
    /**
     * Returns `[start, start + step, start + 2 * step, ...]`. The sequence stops as the parameter `end` is matched or exceeded.
     * Backwards sequences are also supported.
     *
     * @param start First element of the returned array.
     * @param end Stops the sequence if matched or exceeded.
     * @param step Increment (or decrement) between two consecutive array elements. Optional, defaults to `1` or `-1` depending on the trend of the sequence.
     */
    static range(start: number, end: number, step?: number): number[];
    static range(startOrEnd: number, end?: number, step?: number): number[] {
        if (end === null || end === undefined) {
            end = startOrEnd;
            startOrEnd = 0;
        }
        if (!step) {
            step = end >= startOrEnd ? 1 : -1;
        }

        const output: number[] = [];
        for (let i = startOrEnd; step > 0 ? i < end : i > end; i = i + step) {
            output.push(i);
        }
        return output;
    }

    /**
     * Checks for array equality. Allows to define a custom comparison function and to specify if order matters.
     *
     * @param v First array.
     * @param w Second array.
     * @param options Optional parameters: * `comparator` allows to define a custom comparison function, defaults to `===`; * `ordered` specifies if order matters when comparing arrays, in other words "shuffled" arrays are equal if this parameters is `false`, defaults to `false`.
     */
    static areEqual<T>(v: T[], w: T[], options?: { comparator: (x: T, y: T) => boolean; ordered: boolean }): boolean {
        // setting default options
        const comparator = options?.comparator || ((x, y) => x === y);
        const ordered = options?.ordered;

        if (v.length !== w.length) {
            // if arrays have different length, then they are not equal
            return false;
        } else if (ordered) {
            // if order matters, then every element of the first array is compared with the corresponding element of the second array
            return ContezzaArrayUtils.range(v.length).every((i) => comparator(v[i], w[i]));
        } else {
            // otherwise, for each element of the first array a match in the second array must be found
            // a copy of the second array is used, so that matched element can be deleted, to take repetitions into account
            const wCopy = [...w];
            let i = 0;
            let equal = true;
            while (i < v.length && equal) {
                const match = wCopy.findIndex((y) => comparator(v[i], y));
                if (match > -1) {
                    wCopy.splice(match, 1);
                } else {
                    equal = false;
                }
                i++;
            }
            return equal;
        }
    }

    static asArray<T>(x: OrArray<T>): T[] {
        return Array.isArray(x) ? x : [x];
    }

    /**
     * Implements https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/findLast
     *
     * @param array
     * @param callbackFn
     */
    static findLast<T>(array: T[], callbackFn: (item: T) => boolean): T {
        let match: T;
        let i = array.length - 1;
        while (!match && i >= 0) {
            if (callbackFn(array[i])) {
                match = array[i];
            }
            i--;
        }
        return match;
    }
}
