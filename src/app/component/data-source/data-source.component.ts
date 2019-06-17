import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { PenguinService } from 'src/app/service/penguin.service';
import { MatSnackBar } from '@angular/material';

@Component({
  selector: 'app-data-source',
  templateUrl: './data-source.component.html',
  styleUrls: ['./data-source.component.scss']
})

export class DataSourceComponent implements OnInit {

  @Output() refreshResult = new EventEmitter<boolean>();

  constructor(
    public penguinService: PenguinService,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit() {
  }

  selectDataSource(isPersonal: boolean) {
    if (this.penguinService.isPersonal === isPersonal) {
      return;
    }
    if (!window.localStorage) {
      this._snackBar.open(
        "您的浏览器暂不支持本地数据，请升级或者换浏览器再试。", "x", { duration: 2000 }
      );
      return;
    }
    let localStageTimesStr = localStorage.getItem("stageTimes");
    let localDropMatrixStr = localStorage.getItem("dropMatrix");
    if (isPersonal && (!localStageTimesStr || !localDropMatrixStr)) {
      this._snackBar.open("您当前还未上传过掉落数据。", "x", { duration: 2000 });
      return;
    }
    this.penguinService.isPersonal = isPersonal;
    this.refreshResult.emit();
  }
}