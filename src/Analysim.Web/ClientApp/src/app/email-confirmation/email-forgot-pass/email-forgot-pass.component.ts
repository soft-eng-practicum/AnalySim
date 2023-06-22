import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from 'src/app/services/account.service';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';

import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { User } from 'src/app/interfaces/user';
import { NotificationService } from 'src/app/services/notification.service';

@Component({
  selector: 'app-email-forgot-pass',
  templateUrl: './email-forgot-pass.component.html',
  styleUrls: ['./email-forgot-pass.component.css']
})
export class EmailForgotPassComponent implements OnInit {
  emailform: FormGroup;
  emailAddress: FormControl;
  username: FormControl;
  password: FormControl
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
    private notfi: NotificationService,
  ) { }

  ngOnInit(): void {
    this.emailAddress = new FormControl('', [Validators.required, Validators.email])

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || 'login';

    // Initialize FormGroup using FormBuilder
    this.emailform = this.formBuilder.group({
      'EmailAddress': this.emailAddress
    });
    

  }

  sendPasswordToken() {
    // Variable for FormGroupValue
    let userReg = this.emailform.value
    this.notfi.showInfo("Password Reset Email","If this is an account that we have, then an email has been sent");
    this.acct.sendPasswordResetToken(userReg.EmailAddress).subscribe(
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
