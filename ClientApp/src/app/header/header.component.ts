import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { NotificationService } from '../services/notification.service';
import { Observable } from 'rxjs';
import { SidebarService } from '../services/sidebar.service';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  constructor(private acct : AccountService, 
              public notfi : NotificationService,
              private sidebar : SidebarService){ }

  loginStatus$ : Observable<boolean>
  username$ : Observable<string>
  sideBarToggle$ : Observable<boolean>

  ngOnInit() {
    this.loginStatus$ = this.acct.isLoggedIn
    this.username$ = this.acct.currentUsername
    this.sideBarToggle$ = this.sidebar.isToggled
  }

  toggleSideBar() {
    this.sidebar.toggle()
  }

  onLogout(){
    this.acct.logout()
  }
}
