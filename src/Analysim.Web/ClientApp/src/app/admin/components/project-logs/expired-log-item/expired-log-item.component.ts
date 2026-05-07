import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ExpiredProjectLog } from 'src/app/interfaces/expired-project-log';

@Component({
  selector: 'app-expired-log-item',
  templateUrl: './expired-log-item.component.html',
  styleUrls: ['./expired-log-item.component.scss']
})
export class ExpiredLogItemComponent implements OnInit {
  @Input() log!: ExpiredProjectLog;
  @Output() deleteLog = new EventEmitter<number>();

  constructor() { }

  ngOnInit(): void {
  }

  onDelete(): void {
    this.deleteLog.emit(this.log.logID);
  }

}
