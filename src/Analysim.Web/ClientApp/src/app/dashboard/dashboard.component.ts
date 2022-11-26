import { Component, OnInit } from '@angular/core';
import { User } from '../interfaces/user';
import { AccountService } from '../services/account.service';
import { Observable, from } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {

  constructor(private accountService : AccountService) { }

  currentUser$ : Observable<User> = null

  async ngOnInit() {
    await this.accountService.currentUser.then((x) => this.currentUser$ = x)
  }

}
