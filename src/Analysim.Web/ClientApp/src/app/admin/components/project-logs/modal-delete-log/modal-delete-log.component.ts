import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-modal-delete-log',
  templateUrl: './modal-delete-log.component.html',
  styleUrls: ['./modal-delete-log.component.scss'],
})
export class ModalDeleteLogComponent implements OnInit {
  @Input() deleteModalRef: BsModalRef;
  @Input() logID: number;

  @Output() onSuccessfulDelete = new EventEmitter<void>();
  @Output() onCancelDelete = new EventEmitter<void>();

  errorResult: String;
  errorStatusAlert = false;

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {}

  onDelete(): void {
    this.projectService.deleteExpiredProjectLog(this.logID).subscribe({
      next: (result) => {
        console.log('Deleted log:', this.logID);
        this.onSuccessfulDelete.emit();
        this.deleteModalRef.hide();
      },
      error: (error) => {
        this.errorStatusAlert = true;
        this.errorResult =
          'Error: unable to delete log, please contact developers for assistance';
        console.log(error);
      },
    });
  }

  closeModal() {
    this.onCancelDelete.emit();
    this.deleteModalRef.hide();
  }
}
