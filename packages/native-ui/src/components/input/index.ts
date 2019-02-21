import {NgModule} from "@angular/core";
import {InputComponent} from "./input.component";
import {FormsModule} from "@angular/forms";
import {CommonModule} from "@angular/common";

@NgModule({
    declarations: [
        InputComponent
    ],
    exports: [
        InputComponent,
    ],
    imports: [
        FormsModule,
        CommonModule,
    ]
})
export class DuiInputModule {

}
