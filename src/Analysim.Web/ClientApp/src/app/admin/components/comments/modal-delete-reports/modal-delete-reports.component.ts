import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-modal-delete-reports',
  templateUrl: './modal-delete-reports.component.html',
  styleUrls: ['./modal-delete-reports.component.scss']
})
export class ModalDeleteReportsComponent implements OnInit {
  @Input() deleteModalRef: BsModalRef
  @Input() commentID: number;
  
  @Output() onSuccessfulDelete = new EventEmitter<void>();
  @Output() onCancelDelete = new EventEmitter<void>();

  errorResult: String;
  errorStatusAlert = false;

  constructor(private projectService: ProjectService) { }

  ngOnInit(): void {}

  onDelete(): void {
    this.projectService.deleteCommentAndReports(this.commentID).subscribe({
      next: (result) => {
        console.log('Deleted comment / removed reports for: ', this.commentID);
        this.onSuccessfulDelete.emit();
        this.deleteModalRef.hide();
      },
      error: (error) => {
        this.errorStatusAlert = true;
        this.errorResult = "Error: unable to delete comment / remove reports, please contact developers for assistance";
        console.log(error);
      },
    });

  }

  closeModal() {
    this.onCancelDelete.emit();
    this.deleteModalRef.hide();
  }

}
