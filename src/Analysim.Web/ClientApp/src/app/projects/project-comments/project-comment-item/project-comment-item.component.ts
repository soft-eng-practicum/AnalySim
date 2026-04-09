import { Component, EventEmitter, Input, Output, TemplateRef, ViewChild, } from '@angular/core';
import { Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Observable } from 'rxjs';
import { ProjectComment } from 'src/app/interfaces/project-comment';
import { User } from 'src/app/interfaces/user';
import { AccountService } from 'src/app/services/account.service';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-project-comment-item',
  templateUrl: './project-comment-item.component.html',
  styleUrls: ['./project-comment-item.component.scss']
})
export class ProjectCommentItemComponent {
  // Inputs
  @Input() comment!: ProjectComment;
  @Input() refreshReply: void;

  // Outputs
  @Output() submitReply = new EventEmitter<{content: string, parentCommentId: number}>();
  @Output() submitEdit = new EventEmitter<{content: string, commentId: number}>();

  // Modals
  @ViewChild('flagModal') flagModal: TemplateRef<any>
  @ViewChild('deleteModal') deleteModal: TemplateRef<any>

  // Modal Refs
  flagModalRef: BsModalRef;
  deleteModalRef: BsModalRef;

  // Current User
  currentUser$: Observable<User> = null;
  currentUser: User = null;
  isOwner = false;

  // Comment State
  isOpen = false;
  isReplying = false;
  isEditing = false;

  // Comment Likes
  isLikedByCurrentUser = false;
  numLikes = 0;
  isLiking = false;

  // Comment Delete Handling
  isDeleting = false;
  isDeleted = false;

  // Comment Report Handling
  isFlaggedByCurrentUser = false;
  isFlagging = false;

  constructor(
    private accountService: AccountService, 
    private projectService: ProjectService,
    private modalService: BsModalService,
    private router: Router,
  ) {}

  async ngOnInit(): Promise<void> {
    this.currentUser$ = await this.accountService.currentUser;

    this.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.isOwner = !!user && user.id === this.comment.userID;

      this.isLikedByCurrentUser =
        this.comment.commentLikes?.some((like) => like.userID === user?.id) ?? false;

      this.isFlaggedByCurrentUser = 
        this.comment.commentFlags?.some((flag) => flag.userID === user?.id) ?? false;
    });

    this.numLikes = this.comment.commentLikes.length;
    this.isDeleted = this.comment.isDeleted;
  }

  // Threads / Replies

  onViewThread(): void {
    this.isOpen = !this.isOpen;
  }

  // opens comment box below comment being replied to
  onOpenReply(): void {
    if (!this.accountService.checkLoginStatus()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.isReplying = !this.isReplying;
    if(this.isReplying){
      this.isOpen = true;
    }
  }

  // Submits reply to parent / handles nested replied based on reply shape
  onHandleReply(reply: string | {content: string, parentCommentId: number}): void {
    if (typeof reply === 'string') {
      this.submitReply.emit({
        content: reply,
        parentCommentId: this.comment.commentID
      });
    } else {
      this.submitReply.emit(reply);
    }
  }

  // Like comment

  onUpvote(): void {
    if (!this.accountService.checkLoginStatus()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    if(this.isOwner) return;
    this.isLiking = true;
    const comId = this.comment.commentID;

    if(this.isLikedByCurrentUser){
      this.projectService.unlikeComment(comId).subscribe({
      next: (result) => {
        this.numLikes--;
        this.isLiking = false;
        this.isLikedByCurrentUser = false;
      },
      error: (error) => {
        console.log('Failed to unlike comment', error);
        this.isLiking = false;
      },
    });
    } else {
      this.projectService.likeComment(comId).subscribe({
      next: (result) => {
        this.numLikes++;
        this.isLiking = false;
        this.isLikedByCurrentUser = true;
      },
      error: (error) => {
        console.log('Failed to like comment', error);
        this.isLiking = false;
      },
    });
    }
  }

  // Edit
  
  onEditMyComment(): void {
    if(this.comment.isDeleted) return;
    this.isEditing = !this.isEditing;
  }

  onHandleEdit(edit: string){
    this.submitEdit.emit({content: edit, commentId: this.comment.commentID});
  }

  onHandleNestedEdit(edit: { content: string; commentId: number }): void {
    this.submitEdit.emit(edit);
  }

  // Delete

  onDeleteMyComment(): void {
    if(this.comment.isDeleted) return;
    this.toggleModalDelete();
    this.isDeleting = true;
  }

  onHandleSuccessfulDelete(): void {
    this.isDeleted = true;
    this.isDeleting = false;
  }

  toggleModalDelete() {
    this.deleteModalRef = this.modalService.show(this.deleteModal)
  }

  // Report

  onReport(): void {
    if (!this.accountService.checkLoginStatus()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } });
      return;
    }

    this.toggleModalFlag();
    this.isFlagging = true;
  }

  onHandleSuccessfulFlag(): void {
    this.isFlaggedByCurrentUser = true;
    this.isFlagging = false;
  }

  onHandleSuccessfulRemove(): void {
    this.isFlaggedByCurrentUser = false;
    this.isFlagging = false;
  }

  toggleModalFlag() {
    this.flagModalRef = this.modalService.show(this.flagModal)
  }

}