import {Observable} from "rxjs";
import {ChangeDetectorRef} from "@angular/core";

const electron = (window as any).electron || ((window as any).require ? (window as any).require('electron') : undefined);

export class Electron {
    public static getRemote(): any {
        if (!electron) {
            throw new Error('No Electron available.');
        }

        return electron.remote;
    }

    public static getIpc(): any {
        if (!electron) {
            throw new Error('No Electron available.');
        }

        return electron.ipcRenderer;
    }

    public static isAvailable(): any {
        return !!electron;
    }

    public static getRemoteOrUndefined(): any {
        return electron ? electron.remote : undefined;
    }

    public static getProcess() {
        return Electron.getRemote().process;
    }
}

export class ExecutionState {
    public running = false;
    public error: string = '';

    constructor(
        protected readonly cd: ChangeDetectorRef,
        protected readonly func: (...args: any[]) => Promise<any> | any,
    ) {
    }

    public async execute() {
        if (this.running) {
            throw new Error('Executor still running');
        }

        this.running = true;
        this.error = '';
        this.cd.detectChanges();

        try {
            return await this.func(...arguments);
        } catch (error) {
            this.error = error.message || error.toString();
            throw error;
        } finally {
            this.running = false;
            this.cd.detectChanges();
        }

    }
}

/**
 * Checks if `target` is children of `parent` or if `target` is `parent`.
 */
export function isTargetChildOf(target: HTMLElement | EventTarget | null, parent: HTMLElement): boolean {
    if (!target) return false;

    if (target === parent) return true;

    if (target instanceof HTMLElement) {
        let targetElement: HTMLElement = target;
        while (targetElement.parentElement) {
            if (targetElement.parentElement === parent) {
                return true;
            }
            targetElement = targetElement.parentElement;
        }
    }

    return false;
}

export function triggerResize() {
    requestAnimationFrame(() => {
        window.dispatchEvent(new Event('resize'));
    });
}

export function focusWatcher(target: HTMLElement, allowedFocuses: HTMLElement[] = []): Observable<void> {
    return new Observable<void>((observer) => {
        let currentlyFocused: HTMLElement | null = target;

        function isFocusAllowed() {
            if (!currentlyFocused) {
                return false;
            }

            if (isTargetChildOf(currentlyFocused, target)) {
                return true;
            }

            for (const focus of allowedFocuses) {
                if (isTargetChildOf(currentlyFocused, focus)) {
                    return true;
                }
            }

            return false;
        }

        function check() {
            if (!isFocusAllowed()) {
                observer.next();
                observer.complete();
            }
        }

        function onFocusOut() {
            currentlyFocused = null;
            requestAnimationFrame(check);
        }

        function onFocusIn(event: FocusEvent) {
            currentlyFocused = event.target as any;
            requestAnimationFrame(check);
        }

        target.ownerDocument!.addEventListener('focusin', onFocusIn as any);
        target.ownerDocument!.addEventListener('focusout', onFocusOut as any);

        function unsubscribe(): void {
            target.ownerDocument!.removeEventListener('focusin', onFocusIn as any);
            target.ownerDocument!.removeEventListener('focusout', onFocusOut as any);
        }

        return {unsubscribe: unsubscribe};
    });
}
