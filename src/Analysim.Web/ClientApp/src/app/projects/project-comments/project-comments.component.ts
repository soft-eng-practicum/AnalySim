import { Component, Input, OnInit } from '@angular/core';
import { ProjectComment } from 'src/app/interfaces/project-comment';
import { ProjectService } from 'src/app/services/project.service';
import { ProjectCommentBoxComponent } from './project-comment-box/project-comment-box.component';
import { AccountService } from 'src/app/services/account.service';
import { Observable } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-project-comments',
  templateUrl: './project-comments.component.html',
  styleUrls: ['./project-comments.component.scss'],
})
export class ProjectCommentsComponent implements OnInit {
  @Input() projectId!: number;

  comments: ProjectComment[] = [];
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
    if (!this.projectId || this.projectId <= 0) return;

    this.isLoading = true;

    this.projectService.getProjectComments(this.projectId).subscribe({
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
    var comment: string = '';
    var parentId: number | null = null;

    if (typeof content === 'string') {
      comment = content;
    } else {
      comment = content.content;
      parentId = content.parentCommentId;
    }

    this.projectService
      .postComment(this.projectId, comment, parentId)
      .subscribe({
        next: (result) => {
          console.log('Posted new comment', result.commentId);
          this.currentAdminComment = result.commentId.toString();
          this.loadComments();
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
}
