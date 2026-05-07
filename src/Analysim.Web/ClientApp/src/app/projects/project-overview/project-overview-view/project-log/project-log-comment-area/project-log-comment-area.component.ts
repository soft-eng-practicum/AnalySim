import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable } from 'rxjs';
import { ProjectComment } from 'src/app/interfaces/project-comment';
import { User } from 'src/app/interfaces/user';
import { AccountService } from 'src/app/services/account.service';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-project-log-comment-area',
  templateUrl: './project-log-comment-area.component.html',
  styleUrls: ['./project-log-comment-area.component.scss']
})
export class ProjectLogCommentAreaComponent implements OnInit {
  @Input() projectId: number;
  @Input() projectLogId: number;
  @Output() newReply = new EventEmitter<void>(); // tells parent to increase comment count

  comments: ProjectComment[] = [];

  isReplying: boolean;
  isLoading: boolean = false;

  // Current User
  currentUser$: Observable<User> = null;
  currentUser: User = null;

  // admin 
  currentAdminComment: string;

  constructor(
    private projectService: ProjectService,
    private accountService: AccountService,
    private route: ActivatedRoute,
  ) {}

  async ngOnInit(): Promise<void> {
    this.loadComments();

    this.currentUser$ = await this.accountService.currentUser;

    this.currentUser$.subscribe((user) => {
      this.currentUser = user;
    });
  }

  loadComments(): void {
    this.isLoading = true;

    this.projectService.getProjectLogComments(this.projectLogId).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.isLoading = false;

        // When routing from admin panel, wait until comments are loaded to scroll
        setTimeout(() => {
          const fragment = this.route.snapshot.fragment;
          this.currentAdminComment = fragment
          if (fragment) {
            document
              .getElementById(fragment)
              ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
        });
      },
      error: (error) => {
        console.log('Failed to load comments', error);
        this.isLoading = false;
      },
    });
  }

  onPostComment(
    content: string | { content: string; parentCommentId: number },
  ): void {
    if(!this.currentUser) return;
    
    var comment: string = '';
    var parentId: number | null = null;

    if (typeof content === 'string') {
      comment = content;
    } else {
      comment = content.content;
      parentId = content.parentCommentId;
    }

    this.projectService
      .postComment(this.projectId, comment, parentId, this.projectLogId)
      .subscribe({
        next: (result) => {
          console.log('Posted new comment', result.commentId);
          this.currentAdminComment = result.commentId.toString();
          this.loadComments();
          this.newReply.emit();
        },
        error: (error) => {
          console.log('Failed to post comment', error);
        },
      });
  }

  onPutEdit(content: { content: string; commentId: number }): void {
    this.projectService
      .updateComment(content.commentId, content.content)
      .subscribe({
        next: (result) => {
          console.log('Updated comment', content.commentId);
          this.loadComments();
        },
        error: (error) => {
          console.log('Failed to update comment', error);
        },
      });
  }

  onCloseReply(){
    this.isReplying = false;
  }

  addComment() {
    this.isReplying = true;
  }

}
