import { Component, OnInit } from '@angular/core';
import {Location} from '@angular/common';
import { Observable } from 'rxjs';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-not-found',
  templateUrl: './not-found.component.html',
  styleUrls: ['./not-found.component.css']
})
export class NotFoundComponent implements OnInit {

  constructor(private location: Location,
              private accountService: AccountService){}

  loginStatus$ : Observable<boolean>

  ngOnInit(): void {
    this.loginStatus$ = this.accountService.isLoggedIn
  }

  backClicked() {
    this.location.back();
    this.location.back();
  }

}
