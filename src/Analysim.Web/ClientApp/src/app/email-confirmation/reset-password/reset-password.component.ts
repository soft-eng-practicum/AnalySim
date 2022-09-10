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

  passform: FormGroup;
  NewPassword: FormControl;
  passwordConfirm: FormControl;
  confirmPassword: FormControl;
  userId: string;
  passwordToken: string;

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
    this.route.queryParams.subscribe(params => {
      this.userId = params['UserId'];
      this.passwordToken = params['code'];
    });

    // Initialize Form Controls
    this.NewPassword = new FormControl('', [Validators.required]);
    this.passwordConfirm = new FormControl('', [Validators.required]);


    // Initialize FormGroup using FormBuilder
    this.passform = this.formBuilder.group({
      'NewPassword': this.passform,
      'passwordConfirm': this.passwordConfirm
    });
  }


  setNewPassword() {
    // Variable for FormGroupValue
    let userReg = this.passform.value

    // TODO: call changePassword in account.service.ts and account controller
    this.acct.changePassword(this.userId, userReg.NewPassword, (userReg.passwordConfirm), this.passwordToken).subscribe(
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
