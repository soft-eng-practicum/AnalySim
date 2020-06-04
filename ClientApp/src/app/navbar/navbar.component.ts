import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { Observable } from 'rxjs';
import { ApplicationUser } from '../interfaces/user';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private accountService : AccountService,
    public notfi : NotificationService){ }

  loginStatus$ : Observable<boolean>
  currentUser$ : Observable<ApplicationUser>

  ngOnInit() {
    this.loginStatus$ = this.accountService.isLoggedIn
    this.currentUser$ = this.accountService.currentUser
  }

  onLogout(){
    this.accountService.logout()
  }
}
