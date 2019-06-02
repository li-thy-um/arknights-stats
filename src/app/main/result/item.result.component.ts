import { Component, OnInit, ViewChild } from '@angular/core';
import { PenguinService } from 'src/app/service/penguin.service';
import { SelectedService } from 'src/app/service/selected.service';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { MatSort } from '@angular/material';

@Component({
    selector: 'app-result',
    templateUrl: './item.result.component.html',
    styleUrls: ['./result.component.scss']
})
export class ItemResultComponent implements OnInit {

    destroy$: Subject<boolean> = new Subject<boolean>();

    stageList: any = [];
    rows: any;
    chapterList: Chapter[];
    itemList: any = [];
    itemResult: any = null;
    isLoading: boolean = true;
    displayedColumns: string[] = ['code', 'apCost', 'times', 'quantity', 'rate', 'expectation'];
    dataSource: any;
    showTable: boolean = false;
    private _lastSortEvent: any = null;

    @ViewChild(MatSort) sort: MatSort;

    constructor(public penguinService: PenguinService, public selectedService: SelectedService, private router: Router) { }

    ngOnInit() {
        this.penguinService.itemListData.pipe(takeUntil(this.destroy$)).subscribe(res => {
            if (res) {
                this.itemList = res;
            }
        });
        this.penguinService.chapterListData.pipe(takeUntil(this.destroy$)).subscribe(res => {
            if (res) {
                this.chapterList = res;
            }
        });
        this.penguinService.itemResultData.pipe(takeUntil(this.destroy$)).subscribe(res => {
            if (res && (this.penguinService.isTest || res.item.id === this.selectedService.selections.result_by_item.selectedItem.id)) {
                this.itemResult = res;
                this._generateRows();
                this.dataSource = [...this.rows];
                this.dataSource.sort = this.sort;
                if (this._lastSortEvent) {
                    this.sortItemData(this._lastSortEvent);
                }
                this.isLoading = false;
            }
        });
        this.isLoading = true;
        this.showTable = false;
        if (!this.selectedService.selections.result_by_item.selectedItem) {
            this.isLoading = false;
        } else {
            this._refreshItemResult();
        }
    }

    ngOnDestroy(): void {
        this.destroy$.next(true);
        this.destroy$.unsubscribe();
    }

    selectItem(item) {
        if (this.selectedService.selections.result_by_item.selectedItem === item) {
            return;
        }
        this.selectedService.selections.result_by_item.selectedItem = item;
        this._refreshItemResult();
    }

    private _refreshItemResult() {
        this.isLoading = true;
        this.showTable = true;
        this.rows = new Array();
        this.dataSource = [...this.rows];
        this.itemResult = new Array();
        this.penguinService.getItemResult(this.selectedService.selections.result_by_item.selectedItem.id).subscribe();
    }

    redirectToStageResult(stage) {
        for (let i = 0; i < this.chapterList.length; i++) {
            if (stage.chapter === this.chapterList[i].id) {
                this.selectedService.selections.result_by_stage.selectedChapter = this.chapterList[i];
            }
        }
        this.selectedService.selections.result_by_stage.selectedStage = stage;
        this.selectedService.selections.result_by_stage.stageType = stage.stageType;
        this.router.navigateByUrl('/result/stage');
    }

    private _generateRows() {
        this.rows = new Array();
        this.itemResult.drops.forEach(drop => {
            const rate = drop.quantity / drop.times * 100;
            const expectation = drop.times / drop.quantity * drop.stage.apCost;
            this.rows.push({
                code: drop.stage.code,
                times: drop.times,
                quantity: drop.quantity,
                rate: +rate.toFixed(2),
                expectation: +expectation.toFixed(2),
                stage: drop.stage,
                apCost: drop.stage.apCost
            });
        });
    }

    stageComparator = (a: any, b: any) => {
        const t = a.code.localeCompare(b.code);
        if (t !== 0) {
            return t;
        }
        return a.stage.stageType === 'normal' ? -1 : 1;
    };

    sortItemData($event) {
        this._lastSortEvent = $event;
        switch ($event.active) {
            case 'code': {
                this.rows.sort((a, b) => {
                    const parsedA = this.penguinService.parseStageCode(a.code);
                    const parsedB = this.penguinService.parseStageCode(b.code);
                    let result = -1;

                    if (a.category === b.category) {
                        if (parsedA.first === parsedB.first) {
                            if (isNaN(Number(parsedA.second)) || isNaN(Number(parsedB.second))) {
                                result = parsedA.second.localeCompare(parsedB.second);
                            } else {
                                result = Number(parsedA.second) - Number(parsedB.second);
                            }
                        } else {
                            if (isNaN(Number(parsedA.first)) || isNaN(Number(parsedB.first))) {
                                result = parsedA.first.localeCompare(parsedB.first);
                            } else {
                                result = Number(parsedA.first) - Number(parsedB.first);
                            }
                        }
                    } else {
                        result = a.category === 'sub' ? 1 : -1;
                    }
                    return $event.direction === 'asc' ? result : -result;
                });
                break;
            }
            default: {
                this.rows.sort((a, b) => {
                    return $event.direction === 'asc' ? a[$event.active] - b[$event.active] : b[$event.active] - a[$event.active];
                });
                break;
            }
        }
        this.dataSource = [...this.rows];
    }

    selectDataSource(isPersonal: boolean) {
        if (this.penguinService.isPersonal === isPersonal) {
            return;
        }
        if (!window.localStorage) {
            alert("您的浏览器暂不支持本地数据，请升级或者换浏览器再试。");
            return;
        }
        let localStageTimesStr = localStorage.getItem("stageTimes");
        let localDropMatrixStr = localStorage.getItem("dropMatrix");
        if (isPersonal && (!localStageTimesStr || !localDropMatrixStr)) {
            alert("您当前还未上传过掉落数据。");
            return;
        }
        this.penguinService.isPersonal = isPersonal;
        if (this.selectedService.selections.result_by_item.selectedItem) {
            this._refreshItemResult();
        }
    }

}

interface Chapter {
    name: string;
    stages: any;
    id: number;
    type: string;
}

interface Stage {
    id: number;
    code: string;
    category: string;
    apCost: number;
    normalDrop: any;
    specialDrop: any;
    extraDrop: any;
}