import { Component, Input, OnInit } from '@angular/core';
import { ProjectComment } from 'src/app/interfaces/project-comment';
import { ProjectService } from 'src/app/services/project.service';
import { ProjectCommentBoxComponent } from './project-comment-box/project-comment-box.component';

@Component({
  selector: 'app-project-comments',
  templateUrl: './project-comments.component.html',
  styleUrls: ['./project-comments.component.scss'],
})
export class ProjectCommentsComponent implements OnInit {
  @Input() projectId!: number;

  comments: ProjectComment[] = [];
  isLoading: boolean = false;

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    if (!this.projectId || this.projectId <= 0) return;

    this.isLoading = true;

    this.projectService.getProjectComments(this.projectId).subscribe({
      next: (comments) => {
        this.comments = comments;
        this.isLoading = false;
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
