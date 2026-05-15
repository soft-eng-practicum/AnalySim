import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { User } from 'src/app/interfaces/user';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-modal-repost-log',
  templateUrl: './modal-repost-log.component.html',
  styleUrls: ['./modal-repost-log.component.scss']
})
export class ModalRepostLogComponent implements OnInit {
  @Input() repostModalRef: BsModalRef
  @Input() projectLogID: number;
  @Input() currentUser: User;
  
  @Output() onSuccessfulRepost = new EventEmitter<void>();
  @Output() onCancelRepost = new EventEmitter<void>();

  errorResult: String;
  errorStatusAlert = false;

  constructor(private projectService: ProjectService) { }

  ngOnInit(): void {}

  onRepostLog(): void {
    this.projectService.repostProjectLog(this.projectLogID).subscribe({
      next: (result) => {
        console.log('Repostd log', this.projectLogID);
        this.onSuccessfulRepost.emit();
        this.repostModalRef.hide();
      },
      error: (error) => {
        this.errorStatusAlert = true;
        this.errorResult = "Error: unable to repost log, please contact developers for assistance";
        console.log(error);
      },
    });
  }

  closeModal() {
    this.onCancelRepost.emit();
    this.repostModalRef.hide();
  }

}
