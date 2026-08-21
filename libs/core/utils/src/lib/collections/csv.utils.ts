export class CsvUtils {
    /**
     * Parses CSV content into an array of objects.
     *
     * The first non-empty row is used as the header and determines the property
     * names of the resulting objects. Each subsequent non-empty row is converted
     * into an object by mapping its values to the corresponding header fields.
     *
     * Supports `\n`, `\r\n`, and `\r` line endings, as well as quoted and unquoted
     * CSV fields. Empty field values are omitted from the resulting objects.
     *
     * @template T The type of objects represented by the CSV rows.
     * @param csv The CSV content to parse.
     * @returns The CSV headers as `keys` and the parsed rows as `objects`.
     *
     * @example
     * CsvUtils.parse<{ name: string; age: string }>(
     *     'name,age\nAlice,30\nBob,25'
     * );
     * // => {
     * //     keys: ['name', 'age'],
     * //     objects: [
     * //         { name: 'Alice', age: '30' },
     * //         { name: 'Bob', age: '25' }
     * //     ]
     * // }
     */
    static parse<T>(csv: string): { keys: string[]; objects: T[] } {
        const [titleRow, ...objectRows] = csv.split(/\r\n|\n|\r/).filter(row => row.trim().length > 0);
        // read object keys from first row
        const keys = CsvUtils.parseRow(titleRow);
        if (objectRows.length === 0) {
            return { keys, objects: [] };
        }
        // parse other rows and make objects
        const objects = objectRows.map(row => {
            const rowEntries = CsvUtils.parseRow(row);
            const obj = {} as T;
            rowEntries.forEach((entry, index) => {
                if (entry) {
                    obj[keys[index]] = entry;
                }
            });
            return obj;
        });
        return { keys, objects };
    }

    /**
     * Parses a single CSV row into an array of field values.
     *
     * Supports quoted and unquoted fields, commas within quoted fields,
     * and double quotes escaped as `""`.
     *
     * @param row The CSV row to parse.
     * @returns The parsed field values in their original order.
     *
     * @example
     * CsvUtils.parseRow('first,"hello, world",third');
     * // => ['first', 'hello, world', 'third']
     *
     * @example
     * CsvUtils.parseRow('first,"he said ""hello""",third');
     * // => ['first', 'he said "hello"', 'third']
     */
    static parseRow(row: string): string[] {
        const result: string[] = [];
        let value = '';
        let quoted = false;

        for (let i = 0; i < row.length; i++) {
            const char = row[i];

            if (char === '"') {
                // CSV escapes a quote inside a quoted field as ""
                if (quoted && row[i + 1] === '"') {
                    value += '"';
                    i++;
                } else {
                    quoted = !quoted;
                }
            } else if (char === ',' && !quoted) {
                result.push(value);
                value = '';
            } else {
                value += char;
            }
        }
        result.push(value);
        return result;
    }
}
