import {BrowserModule} from '@angular/platform-browser';
import {NgModule} from '@angular/core';
import {
    DuiButtonModule,
    DuiCheckboxModule,
    DuiFormComponent,
    DuiInputModule,
    DuiRadioboxModule,
    DuiSelectModule,
    DuiWindowModule,
    DuiIconModule,
    DuiListModule,
    DuiTableModule,
} from '@marcj/angular-desktop-ui';

import {AppRoutingModule} from './app-routing.module';
import {AppComponent} from './app.component';
import {StaticDocComponent} from "./components/static-doc.component";
import {HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";

@NgModule({
    declarations: [
        AppComponent,
        StaticDocComponent,
    ],
    imports: [
        HttpClientModule,
        FormsModule,
        BrowserModule,
        AppRoutingModule,
        DuiCheckboxModule,
        DuiButtonModule,
        DuiInputModule,
        DuiFormComponent,
        DuiRadioboxModule,
        DuiSelectModule,
        DuiWindowModule,
        DuiIconModule,
        DuiListModule,
        DuiTableModule,
        DuiButtonModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule {
}
