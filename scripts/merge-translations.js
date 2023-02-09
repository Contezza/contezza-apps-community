// noinspection JSCheckFunctionSignatures,JSUnresolvedVariable

const fs = require('fs');
const i18n = 'apps/content-ce/app/src/assets/i18n';
const nl = `nl.json`;

// NL
fs.readFile(`${i18n}/${nl}`, (err, data) => {
    if (err) throw err;

    let payload = JSON.parse(data);

    payload.CORE.METADATA.ACTIONS = {
        SAVE: 'Opslaan',
        CANCEL: 'Negeren',
    };

    write(nl, payload);
});

function write(json, payload) {
    fs.writeFileSync(`${i18n}/${json}`, JSON.stringify(payload, null, 4));
}
