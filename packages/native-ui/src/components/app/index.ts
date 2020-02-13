import {
    ApplicationRef,
    Component,
    HostBinding, Inject,
    Injectable,
    Input,
    ModuleWithProviders,
    NgModule,
    Optional
} from "@angular/core";
import {DuiWindowModule} from "../window";
import {
    MenuCheckboxDirective,
    MenuDirective,
    MenuItemDirective,
    MenuRadioDirective,
    MenuSeparatorDirective
} from "./menu.component";
import {detectChangesNextFrame, OpenExternalDirective, ZonelessChangeDetector} from "./utils";
import {ViewDirective} from "./dui-view.directive";
import {CdCounterComponent} from "./cd-counter.component";
import {DuiResponsiveDirective} from "./dui-responsive.directive";
import {CommonModule, DOCUMENT} from "@angular/common";
import {Electron} from "../../core/utils";
import {ActivationEnd, Event as RouterEvent, NavigationEnd, Router} from "@angular/router";
import {WindowRegistry} from "../window/window-state";
import {ELECTRON_WINDOW, IN_DIALOG} from "./token";
import {AsyncRenderPipe} from "./pipes";

export * from "./dui-view.directive";
export * from "./utils";

export class BaseComponent {
    @Input() disabled?: boolean;

    @HostBinding('class.disabled')
    get isDisabled() {
        return this.disabled === true;
    }
}

@Component({
    selector: 'ui-component',
    template: `
        {{name}} disabled={{isDisabled}}
    `,
    styles: [`
        :host {
            display: inline-block;
        }

        :host.disabled {
            border: 1px solid red;
        }
    `],
    host: {
        '[class.is-textarea]': 'name === "textarea"',
    }
})
export class UiComponentComponent extends BaseComponent {
    @Input() name: string = '';
}

@Injectable()
export class DuiApp {
    protected darkMode?: boolean = false;
    protected platform: 'web' | 'darwin' | 'linux' | 'win32' = 'darwin';

    constructor(
        protected app: ApplicationRef,
        protected windowRegistry: WindowRegistry,
        @Optional() protected router?: Router
    ) {
        ZonelessChangeDetector.app = app;
        if ('undefined' !== typeof window) {
            (window as any)['DuiApp'] = this;
        }
    }

