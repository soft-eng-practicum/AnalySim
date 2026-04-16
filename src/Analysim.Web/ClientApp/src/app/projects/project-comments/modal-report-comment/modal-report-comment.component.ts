import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { User } from 'src/app/interfaces/user';
import { ProjectService } from 'src/app/services/project.service';
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

@Component({
  selector: 'app-modal-report-comment',
  templateUrl: './modal-report-comment.component.html',
  styleUrls: ['./modal-report-comment.component.scss'],
})
export class ModalReportCommentComponent implements OnInit {
  @Input() flagModalRef: BsModalRef
  @Input() commentID: number;
  @Input() commentContentSnapshot: string;
  @Input() currentUser: User;
  @Input() isCurrentlyFlagged: boolean;

  @Output() onSuccessfulFlag = new EventEmitter<boolean>();
  @Output() onSuccessfulRemove = new EventEmitter<boolean>();
  @Output() onCancelFlag = new EventEmitter<void>();

  errorResult: String;
  errorStatusAlert = false;
  
  constructor(private projectService: ProjectService) { }

  ngOnInit(): void {}

  onFlagComment(): void {
    this.projectService.reportComment(this.commentID).subscribe({
      next: (result) => {
        console.log('Reported comment', result);
        this.onSuccessfulFlag.emit(result.isPendingReview);
        this.flagModalRef.hide();
      },
      error: (error) => {
        this.errorStatusAlert = true;
        this.errorResult = "Error: unable to report comment, please contact developers for assistance";
        console.log(error);
      },
    });
  }

  onRemoveFlagComment(): void {
    this.projectService.removeCommentReport(this.commentID).subscribe({
      next: (result) => {
        console.log('Comment Report Removed', this.commentID);
        this.onSuccessfulRemove.emit(result.isPendingReview);
        this.flagModalRef.hide();
      },
      error: (error) => {
        this.errorStatusAlert = true;
        this.errorResult = "Error: unable to remove comment report, please contact developers for assistance";
        console.log(error);
      },
    });
  }

  closeModal() {
    this.onCancelFlag.emit();
    this.flagModalRef.hide();
  }
}
