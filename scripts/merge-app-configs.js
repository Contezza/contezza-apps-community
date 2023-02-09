// noinspection JSCheckFunctionSignatures,JSUnresolvedVariable

const fs = require('fs');
const path = require('path');
const app = process.argv.slice(2)[0];
const acaPath = 'apps/content-ce/app/src';
const configsPath = `apps/${app}/config`;
const featuresPath = `apps/${app}/config/features`;

if (fs.existsSync(configsPath)) {
    let projectFeatures = {};

    if (fs.existsSync(featuresPath)) {
        for (const feature of fs.readdirSync(outDir(featuresPath))) {
            const featureData = JSON.parse(fs.readFileSync(`${outDir(featuresPath)}/${feature}`));
            projectFeatures = { ...projectFeatures, ...featureData };
        }
    }
    for (const config of fs.readdirSync(outDir(configsPath))) {
        if (config.includes('app.')) {
            mergify(config, projectFeatures);
        }
    }
}

function mergify(target, features) {
    fs.readFile(`${configsPath}/${target}`, (err, targetData) => {
        if (err) throw err;

        let config = JSON.parse(targetData);
        if (features !== {}) {
            config.features = features;
        }
        config.$schema = '../../../node_modules/@alfresco/adf-core/app.config.schema.json';

        let mergedConfig = JSON.stringify(config, null, 4);

        fs.writeFileSync(`${acaPath}/${target}`, mergedConfig);
    });
}

function outDir(dir) {
    return path.join(__dirname, `../${dir}`);
}
