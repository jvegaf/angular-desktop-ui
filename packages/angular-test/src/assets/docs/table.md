<h1>Table</h1>

```typescript
import {DuiTableModule} from '@marcj/angular-desktop-ui';
```

```typescript
//@angular
return {
    items: [
        {title: 'first', i: 1, created: new Date}, 
        {title: 'second', i: 2, created: new Date},
        {title: 'another', i: 3, created: new Date},
        {title: 'yeah', i: 4, created: new Date},
        {title: 'peter', i: 5, created: new Date},
    ],
    selectedItems: [],
    itemName: '',
    removeItem: function() {
        for (var item of this.selectedItems) {
            this.items.splice(this.items.indexOf(item), 1);
        }
        this.selectedItems = [];
    },
    addItem: function() {
        if (this.itemName) {
            this.items.push({title: this.itemName, i: this.items.length + 1, created: new Date});
            this.items = this.items.slice(0);
            this.itemName = '';
        }
    }
}
```

<dui-code-frame height="250">
```html
    <dui-window>
        <dui-window-header>
            Angular Desktop UI
        </dui-window-header>
        <dui-window-content>
            <dui-table [items]="items" [selectable]="true" [(selected)]="selectedItems">
                <dui-table-column name="title" header="Title" [width]="150"></dui-table-column>
                <dui-table-column name="i" [width]="30"></dui-table-column>
                <dui-table=-column name="created" header="Created" width="100%">
                    <ng-container *duiTableCell="let row">
                        {{row.created|date:'mediumTime'}}
                    </ng-container>
                </dui-table-column>
            </dui-table>
            <dui-button-group padding="none" style="margin-top: 10px;">
                <dui-input [(ngModel)]="itemName" required></dui-input>
                <dui-button [disabled]="!selectedItems.length" (click)="removeItem()" square icon="remove"></dui-button>
                <dui-button (click)="addItem()" [disabled]="!itemName" square icon="add"></dui-button>
            </dui-button-group>
        </dui-window-content>
    </dui-window>
```

```typescript
export class MyWindow {
    items = [
        {title: 'first', i: 1, created: new Date}, 
        {title: 'second', i: 2, created: new Date},
        {title: 'another', i: 3, created: new Date},
        {title: 'yeah', i: 4, created: new Date},
        {title: 'peter', i: 5, created: new Date},
    ];
    
    selectedItems = [];
    
    itemName = '';
    
    removeItem() {
        for (const item of this.selectedItems) {
            this.items.splice(this.items.indexOf(item), 1);
        }
        this.selectedItems = [];
    }
    
    addItem() {
        if (this.itemName) {
            this.items.push({title: this.itemName, i: this.items.length + 1, created: new Date});
            this.items = this.items.slice(0);
            this.itemName = '';
        }
    }
}
```
</dui-code-frame>

<api-doc module="components/table/table.component" component="TableComponent"></api-doc>

<api-doc module="components/table/table.component" component="TableHeaderDirective"></api-doc>

<api-doc module="components/table/table.component" component="TableColumnDirective"></api-doc>

<api-doc module="components/table/table.component" component="TableCellDirective"></api-doc>