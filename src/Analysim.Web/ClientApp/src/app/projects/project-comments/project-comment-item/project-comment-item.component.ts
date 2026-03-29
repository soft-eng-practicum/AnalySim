import { Component, Input } from '@angular/core';
import { Observable } from 'rxjs';
import { ProjectComment } from 'src/app/interfaces/project-comment';
import { User } from 'src/app/interfaces/user';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-project-comment-item',
  templateUrl: './project-comment-item.component.html',
  styleUrls: ['./project-comment-item.component.scss']
})
export class ProjectCommentItemComponent {
  @Input() comment!: ProjectComment;
  
  isOpen = false;
  currentUser$: Observable<User> = null;
  currentUser: User = null;
  isOwner = false;

  constructor(private accountService: AccountService) {}

  async ngOnInit(): Promise<void> {
    this.currentUser$ = await this.accountService.currentUser;

    this.currentUser$.subscribe((user) => {
      this.currentUser = user;
      this.isOwner = !!user && user.id === this.comment.userID;
    });
  }

  onReply(): void {
    // opens comment box below comment being replied to
  }

  onViewThread(): void {
    this.isOpen = !this.isOpen;
  }

  onReport(): void {
    // notify admins of comment
  }
}