import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from 'src/app/services/account.service';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';

import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { User } from 'src/app/interfaces/user';

@Component({
  selector: 'app-email-resend-verification',
  templateUrl: './email-resend-verification.component.html',
  styleUrls: ['./email-resend-verification.component.css']
})
export class EmailResendVerificationComponent implements OnInit {
  emailform: FormGroup;
  email: FormControl;

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
    this.email = new FormControl('', [Validators.required, Validators.email])

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || 'dashboard';

    // Initialize FormGroup using FormBuilder
    this.emailform = this.formBuilder.group({
      'EmailAddress': this.email
    });
  }

  // TODO: set up in account service
  sendReverifyLink() {
    let userReg = this.emailform.value

    this.acct.resendVerificationLink(userReg.EmailAddress).subscribe(
      result => {
        let token = (<any>result).token;
        this.router.navigateByUrl(this.returnUrl);
      },
      error => {
        this.isLoading = false;
        this.errorMessage = error.error;
      }
    );
  }
}

