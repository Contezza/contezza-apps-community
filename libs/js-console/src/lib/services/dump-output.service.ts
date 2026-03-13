import { Injectable } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';

@Injectable({
    providedIn: 'root',
})
export class JsConsoleDumpOutputService {
    getDatasource(dumpInfoData, dataColumns): MatTableDataSource<any> {
        const transposedData = [];
        for (let i = 0; i < dataColumns.length; i++) {
            transposedData[i] = {
                label: dataColumns[i],
            };

            for (let row = 0; row < dumpInfoData.length; row++) {
                transposedData[i][`column${row}`] = dumpInfoData[row][dataColumns[i]];
            }
        }
        return new MatTableDataSource(transposedData);
    }

    constructDumpInfo(json): { columns: Array<string>; data: Array<any> } {
        const rows = new Map();

        for (let i = 0; i < json.length; i++) {
            const dumpData = typeof json[i] != 'object' ? json[i] : json[i].json;
            const dump = JSON.parse(dumpData);
            const rowId = i + ' ' + dump.properties['cm:name'] + ' (' + dump.nodeRef + ')';

            for (const prop in dump.properties) {
                if (dump.properties.hasOwnProperty(prop)) {
                    let row = rows.get(prop);
                    if (row == null) {
                        row = { Rows: prop };
                    }
                    row[rowId] = dump.properties[prop];
                    rows.set(prop, row);
                }
            }

            delete dump['properties'];

            const aspects = dump.aspects.join('\r\n');

            let aspectRow = rows.get('aspects');
            if (aspectRow == null) {
                aspectRow = { Rows: 'aspects' };
            }

            aspectRow[rowId] = aspects;
            rows.set('aspects', aspectRow);

            delete dump['aspects'];

            const tags = dump.tags.join('\r\n');

            let tagsRow = rows.get('tags');
            if (tagsRow == null) {
                tagsRow = { Rows: 'tags' };
            }

            tagsRow[rowId] = tags;
            rows.set('tags', tagsRow);

            delete dump['tags'];

            for (let j = 0; j < dump.permissions.length; j++) {
                const permission = dump.permissions[j];
                let row = rows.get('permission ' + j);
                if (row == null) {
                    row = { Rows: 'permission ' + j };
                }
                row[rowId] = `${permission.authority} (${permission.authorityType}) ${permission.accessStatus} ${permission.permission} (directly: ${permission.directly})`;
                rows.set('permission ' + j, row);
            }

            delete dump['permissions'];

            for (const prop in dump) {
                if (dump.hasOwnProperty(prop)) {
                    let row = rows.get(prop);
                    if (row == null) {
                        row = { Rows: prop };
                    }
                    row[rowId] = dump[prop];
                    rows.set(prop, row);
                }
            }
        }

        const columns = [];
        const data = [];

        rows.forEach((row, key) => columns.push(key));
        columns.sort();

        rows.forEach((row) => {
            const column = row['Rows'];

            delete row['Rows'];

            Object.keys(row).forEach((key, index) => {
                if (data?.[index]) {
                    data[index][column] = row[key];
                } else {
                    data.push({
                        column: row[key],
                    });
                }
            });
        });

        return {
            columns,
            data,
        };
    }
}
