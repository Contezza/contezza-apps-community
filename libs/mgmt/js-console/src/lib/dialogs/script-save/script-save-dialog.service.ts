import { Injectable } from '@angular/core';
import { ComponentType } from '@angular/cdk/portal';

import { ContezzaAsyncDialogService } from '@contezza/core/services';

import { JsConsoleScriptSaveDialogComponent } from './script-save-dialog.component';
import { ConsoleScript } from '../../interfaces/js-console';

import { JsConsoleScriptSaveDialogModule } from './script-save-dialog.module';

export function getApplicationsModule() {
    return JsConsoleScriptSaveDialogModule;
}

@Injectable({
    providedIn: 'root',
})
export class JsConsoleScriptSaveDialogService extends ContezzaAsyncDialogService<JsConsoleScriptSaveDialogComponent, any, any> {
    private readonly COPY = 'Kopie';

    protected async getDialogComponent(): Promise<ComponentType<JsConsoleScriptSaveDialogComponent>> {
        return getApplicationsModule().getComponent();
    }

    getDuplicateTitle(title: string, scripts: Array<ConsoleScript>): string {
        const matched = [];

        title.match(/[(\[][^)\]]*?[)\]]/g)?.forEach((match) => {
            if (match.includes(this.COPY)) {
                matched.push(match);
            }
        });

        if (matched.length) {
            const copyFullName = this.betweenParenthesis(matched[matched.length - 1]);
            const originalName = title.split(`(${copyFullName})`)[0];

            return title.replace(copyFullName, this.COPY.concat(this.getNextCopyVersion(this.getCopyVersions(originalName, scripts))));
        }

        const copyVersions = this.getCopyVersions(title, scripts);
        return copyVersions.length > 0 ? `${title}(${this.COPY}${this.getNextCopyVersion(copyVersions)})` : `${title}(${this.COPY}1)`;
    }

    private betweenParenthesis(word: string): string {
        return word.substring(word.indexOf('(') + 1, word.indexOf(')'));
    }

    private getCopyVersions(title: string, scripts: Array<ConsoleScript>): Array<number> {
        return scripts.filter((script) => script.text.includes(`${title}(${this.COPY}`)).map((copy) => parseInt(this.betweenParenthesis(copy.text).split(this.COPY).pop(), 10));
    }

    private getNextCopyVersion(versions: Array<number>): string {
        return (Math.max(...versions) + 1).toString();
    }
}
