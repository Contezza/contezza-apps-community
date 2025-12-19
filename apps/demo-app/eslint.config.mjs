import baseConfig from '../../eslint.config.mjs';

export default [
    ...baseConfig,
    {
        files: ['**/*.ts'],
        rules: {
            '@angular-eslint/directive-selector': [
                'error',
                {
                    type: 'attribute',
                    prefix: ['app'],
                    style: 'camelCase',
                },
            ],
            '@angular-eslint/component-selector': [
                'error',
                {
                    type: 'element',
                    prefix: ['app'],
                    style: 'kebab-case',
                },
            ],
        },
    },
];
