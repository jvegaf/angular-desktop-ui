import {
    Directive,
    EmbeddedViewRef,
    InjectionToken,
    Input,
    OnDestroy,
    TemplateRef,
    ViewContainerRef
} from "@angular/core";
import {detectChangesNextFrame} from "./utils";

let i = 0;

let currentViewDirective: ViewDirective | undefined;

export class ViewState {
    public id = i++;

    public viewDirective: ViewDirective = currentViewDirective!;

    get attached() {
        return this.viewDirective.isVisible();
    }
}

export interface Viewable {
    readonly viewState: ViewState;
}

export const ViewStateToken = new InjectionToken('asd');

@Directive({
    selector: '[duiView]',
    providers: [{provide: ViewStateToken, useClass: ViewState}]
})
export class ViewDirective implements OnDestroy {
    protected view?: EmbeddedViewRef<any>;

    protected visible = false;

    public readonly parentViewDirective: ViewDirective | undefined;

    constructor(
        protected template: TemplateRef<any>,
        protected viewContainer: ViewContainerRef,
    ) {
        this.parentViewDirective = currentViewDirective;
    }

    public isVisible() {
        // if (this.parentViewDirective) return this.parentViewDirective.isVisible();

        if (this.view) {
            for (const node of this.view.rootNodes) {
                if (node.style && node.offsetParent !== null) {
                    return true;
                }
            }

            return false;
            // return !this.view.rootNodes.some((v) => v.offsetParent === null);
        }

        return this.visible;
    }

    @Input()
    set duiView(v: boolean) {
        if (this.visible === v) return;

        this.visible = v;

        if (this.visible) {
            if (this.view) {
                this.view.rootNodes.map(element => {
                    if (element.style) {
                        element.style.display = '';
                    }
                });
                // console.log('rettach', this.viewStates);
                this.view!.reattach();
                this.view.markForCheck();
                window.dispatchEvent(new Event('resize'));
                return;
            }

            const old = currentViewDirective;
            currentViewDirective = this;
            this.view = this.viewContainer.createEmbeddedView(this.template);
            currentViewDirective = old;
        } else {
            if (this.view) {
                this.view!.rootNodes.map(element => {
                    if (element.style) {
                        element.style.display = 'none';
                    }
                });
                this.view!.detach();
                this.view.markForCheck();
                detectChangesNextFrame(this.view);
            }
        }
    }

    ngOnDestroy() {
        if (this.view) {
            this.view.destroy();
        }
    }
}
