import { getTranslationMapper, Translations } from '@contezza/core/translate';

export const translationModel = {
    CONTEZZA: {
        NAVBAR: {
            ITEM_WITH_CHILDREN: {
                EMPTY: '',
            },
        },
    },
};

export type TranslationModel = typeof translationModel;

export const TRANSLATIONS = getTranslationMapper(translationModel);

export const i18n: Translations<TranslationModel> = {
    en: {
        CONTEZZA: {
            NAVBAR: {
                ITEM_WITH_CHILDREN: {
                    EMPTY: 'No items found.',
                },
            },
        },
    },
    nl: {
        CONTEZZA: {
            NAVBAR: {
                ITEM_WITH_CHILDREN: {
                    EMPTY: 'Geen items beschikbaar.',
                },
            },
        },
    },
};
