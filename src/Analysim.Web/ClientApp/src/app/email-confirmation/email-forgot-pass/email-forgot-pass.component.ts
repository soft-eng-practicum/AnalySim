import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from 'src/app/services/account.service';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';

import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-email-forgot-pass',
  templateUrl: './email-forgot-pass.component.html',
  styleUrls: ['./email-forgot-pass.component.css']
})
export class EmailForgotPassComponent implements OnInit {
  insertForm: FormGroup;
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
  ) { }

  ngOnInit(): void {
    this.emailAddress = new FormControl('', [Validators.required, Validators.email])

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || 'dashboard';

    // Initialize FormGroup using FormBuilder
    this.insertForm = this.formBuilder.group({
      'emailAddress': this.emailAddress,
      'username': this.username,
      'password': this.password,
      'confirmPassword': this.confirmPassword
    });

  }

  sendPasswordToken() {
    // Variable for FormGroupValue
    let userReg = this.insertForm.value

    // TODO: call method in account.service.ts
    console.log("Function works")
    this.acct.sendPasswordResetToken(userReg.emailAddress);
    console.log("sendPasswordResetToken works")
  }

}
