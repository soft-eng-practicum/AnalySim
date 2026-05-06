import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { User } from 'src/app/interfaces/user';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-modal-delete-log',
  templateUrl: './modal-delete-log.component.html',
  styleUrls: ['./modal-delete-log.component.scss']
})
export class ModalDeleteLogComponent implements OnInit {
  @Input() deleteModalRef: BsModalRef
  @Input() projectLogID: number;
  @Input() currentUser: User;
  
  @Output() onSuccessfulDelete = new EventEmitter<void>();
  @Output() onCancelDelete = new EventEmitter<void>();

  errorResult: String;
  errorStatusAlert = false;

  constructor(private projectService: ProjectService) { }

  ngOnInit(): void {}

  onDeleteLog(): void {
    this.onSuccessfulDelete.emit();
    this.deleteModalRef.hide();

    this.projectService.deleteProjectLog(this.projectLogID).subscribe({
      next: (result) => {
        console.log('Deleted log', this.projectLogID);
        this.onSuccessfulDelete.emit();
        this.deleteModalRef.hide();
      },
      error: (error) => {
        this.errorStatusAlert = true;
        this.errorResult = "Error: unable to delete log, please contact developers for assistance";
        console.log(error);
      },
    });
  }

  closeModal() {
    this.onCancelDelete.emit();
    this.deleteModalRef.hide();
  }
}
