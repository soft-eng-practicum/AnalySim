import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { Observable, from } from 'rxjs';
import { ApplicationUser } from '../interfaces/user';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit {

  constructor(private accountService : AccountService,
    public notfi : NotificationService,
    private router : Router){ }

  loginStatus$ : Observable<boolean>
  currentUser$ : Observable<ApplicationUser> = null

  async ngOnInit() {
    this.loginStatus$ = this.accountService.isLoggedIn
    await this.accountService.currentUser.then((x) => this.currentUser$ = x)
  }

  navigateHome(){
    console.log(this.accountService.checkLoginStatus())
    if(this.accountService.checkLoginStatus())
      this.router.navigate(['/dashboard'])
    else
      this.router.navigate(['/home'])
  }

  onLogout(){
    this.accountService.logout()
  }
}
