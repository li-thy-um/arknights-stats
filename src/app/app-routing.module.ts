import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ReportComponent } from './main/report/report.component';
import { IntroComponent } from './main/intro/intro.component';
import { StageResultComponent } from './main/result/stage.result.component';
import { ItemResultComponent } from './main/result/item.result.component';
import { LogComponent } from './main/log/log.component';

const routes: Routes = [
    {
        path: '', component: IntroComponent
    },
    {
        path: 'intro', component: IntroComponent
    },
    {
        path: 'report', component: ReportComponent
    },
    {
        path: 'report/:mode', component: ReportComponent
    },
    {
        path: 'result', component: null,
        children: [
            { path: '', pathMatch: 'full', redirectTo: 'stage' },
            { path: 'stage', component: StageResultComponent },
            { path: 'stage/:stageId', component: StageResultComponent },
            { path: 'item', component: ItemResultComponent },
            { path: 'item/:itemId', component: ItemResultComponent }
        ]
    },
    {
        path: 'log', component: LogComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }
