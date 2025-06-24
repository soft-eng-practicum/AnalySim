import { Component, OnInit } from '@angular/core';
import { AccountService } from 'src/app/services/account.service';
import { User } from '../../../interfaces/user';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit {
  users: User[] = [];
  loading = true;
  error: string = null;

  constructor(private account: AccountService) { }

  ngOnInit() {
    this.account.getUserList()
      .subscribe({
        next: result => {
          this.users = result;
          this.loading = false;
        },
        error: err => {
          this.error = 'Failed to load users';
          this.loading = false;
        }
      });
  }
}
