import { Component, OnInit } from '@angular/core';
import { ApplicationUser } from '../interfaces/user';
import { AccountService } from '../services/account.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit {

  constructor(private accountService : AccountService) { }

  
  currentUser$ : Observable<ApplicationUser>

  ngOnInit(): void {
    //this.currentUser$ = this.accountService.userData
  }

}
