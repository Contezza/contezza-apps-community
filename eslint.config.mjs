import nx from '@nx/eslint-plugin';

import prettier from 'eslint-config-prettier';
import eslintPluginImport from 'eslint-plugin-import';
import jsdoc from 'eslint-plugin-jsdoc';
import rxjsX from 'eslint-plugin-rxjs-x';
import simpleImportSort from 'eslint-plugin-simple-import-sort';
import unusedImports from 'eslint-plugin-unused-imports';

export default [
    // Base Nx / TS / JS / Angular / template configs
    ...nx.configs['flat/base'],
    ...nx.configs['flat/typescript'],
    ...nx.configs['flat/angular'],
    ...nx.configs['flat/angular-template'],

    {
        // Ignore compiled output
        ignores: ['**/dist'],
    },

    {
        // Generic JS/TS files (including CJS/MJS variants)
        files: ['**/*.{ts,tsx,jsx,mts,cts,mjs,cjs}'],
        plugins: {
            'simple-import-sort': simpleImportSort,
            import: eslintPluginImport,
            'unused-imports': unusedImports,
        },
        rules: {
            // Enforce grouped and sorted imports with custom grouping
            'simple-import-sort/imports': [
                'warn',
                {
                    groups: [
                        // 1. Angular packages first
                        ['^@angular'],
                        // 2. Important third-party libraries
                        ['^@nx'],
                        ['^@ngx-translate'],
                        ['^@ngrx'],
                        ['^rxjs'],
                        // 3. Other scoped packages except the ones below
                        ['^@(?!alfresco)(?!contezza)'],
                        // 4. Plain npm packages (e.g. lodash, dayjs)
                        ['^\\w'],
                        // 5. Organisation / product specific scoped packages
                        ['^@alfresco'],
                        ['^@contezza'],
                        // 6. Relative imports from current project
                        ['^\\.'],
                    ],
                },
            ],
            // Enforce sorted export lists as well
            'simple-import-sort/exports': 'warn',

            // The following rules in this block replace WebStorm's funcitonality 'Optimize imports',
            // which conflicts with the previous rules

            // Prefer the fixable duplicate-import rule from eslint-plugin-import
            // (auto-merges multiple imports from the same module)
            'no-duplicate-imports': 'off',
            'import/no-duplicates': 'error',

            // Enforce a single empty line after the full import block (but not between imports)
            'padding-line-between-statements': [
                'error',
                // Always require a blank line *after* imports
                { blankLine: 'always', prev: ['import', 'cjs-import'], next: '*' },
                // Don’t force blank lines *between* import statements
                { blankLine: 'any', prev: ['import', 'cjs-import'], next: ['import', 'cjs-import'] },
            ],

            // Turn off base unused-vars rules (handled by eslint-plugin-unused-imports instead)
            'no-unused-vars': 'off',
            '@typescript-eslint/no-unused-vars': 'off',

            // Remove unused imports and flag unused variables (auto-fixable)
            'unused-imports/no-unused-imports': 'error',
            'unused-imports/no-unused-vars': [
                'error',
                {
                    vars: 'all',
                    varsIgnorePattern: '^_',
                    args: 'after-used',
                    argsIgnorePattern: '^_',
                },
            ],

            // Prefer object property shorthand where possible
            // so `{ foo: foo }` becomes `{ foo }`
            'object-shorthand': ['error', 'always', { avoidQuotes: true }],
        },
    },

    {
        // All JS/TS variants: apply Nx boundary rules
        files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
        rules: {
            // Enforce Nx lib/app dependency rules (no illegal cross-library imports)
            '@nx/enforce-module-boundaries': [
                'error',
                {
                    // Libs that are buildable can only depend on buildable libs
                    enforceBuildableLibDependency: true,
                    // Ignore ESLint config files themselves
                    allow: ['^.*/eslint(\\.base)?\\.config\\.[cm]?js$'],
                    // Currently allow any tag to depend on any tag (no fine-grained tagging yet)
                    depConstraints: [
                        {
                            sourceTag: '*',
                            onlyDependOnLibsWithTags: ['*'],
                        },
                    ],
                },
            ],
        },
    },

    {
        // TypeScript-only rules
        files: ['**/*.ts'],
        languageOptions: {
            parserOptions: {
                // Enable project-aware analysis (type information)
                projectService: true,
            },
        },
        plugins: { 'rxjs-x': rxjsX },
        rules: {
            // Enforce directive selector style: attribute, camelCase, enforced prefix 'contezza'
            '@angular-eslint/directive-selector': [
                'error',
                {
                    type: 'attribute',
                    prefix: ['contezza'],
                    style: 'camelCase',
                },
            ],
            // Enforce component selector style: element, kebab-case, enforced prefix 'contezza'
            '@angular-eslint/component-selector': [
                'error',
                {
                    type: 'element',
                    prefix: ['contezza'],
                    style: 'kebab-case',
                },
            ],

            // Prefer concise arrow function bodies when possible (no unnecessary block/return)
            'arrow-body-style': ['error', 'as-needed'],

            // Prefer arrow functions as callbacks (better `this` semantics, more consistent style)
            'prefer-arrow-callback': ['error', { allowNamedFunctions: false, allowUnboundThis: true }],

            // Turn off base no-shadow (TS version handles it better)
            'no-shadow': 'off',
            // Disallow variable/parameter shadowing using TS-aware rule
            '@typescript-eslint/no-shadow': 'error',

            // Disallow multiple imports of the same module in a file
            'no-duplicate-imports': 'error',

            // Disallow `return await` in async functions when not needed
            'no-return-await': 'error',

            // Enforce consistent class member ordering for readability
            '@typescript-eslint/member-ordering': [
                'warn',
                {
                    default: [
                        // Static fields first (public, then protected/private)
                        'public-static-field',
                        ['protected-static-field', 'private-static-field'],
                        // Static methods
                        'public-static-method',
                        ['protected-static-method', 'private-static-method'],
                        // Instance fields and accessors
                        ['instance-field', 'instance-get', 'instance-set'],
                        // Constructor
                        'constructor',
                        // Instance methods (public then protected/private)
                        'public-instance-method',
                        ['protected-instance-method', 'private-instance-method'],
                    ],
                },
            ],

            // Require class members to be readonly when they are never reassigned
            '@typescript-eslint/prefer-readonly': 'error',

            // Forbid explicit `public` on class members/parameter properties
            // so `public foo` becomes just `foo` (still public, just implicit)
            '@typescript-eslint/explicit-member-accessibility': [
                'error',
                {
                    accessibility: 'no-public',
                },
            ],

            // Apply the recommended RxJS-X rules (best practices for RxJS usage)
            ...rxjsX.configs.recommended.rules,

            // Disallow reading `.value` of Subjects (encourage observables instead, avoid sync coupling)
            'rxjs-x/no-subject-value': 'error',

            // Allow `catchError((err) => { ... })` without forcing explicit `any` typings
            'rxjs-x/no-implicit-any-catch': 'off',
        },
    },

    {
        // Angular templates (HTML) specific rules
        files: ['**/*.html'],
        rules: {
            // Prefer self-closing tags for elements without content in templates
            '@angular-eslint/template/prefer-self-closing-tags': 'error',
        },
    },

    {
        // JSDoc rules for both JS and TS
        files: ['**/*.{js,jsx,ts,tsx}'],
        plugins: { jsdoc },
        rules: {
            // Start from the JSDoc recommended rule set
            ...jsdoc.configs.recommended.rules,

            // Enforce an empty line between description and @tags in JSDoc blocks
            'jsdoc/tag-lines': ['error', 'any', { startLines: 1 }],

            // Optionally require JSDoc on public API; currently disabled
            'jsdoc/require-jsdoc': [
                'off',
                {
                    publicOnly: true,
                    require: {
                        FunctionDeclaration: true,
                        MethodDefinition: true,
                        ClassDeclaration: true,
                    },
                    contexts: ['any'],
                    enableFixer: false,
                },
            ],

            // Don’t require param types in JSDoc (TypeScript already handles types)
            'jsdoc/require-param-type': 'off',

            // Don’t require return types in JSDoc (again, rely on TS)
            'jsdoc/require-returns-type': 'off',

            // Forbid adding types in JSDoc at all in TS code (avoid duplication / drift)
            'jsdoc/no-types': 'error',
        },
    },

    // Prettier config last: turns off style rules that conflict with Prettier formatting
    prettier,
];
