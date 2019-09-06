import {NgModule} from '@angular/core';
import {TableCellDirective, TableColumnDirective, TableComponent, TableHeaderDirective} from "./table.component";
import {CommonModule} from "@angular/common";
import {DuiIconModule} from "../icon";
import {DuiSplitterModule} from "../splitter";
import {ScrollingModule} from "@angular/cdk/scrolling";
import {DuiButtonModule} from "../button";

export {TableCellDirective, TableColumnDirective, TableComponent, TableHeaderDirective} from "./table.component";

@NgModule({
    imports: [
        CommonModule,
        DuiIconModule,
        DuiSplitterModule,
        ScrollingModule,
        DuiButtonModule,
    ],
    exports: [
        TableCellDirective,
        TableColumnDirective,
        TableHeaderDirective,
        TableComponent,
    ],
    declarations: [
        TableCellDirective,
        TableColumnDirective,
        TableHeaderDirective,
        TableComponent,
    ],
    providers: [
    ],
})
export class DuiTableModule {
}
