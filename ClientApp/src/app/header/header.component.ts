import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { NotificationService } from '../services/notification.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private acct : AccountService, public notfi : NotificationService){ }

  loginStatus$ : Observable<boolean>;
  username$ : Observable<string>;

  ngOnInit() {
    this.loginStatus$ = this.acct.isLoggedIn;
    this.username$ = this.acct.currentUsername;
    
  }

  onLogout(){
    this.acct.logout();
  }
}