    start() {
        if (Electron.isAvailable()) {
            document.body.classList.add('electron');

            const remote = Electron.getRemote();

            let overwrittenDarkMode = localStorage.getItem('duiApp/darkMode');
            if (overwrittenDarkMode) {
                this.setDarkMode(JSON.parse(overwrittenDarkMode));
            } else {
                this.setDarkMode();
            }

            this.setPlatform(remote.process.platform);
        } else {
            this.setPlatform('web');
            this.setDarkMode();
        }

        window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', () => {
            if (localStorage.getItem('duiApp/darkMode') === null) {
                this.setAutoDarkMode();
                this.app.tick();
            }
        });

        if ('undefined' !== typeof document) {
            document.addEventListener('click', () => detectChangesNextFrame());
            document.addEventListener('focus', () => detectChangesNextFrame());
            document.addEventListener('blur', () => detectChangesNextFrame());
            document.addEventListener('keydown', () => detectChangesNextFrame());
            document.addEventListener('keyup', () => detectChangesNextFrame());
            document.addEventListener('keypress', () => detectChangesNextFrame());
            document.addEventListener('mousedown', () => detectChangesNextFrame());
        }

        //necessary to render all router-outlet once the router changes
        if (this.router) {
            this.router.events.subscribe((event: RouterEvent) => {
                if (event instanceof NavigationEnd || event instanceof ActivationEnd) {
                    detectChangesNextFrame();
                }
            });
        }
    }

    setPlatform(platform: 'web' | 'darwin' | 'linux' | 'win32') {
        this.platform = platform;
        document.body.classList.remove('platform-linux');
        document.body.classList.remove('platform-darwin');
        document.body.classList.remove('platform-win32');
        document.body.classList.remove('platform-native');
        document.body.classList.remove('platform-web');

        if (this.platform !== 'web') {
            document.body.classList.add('platform-native');
        }
        document.body.classList.add('platform-' + platform);
    }

    getPlatform(): string {
        return this.platform;
    }

    isDarkMode() {
        return this.darkMode;
    }

    setAutoDarkMode() {
        this.setDarkMode();
    }

    get theme(): 'auto' | 'light' | 'dark' {
        if (this.isDarkModeOverwritten()) {
            return this.isDarkMode() ? 'dark' : 'light';
        }

        return 'auto';
    }

    set theme(theme: 'auto' | 'light' | 'dark') {
        if (theme === 'auto') {
            this.setAutoDarkMode();
            return;
        }

        this.setDarkMode(theme === 'dark');
    }

    isDarkModeOverwritten() {
        return localStorage.getItem('duiApp/darkMode') !== null;
    }

    setGlobalDarkMode(darkMode: boolean) {
        if (Electron.isAvailable()) {
            const remote = Electron.getRemote();
            for (const win of remote.BrowserWindow.getAllWindows()) {
                win.webContents.executeJavaScript(`DuiApp.setDarkMode(${darkMode})`);
            }
        }
    }

    getVibrancy(): 'ultra-dark' | 'light' {
        return this.darkMode ? 'ultra-dark' : 'light';
    }

    setDarkMode(darkMode?: boolean) {
        if (darkMode === undefined) {
            this.darkMode = this.isPreferDarkColorSchema();
            localStorage.removeItem('duiApp/darkMode');
        } else {
            localStorage.setItem('duiApp/darkMode', JSON.stringify(darkMode));
            this.darkMode = darkMode;
        }

        for (const win of this.windowRegistry.getAllElectronWindows()) {
            win.setVibrancy(this.getVibrancy());
        }

        document.body.classList.remove('dark');
        document.body.classList.remove('light');
        document.body.classList.add(this.darkMode ? 'dark' : 'light');
        window.dispatchEvent(new Event('theme-changed'));
    }

    protected isPreferDarkColorSchema() {
        return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
}

@NgModule({
    declarations: [
        UiComponentComponent,
        MenuDirective,
        MenuSeparatorDirective,
        MenuRadioDirective,
        MenuCheckboxDirective,
        MenuItemDirective,
        OpenExternalDirective,
        ViewDirective,
        CdCounterComponent,
        DuiResponsiveDirective,
        AsyncRenderPipe,
    ],
    exports: [
        UiComponentComponent,
        MenuDirective,
        MenuSeparatorDirective,
        MenuRadioDirective,
        MenuCheckboxDirective,
        MenuItemDirective,
        OpenExternalDirective,
        ViewDirective,
        CdCounterComponent,
        DuiResponsiveDirective,
        AsyncRenderPipe,
    ],
    imports: [
        CommonModule,
        DuiWindowModule,
    ]
})
export class DuiAppModule {
    constructor(app: DuiApp, @Inject(DOCUMENT) @Optional() document: Document) {
        app.start();
        if (document && Electron.isAvailable()) {
            document.addEventListener('click', (event: MouseEvent) => {
                if (event.target){
                    const target = event.target as HTMLElement;
                    if (target.tagName.toLowerCase() === 'a') {
                        event.preventDefault();
                        event.stopPropagation();
                        Electron.getRemote().shell.openExternal((target as any).href);
                    }
                }
            });
        }
    }

    static forRoot(): ModuleWithProviders {
        return {
            ngModule: DuiAppModule,
            providers: [
                DuiApp,
                {provide: IN_DIALOG, useValue: false},
                {provide: ELECTRON_WINDOW, useValue: Electron.isAvailable() ? Electron.getRemote().BrowserWindow.getAllWindows()[0] : undefined},
            ]
        }
    }
}
