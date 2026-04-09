import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-modal-ignore-reports',
  templateUrl: './modal-ignore-reports.component.html',
  styleUrls: ['./modal-ignore-reports.component.scss']
})
export class ModalIgnoreReportsComponent implements OnInit {
  @Input() ignoreModalRef: BsModalRef
  @Input() commentID: number;
  
  @Output() onSuccessfulIgnore = new EventEmitter<void>();
  @Output() onCancelIgnore = new EventEmitter<void>();

  errorResult: String;
  errorStatusAlert = false;

  constructor(private projectService: ProjectService) { }

  ngOnInit(): void {}

  onIgnore(): void {
    this.projectService.removeallCommentReports(this.commentID).subscribe({
      next: (result) => {
        console.log('Removed comment reports', this.commentID);
        this.onSuccessfulIgnore.emit();
        this.ignoreModalRef.hide();
      },
      error: (error) => {
        this.errorStatusAlert = true;
        this.errorResult = "Error: unable to remove reports, please contact developers for assistance";
        console.log(error);
      },
    });
  }

  closeModal() {
    this.onCancelIgnore.emit();
    this.ignoreModalRef.hide();
  }
}
