import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-modal-restore-log',
  templateUrl: './modal-restore-log.component.html',
  styleUrls: ['./modal-restore-log.component.scss']
})
export class ModalRestoreLogComponent implements OnInit {
  @Input() restoreModalRef: BsModalRef
  @Input() logID: number;
  
  @Output() onSuccessfulRestore = new EventEmitter<void>();
  @Output() onCancelRestore = new EventEmitter<void>();

  errorResult: String;
  errorStatusAlert = false;

  constructor(private projectService: ProjectService) { }

  ngOnInit(): void {}

  onRestore(): void {
    this.projectService.repostProjectLog(this.logID).subscribe({
      next: (result) => {
        console.log('Restored log', this.logID);
        this.onSuccessfulRestore.emit();
        this.restoreModalRef.hide();
      },
      error: (error) => {
        this.errorStatusAlert = true;
        this.errorResult = "Error: unable to restore log, please contact developers for assistance";
        console.log(error);
      },
    });
  }

  closeModal() {
    this.onCancelRestore.emit();
    this.restoreModalRef.hide();
  }
}
