import { Component, OnInit } from '@angular/core';
import { SidebarService } from '../services/sidebar.service';
import { Observable } from 'rxjs';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-sidebar',
  templateUrl: './sidebar.component.html',
  styleUrls: ['./sidebar.component.css']
})
export class SidebarComponent implements OnInit {

  constructor(private sidebarService : SidebarService, private acctService : AccountService) { }

  toggleStatus$ : Observable<boolean>;
  loginStatus$ : Observable<boolean>;

  ngOnInit() {
    this.toggleStatus$ = this.sidebarService.isToggled;
    this.loginStatus$ = this.acctService.isLoggedIn;
  }

}
