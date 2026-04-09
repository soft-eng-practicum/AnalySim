import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { User } from 'src/app/interfaces/user';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-modal-delete-comment',
  templateUrl: './modal-delete-comment.component.html',
  styleUrls: ['./modal-delete-comment.component.scss']
})
export class ModalDeleteCommentComponent implements OnInit {
  @Input() deleteModalRef: BsModalRef
  @Input() commentID: number;
  @Input() currentUser: User;
  
  @Output() onSuccessfulDelete = new EventEmitter<void>();
  @Output() onCancelDelete = new EventEmitter<void>();

  errorResult: String;
  errorStatusAlert = false;

  constructor(private projectService: ProjectService) { }

  ngOnInit(): void {}

  onDeleteComment(): void {
    this.projectService.deleteComment(this.commentID).subscribe({
      next: (result) => {
        console.log('Deleted comment', this.commentID);
        this.onSuccessfulDelete.emit();
        this.deleteModalRef.hide();
      },
      error: (error) => {
        this.errorStatusAlert = true;
        this.errorResult = "Error: unable to delete comment, please contact developers for assistance";
        console.log(error);
      },
    });
  }

  closeModal() {
    this.onCancelDelete.emit();
    this.deleteModalRef.hide();
  }
}
