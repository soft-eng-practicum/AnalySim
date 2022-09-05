import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from 'src/app/services/account.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-email-forgot-pass',
  templateUrl: './email-forgot-pass.component.html',
  styleUrls: ['./email-forgot-pass.component.css']
})
export class EmailForgotPassComponent implements OnInit {

  constructor(
    private acct: AccountService,
    private router: Router,
    private route: ActivatedRoute
  ) { }

  ngOnInit(): void {

  }

  onSubmit() {
    // this.acct.resetPassword


  }

}
