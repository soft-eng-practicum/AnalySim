import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  TemplateRef,
  ViewChild,
} from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import {
  FlaggedCommentGroup,
  ProjectCommentFlagRow,
} from 'src/app/interfaces/project-comment-flag';

@Component({
  selector: 'app-flagged-comment-item',
  templateUrl: './flagged-comment-item.component.html',
  styleUrls: ['./flagged-comment-item.component.scss'],
})
export class FlaggedCommentItemComponent implements OnInit {
  @Input() flaggedComment: FlaggedCommentGroup;
  
  @Output() onReload = new EventEmitter<void>();

  // Modals
  @ViewChild('ignoreModal') ignoreModal: TemplateRef<any>;
  @ViewChild('deleteModal') deleteModal: TemplateRef<any>;

  // Modal Refs
  ignoreModalRef: BsModalRef;
  deleteModalRef: BsModalRef;

  flags: ProjectCommentFlagRow[];
  isDeleted: boolean;
  isDeleting: boolean;
  isIgnoring: boolean;

  constructor(private modalService: BsModalService, private router: Router,) {}

  ngOnInit(): void {
    this.flags = this.flaggedComment.flags;
  }

  // Delete

  onDelete(): void {
    this.toggleModalDelete();
    this.isDeleting = true;
  }

  onHandleSuccessfulDelete(): void {
    this.isDeleted = true;
    this.isDeleting = false;
    this.onReload.emit();
  }

  toggleModalDelete() {
    this.deleteModalRef = this.modalService.show(this.deleteModal)
  }

  // Ignore

  onIgnore(): void {
    this.toggleModalIgnore();
    this.isIgnoring = true;
  }

  onHandleSuccessfulIgnore(): void {
    this.isIgnoring = false;
    this.onReload.emit();
  }

  toggleModalIgnore() {
    this.ignoreModalRef = this.modalService.show(this.ignoreModal)
  }

  // View
  onView(): void {
    const p = this.flaggedComment;
    this.router.navigate([`/project/${p.commentProjectOwner}/${p.commentProjectName}/comment/`], { fragment: String(p.commentID), queryParams: { returnUrl: this.router.url },  });
  }
}
