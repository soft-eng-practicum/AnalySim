import { Component, OnInit } from '@angular/core';
import { FlaggedCommentGroup } from 'src/app/interfaces/project-comment-flag';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {
  flaggedComments: FlaggedCommentGroup[] = [];
  isLoading: boolean = false;

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadComments();
  }

  loadComments(): void {
    this.isLoading = true;

    this.projectService.getFlaggedProjectComments().subscribe({
      next: (flaggedComments) => {
        this.flaggedComments = flaggedComments;
        this.isLoading = false;
      },
      error: (error) => {
        console.log('Failed to load flagged comments', error);
        this.isLoading = false;
      },
    });
  }

}
