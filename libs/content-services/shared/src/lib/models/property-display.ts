import { FormatterSource } from '@contezza/core/extensions';
import { Stylable } from '@contezza/core/utils';

import { LegacyFormatterSource } from './legacy-formatter-source';

interface _PropertyDisplay extends Stylable {
    icon?: string;
    title?: string;
    actions?: {
        click?: string;
    };
    template?: string;
    rules?: {
        visible?: string;
    };
}

export type PropertyDisplay = _PropertyDisplay & (FormatterSource | LegacyFormatterSource);
