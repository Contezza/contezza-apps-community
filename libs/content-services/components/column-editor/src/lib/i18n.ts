import { getTranslationMapper, Translations } from '@contezza/core/translate';

export const translationModel = {
    CONTEZZA: {
        CONTENT_SERVICES: {
            COLUMN_EDITOR: {
                SELECT_ALL: '',
            },
        },
    },
};

export type TranslationModel = typeof translationModel;

export const TRANSLATIONS = getTranslationMapper(translationModel);

export const i18n: Translations<TranslationModel> = {
    en: {
        CONTEZZA: {
            CONTENT_SERVICES: {
                COLUMN_EDITOR: {
                    SELECT_ALL: 'Select all',
                },
            },
        },
    },
    nl: {
        CONTEZZA: {
            CONTENT_SERVICES: {
                COLUMN_EDITOR: {
                    SELECT_ALL: 'Alles selecteren',
                },
            },
        },
    },
};
