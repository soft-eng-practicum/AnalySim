import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.css']
})
export class NavMenuComponent implements OnInit {

  constructor(private acct : AccountService) { }

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
