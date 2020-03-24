import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { Observable } from 'rxjs';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit {

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
