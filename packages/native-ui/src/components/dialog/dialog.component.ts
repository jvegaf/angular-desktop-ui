import {
    AfterViewInit,
    ApplicationRef,
    ChangeDetectorRef,
    Component,
    ComponentFactoryResolver,
    ComponentRef,
    Directive,
    EventEmitter,
    HostListener,
    Injector,
    Input,
    NgZone,
    OnChanges,
    OnDestroy,
    Optional,
    Output,
    SimpleChanges,
    SkipSelf,
    TemplateRef,
    Type,
    ViewChild,
    ViewContainerRef
} from "@angular/core";
import {
    Overlay,
    OverlayContainer,
    OverlayKeyboardDispatcher,
    OverlayPositionBuilder,
    OverlayRef,
    ScrollStrategyOptions
} from "@angular/cdk/overlay";
import {ComponentPortal} from "@angular/cdk/portal";
import {WindowRegistry} from "../window/window-state";
import {WindowComponent} from "../window/window.component";
import {RenderComponentDirective} from "../core/render-component.directive";
import {IN_DIALOG} from "../app/token";
import {Directionality} from "@angular/cdk/bidi";
import {ViewportRuler} from "@angular/cdk/scrolling";
import {Platform} from "@angular/cdk/platform";

@Component({
    template: `
        <dui-window>
            <dui-window-content>
                <ng-container *ngIf="component"
                              #renderComponentDirective
                              [renderComponent]="component" [renderComponentInputs]="componentInputs">
                </ng-container>

                <ng-container *ngIf="content" [ngTemplateOutlet]="content"></ng-container>

                <ng-container *ngIf="container">
                    <ng-container [ngTemplateOutlet]="container"></ng-container>
                </ng-container>

                <ng-container *ngIf="!container">
                    <ng-content></ng-content>
                </ng-container>
            </dui-window-content>

            <div class="dialog-actions" *ngIf="actions">
                <ng-container [ngTemplateOutlet]="actions"></ng-container>
            </div>
        </dui-window>
    `,
    host: {
        '[attr.tabindex]': '1'
    },
    styleUrls: ['./dialog-wrapper.component.scss']
})
export class DialogWrapperComponent {
    @Input() component?: Type<any>;
    @Input() componentInputs: { [name: string]: any } = {};

    actions?: TemplateRef<any> | undefined;
    container?: TemplateRef<any> | undefined;
    content?: TemplateRef<any> | undefined;

    @ViewChild(RenderComponentDirective, {static: false}) renderComponentDirective?: RenderComponentDirective;

    constructor(
        protected cd: ChangeDetectorRef,
    ) {
    }

    public setActions(actions: TemplateRef<any> | undefined) {
        this.actions = actions;
        this.cd.detectChanges();
    }

    public setDialogContainer(container: TemplateRef<any> | undefined) {
        this.container = container;
        this.cd.detectChanges();
    }
}

@Component({
    selector: 'dui-dialog',
    template: `
        <ng-template #template>
            <ng-content></ng-content>
        </ng-template>`,
    styles: [`:host {
        display: none;
    }`]
})
export class DialogComponent implements AfterViewInit, OnDestroy, OnChanges {
    @Input() title: string = '';

    @Input() visible: boolean = false;
    @Output() visibleChange = new EventEmitter<boolean>();

    @Input() minWidth?: number | string;
    @Input() minHeight?: number | string;

    @Input() width?: number | string;
    @Input() height?: number | string;

    @Input() maxWidth?: number | string;
    @Input() maxHeight?: number | string;

    @Input() center: boolean = false;

    @Input() backDropCloses: boolean = false;

    @Input() component?: Type<any>;
    @Input() componentInputs: { [name: string]: any } = {};

    @Output() closed = new EventEmitter<any>();
    @Output() open = new EventEmitter<any>();

    @ViewChild('template', {static: true}) template?: TemplateRef<any>;

    actions?: TemplateRef<any> | undefined;
    container?: TemplateRef<any> | undefined;

    public overlayRef?: OverlayRef;
    public wrapperComponentRef?: ComponentRef<DialogWrapperComponent>;

    constructor(
        protected applicationRef: ApplicationRef,
        protected viewContainerRef: ViewContainerRef,
        protected cd: ChangeDetectorRef,
        protected injector: Injector,
        protected registry: WindowRegistry,
        @SkipSelf() protected cdParent: ChangeDetectorRef,
        @Optional() protected window?: WindowComponent,
    ) {
    }

    public toPromise(): Promise<any> {
        return new Promise((resolve) => {
            this.closed.subscribe((v: any) => {
                resolve(v);
            })
        })
    }

    public setDialogContainer(container: TemplateRef<any> | undefined) {
        this.container = container;
        if (this.wrapperComponentRef) {
            this.wrapperComponentRef.instance.setDialogContainer(container);
        }
    }

