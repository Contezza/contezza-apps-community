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

    static asArray<T>(x: OrArray<T>): T[] {
        return Array.isArray(x) ? x : [x];
    }
}
