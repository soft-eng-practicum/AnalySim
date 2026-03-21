import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { AccountService } from '../services/account.service';
import { CommunicationsService } from '../services/communications.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationService } from '../services/notification.service';
import { ConfigService } from '../services/config.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  insertForm: FormGroup;
  emailAddress: FormControl;
  username: FormControl;
  password: FormControl;
  confirmPassword: FormControl;
  workPlace: FormControl;
  positionTitle: FormControl;
  whereDidYouHearAboutAnalysim: FormControl;
  wouldYouLikeToHearUpdatesFromUs: FormControl;
  registrationCode: FormControl;
  errorList: string[];
  isLoading: boolean = false;
  errorMessage: string;
  invalidRegister: boolean;
  returnUrl: string;
  showHideRegistrationCode : boolean = true;

  constructor(
    private accountService: AccountService,
    private communicationsService: CommunicationsService,
    private router: Router,
    private formBuilder: FormBuilder,
    private notfi: NotificationService,
    private route: ActivatedRoute,
    private configService: ConfigService
  ) { }

  ngOnInit() {
    // Set up FormControl and its Validators
    this.emailAddress = new FormControl('', [Validators.required, Validators.email])
    this.username = new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(15)])
    this.password = new FormControl('', [Validators.required, Validators.minLength(5), this.hasUpper(), this.hasLower(), this.hasNumeric(), this.hasSpecial()])
    this.confirmPassword = new FormControl('', [Validators.required, this.isMatch(this.password)])
    this.workPlace = new FormControl('');
    this.positionTitle = new FormControl('');
    this.whereDidYouHearAboutAnalysim = new FormControl('');
    this.wouldYouLikeToHearUpdatesFromUs = new FormControl(false);
    this.registrationCode = new FormControl('');
    this.errorList = [];
    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';

    // Initialize FormGroup using FormBuilder
    this.insertForm = this.formBuilder.group({
      'emailAddress': this.emailAddress,
      'username': this.username,
      'password': this.password,
      'confirmPassword': this.confirmPassword,
      'workPlace': this.workPlace,
      'positionTitle': this.positionTitle,
      'whereDidYouHearAboutAnalysim': this.whereDidYouHearAboutAnalysim,
      'wouldYouLikeToHearUpdatesFromUs': this.wouldYouLikeToHearUpdatesFromUs,
      'registrationCode': this.registrationCode,
    });

    this.configService.checkRegistrationCodesLength().subscribe({
      next: (data) => {
        this.showHideRegistrationCode = data === 0 ? true : false;
      },
      error: (error) => {
        console.error(error);
      }
    })

  }


  onSubmit() {
    // Variable for FormGroupValue
    let userReg = this.insertForm.value

    // Survey
    let registrationSurvey = {
      "workPlace": userReg.workPlace,
      "positionTitle":userReg.positionTitle,
      "whereDidYouHearAboutAnalysim": userReg.whereDidYouHearAboutAnalysim,
      "wouldYouLikeToHearUpdatesFromUs": userReg.wouldYouLikeToHearUpdatesFromUs,
      "registrationCode":userReg.registrationCode
    };
    
    // Show loading icon
    this.isLoading = true;

    // Register the Account
    this.accountService.register(userReg.username, userReg.password, userReg.emailAddress, JSON.stringify(registrationSurvey)).subscribe(
      result => {
        this.invalidRegister = false

        // Navigate to login page
        if (this.returnUrl == "")
          this.router.navigate(['/login'])
        else
          this.router.navigate(['/login'], { queryParams: { returnUrl: this.returnUrl } })

        // Send registration notification
        this.notfi.showSuccess(
          'Your account has been registered and a verification email has been sent to your address. Before you can login, you must confirm your account by clicking the link in this email.', 
          'Registration'
        );
      },
      error => {
        this.isLoading = false;
        this.invalidRegister = true;

        //Set Error Message
        if (error.status === 500) {
          this.errorMessage = "System error. Contact the administrator.";
        }
        else if (error?.error?.Message) {
          this.errorMessage = error.error.Message;
        }
        else if (error?.error?.message?.length > 0) {
          this.errorMessage = error.error.message[0];
        }
        else {
          this.errorMessage = "An unexpected error occurred. Please try again.";
        }
      }
    );
  }

  // Customer Validator
  hasUpper(): ValidatorFn {
    return (passwordControl: AbstractControl): { [key: string]: boolean } | null => {

      // Check if empty
      if (passwordControl.value.length == '') {
        return null;
      }

      // Regular Expression for having Upper Case
      var reg = new RegExp('(?=.*[A-Z])');

      // Return Error Message if test false, otherwise return null
      if (!reg.test(passwordControl.value)) {
        return { 'noUpper': true };
      }
      else {
        return null;
      }
    }
  }

  hasLower(): ValidatorFn {
    return (passwordControl: AbstractControl): { [key: string]: boolean } | null => {

      // Check if empty
      if (passwordControl.value.length == '') {
        return null;
      }

      // Regular Expression for having Lower Case
      var reg = new RegExp('(?=.*[a-z])');

      // Return Error Message if test false, otherwise return null
      if (!reg.test(passwordControl.value)) {
        return { 'noLower': true };
      }
      else {
        return null;
      }
    }
  }

  hasNumeric(): ValidatorFn {
    return (passwordControl: AbstractControl): { [key: string]: boolean } | null => {

      // Check if empty
      if (passwordControl.value.length == '') {
        return null;
      }

      // Regular Expression for having Numeric Number
      var reg = new RegExp('(?=.*[0-9])');

      // Return Error Message if test false, otherwise return null
      if (!reg.test(passwordControl.value)) {
        return { 'noNumeric': true };
      }
      else {
        return null;
      }
    }
  }

  hasSpecial(): ValidatorFn {
    return (passwordControl: AbstractControl): { [key: string]: boolean } | null => {

      // Check if empty
      if (passwordControl.value.length == '') {
        return null;
      }

      // Regular Expression for having Numeric Number
      var reg = new RegExp('(?=.*[!@#$%^&*])');

      // Return Error Message if test false, otherwise return null
      if (!reg.test(passwordControl.value)) {
        return { 'noSpecial': true };
      }
      else {
        return null;
      }
    }
  }

  isMatch(passwordControl: AbstractControl): ValidatorFn {
    return (confirmPasswordControl: AbstractControl): { [key: string]: boolean } | null => {

      if (!passwordControl && !confirmPasswordControl) {
        return null;
      }

      if (confirmPasswordControl && !passwordControl) {
        return null;
      }

      // Return Error Message if value don't match, otherwise return null
      if (passwordControl.value !== confirmPasswordControl.value) {
        return { 'noMatch': true };
      }
      else {
        return null;
      }
    }
  }

}