    public setActions(actions: TemplateRef<any> | undefined) {
        this.actions = actions;
        if (this.wrapperComponentRef) {
            this.wrapperComponentRef.instance.setActions(actions);
        }
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.visible) {
            this.show();
        } else {
            this.close(undefined);
        }
    }

    public show() {
        if (this.overlayRef) {
            return;
        }

        const window = this.window ? this.window.getClosestNonDialogWindow() : this.registry.getOuterActiveWindow();
        const offsetTop = window && window.header ? window.header.getBottomPosition() - 1 : 0;

        const document = this.registry.getCurrentViewContainerRef().element.nativeElement.ownerDocument;
        const overlayContainer = new OverlayContainer(document);
        const overlay = new Overlay(
            this.injector.get(ScrollStrategyOptions),
            overlayContainer,
            this.injector.get(ComponentFactoryResolver),
            new OverlayPositionBuilder(this.injector.get(ViewportRuler), document, this.injector.get(Platform), overlayContainer),
            this.injector.get(OverlayKeyboardDispatcher),
            this.injector,
            this.injector.get(NgZone),
            document,
            this.injector.get(Directionality),
        );

        let positionStrategy = overlay
            .position()
            .global().centerHorizontally().top(offsetTop + 'px');

        if (this.center) {
            positionStrategy = overlay
                .position()
                .global().centerHorizontally().centerVertically();
        }


        this.overlayRef = overlay.create({
            width: this.width || undefined,
            height: this.height || undefined,
            minWidth: this.minWidth || undefined,
            minHeight: this.minHeight || undefined,
            maxWidth: this.maxWidth || '90%',
            maxHeight: this.maxHeight || '90%',
            hasBackdrop: true,
            panelClass: (this.center ? 'dialog-overlay' : 'dialog-overlay-with-animation'),
            scrollStrategy: overlay.scrollStrategies.reposition(),
            positionStrategy: positionStrategy,
        });

        if (this.backDropCloses) {
            this.overlayRef!.backdropClick().subscribe(() => {
                this.close(undefined);
            });
        }
        const injector = Injector.create({
            parent: this.injector,
            providers: [
                {provide: DialogComponent, useValue: this},
                {provide: WindowComponent, useValue: window},
                {provide: IN_DIALOG, useValue: true},
            ],
        });

        this.open.emit();
        const portal = new ComponentPortal(DialogWrapperComponent, this.viewContainerRef, injector);

        this.wrapperComponentRef = this.overlayRef!.attach(portal);
        this.wrapperComponentRef.instance.component = this.component!;
        this.wrapperComponentRef.instance.componentInputs = this.componentInputs;
        this.wrapperComponentRef.instance.content = this.template!;

        if (this.actions) {
            this.wrapperComponentRef!.instance.setActions(this.actions);
        }

        if (this.container) {
            this.wrapperComponentRef!.instance.setDialogContainer(this.container);
        }

        this.overlayRef!.updatePosition();

        this.visible = true;
        this.visibleChange.emit(true);

        this.wrapperComponentRef!.location.nativeElement.focus();
        this.wrapperComponentRef!.changeDetectorRef.detectChanges();

        this.cd.detectChanges();
        this.cdParent.detectChanges();
    }

    protected beforeUnload() {
        if (this.overlayRef) {
            this.overlayRef.dispose();
            delete this.overlayRef;
        }
    }

    ngAfterViewInit() {
    }

    public close(v?: any) {
        this.visible = false;
        this.visibleChange.emit(false);
        this.beforeUnload();

        this.closed.emit(v);
        requestAnimationFrame(() => {
            this.applicationRef.tick();
        });
    }

    ngOnDestroy(): void {
        this.beforeUnload();
    }
}

/**
 * This directive is necessary if you want to load and render the dialog content
 * only when opening the dialog. Without it it is immediately render, which can cause
 * performance and injection issues.
 */
@Directive({
    'selector': '[dialogContainer]',
})
export class DialogDirective {
    constructor(protected dialog: DialogComponent, public template: TemplateRef<any>) {
        this.dialog.setDialogContainer(this.template);
    }
}

@Component({
    selector: 'dui-dialog-actions',
    template: '<ng-template #template><ng-content></ng-content></ng-template>'
})
export class DialogActionsComponent implements AfterViewInit, OnDestroy {
    @ViewChild('template', {static: true}) template!: TemplateRef<any>;

    constructor(protected dialog: DialogComponent) {
    }

    ngAfterViewInit(): void {
        this.dialog.setActions(this.template);
    }

    ngOnDestroy(): void {
        if (this.dialog.actions === this.template) {
            this.dialog.setActions(undefined);
        }
    }
}

@Component({
    selector: 'dui-dialog-error',
    template: '<ng-content></ng-content>',
    styleUrls: ['./dialog-error.component.scss']
})
export class DialogErrorComponent {
}


@Directive({
    selector: '[closeDialog]'
})
export class CloseDialogDirective {
    @Input() closeDialog: any;

    constructor(protected dialog: DialogComponent) {
    }

    @HostListener('click')
    onClick() {
        this.dialog.close(this.closeDialog);
    }
}
