import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from 'src/app/services/account.service';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';

import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { User } from 'src/app/interfaces/user';


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css']
})
export class ResetPasswordComponent implements OnInit {
  emailform: FormGroup;
  pass: FormControl;
  passConfirm: FormControl;
  confirmPassword: FormControl;
  errorList: string[];
  isLoading: boolean;
  errorMessage: string;
  invalidRegister: boolean;
  returnUrl: string;

  constructor(
    private acct: AccountService,
    private router: Router,
    private route: ActivatedRoute,
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
  }


  setNewPassword() {
    // Variable for FormGroupValue
    let userReg = this.emailform.value

    // TODO: call method in account.service.ts
    this.acct.resetPassword(userReg.pass, userReg.passConfirm).subscribe(
      result => {
        let token = (<any>result).token;
        this.router.navigateByUrl(this.returnUrl);
      },
      error => {
        this.isLoading = false;
        this.errorMessage = error.error.loginError;
      }
    );

  }

}
