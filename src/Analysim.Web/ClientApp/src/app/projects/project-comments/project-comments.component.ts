import { Component, Input, OnInit } from '@angular/core';
import { ProjectComment } from 'src/app/interfaces/project-comment';
import { ProjectService } from 'src/app/services/project.service';
import { ProjectCommentBoxComponent } from './project-comment-box/project-comment-box.component';

@Component({
  selector: 'app-project-comments',
  templateUrl: './project-comments.component.html',
  styleUrls: ['./project-comments.component.scss']
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
      }
    });
  }

  onAddComment(): void {
    // Open comment box
  }
}
