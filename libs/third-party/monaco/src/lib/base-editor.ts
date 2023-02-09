import { AfterViewInit, Component, ElementRef, EventEmitter, Inject, Input, OnDestroy, Output, ViewChild } from '@angular/core';
import { Subscription } from 'rxjs';
import { NGX_MONACO_EDITOR_CONFIG, NgxMonacoEditorConfig } from './config';

let loadedMonaco = false;
let loadPromise: Promise<void>;

@Component({
    template: '',
})
// eslint-disable-next-line @angular-eslint/component-class-suffix
export abstract class BaseEditor implements AfterViewInit, OnDestroy {
    // eslint-disable-next-line @angular-eslint/no-input-rename
    @Input('insideNg')
    set insideNg(insideNg: boolean) {
        this._insideNg = insideNg;
        if (this._editor) {
            this._editor.dispose();
            this.initMonaco(this._options, this.insideNg);
        }
    }

    get insideNg(): boolean {
        return this._insideNg;
    }

    @ViewChild('editorContainer', { static: true }) _editorContainer: ElementRef;

    @Output()
    // eslint-disable-next-line @angular-eslint/no-output-on-prefix
    onInit = new EventEmitter<any>();

    protected _editor: any;
    protected _options: any;
    protected _windowResizeSubscription: Subscription;
    // eslint-disable-next-line @typescript-eslint/no-inferrable-types
    private _insideNg: boolean = false;

    protected constructor(@Inject(NGX_MONACO_EDITOR_CONFIG) protected config: NgxMonacoEditorConfig) {}

    ngAfterViewInit(): void {
        if (loadedMonaco) {
            // Wait until monaco editor is available
            loadPromise.then(() => {
                this.initMonaco(this._options, this.insideNg);
            });
        } else {
            loadedMonaco = true;
            loadPromise = new Promise<void>((resolve: any) => {
                const baseUrl = this.config.baseUrl || './assets';
                if (typeof (window as any).monaco === 'object') {
                    resolve();
                    return;
                }
                const onGotAmdLoader: any = () => {
                    // Load monaco
                    // noinspection TypeScriptValidateJSTypes
                    (window as any).require.config({ paths: { vs: `${baseUrl}/monaco/min/vs` } });
                    (window as any).require([`vs/editor/editor.main`], () => {
                        if (typeof this.config.onMonacoLoad === 'function') {
                            this.config.onMonacoLoad();
                        }
                        this.initMonaco(this._options, this.insideNg);
                        resolve();
                    });
                };

                // Load AMD loader if necessary
                if (!(window as any).require) {
                    const loaderScript: HTMLScriptElement = document.createElement('script');
                    loaderScript.type = 'text/javascript';
                    loaderScript.src = `${baseUrl}/monaco/min/vs/loader.js`;
                    loaderScript.addEventListener('load', onGotAmdLoader);
                    document.body.appendChild(loaderScript);
                } else {
                    onGotAmdLoader();
                }
            });
        }
    }

    protected abstract initMonaco(options: any, insideNg: boolean): void;

    ngOnDestroy() {
        if (this._windowResizeSubscription) {
            this._windowResizeSubscription.unsubscribe();
        }
        if (this._editor) {
            this._editor.dispose();
            this._editor = undefined;
        }
    }
}
