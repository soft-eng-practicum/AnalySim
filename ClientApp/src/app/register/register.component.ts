import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { AccountService } from '../services/account.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  insertForm: FormGroup;
  emailAddress : FormControl;
  username: FormControl;
  password: FormControl;
  confirmPassword: FormControl;
  errorList : string[];
  isLoading : boolean;
  errorMessage: string;
  invalidRegister: boolean;

  constructor(
    private acct : AccountService, 
    private router : Router,
    private formBuilder : FormBuilder,
    private notfi : NotificationService          
  ) {}

  ngOnInit() {
    // Set up FormControl and its Validators
    this.emailAddress = new FormControl('', [Validators.required, Validators.email])
    this.username = new FormControl('', [Validators.required, Validators.maxLength(15), Validators.minLength(5)])
    this.password = new FormControl('', [Validators.required, Validators.minLength(5), this.hasUpper(), this.hasLower(), this.hasNumeric(), this.hasSpecial()])
    this.confirmPassword = new FormControl('', [Validators.required, this.isMatch(this.password)])  
    this.errorList = [];

     // Initialize FormGroup using FormBuilder
    this.insertForm = this.formBuilder.group({
      'emailAddress' : this.emailAddress,
      'username' : this.username,
      'password' : this.password,
      'confirmPassword' : this.confirmPassword   
    });
  }

  onSubmit(){
    // Variable for FormGroupValue
    let userReg = this.insertForm.value;

    // Show loading icon
    this.isLoading = true;

    // Register the Account
    this.acct.register(userReg.username, userReg.password, userReg.emailAddress).subscribe(
      result => {
        // Hide Error Message Box
        this.invalidRegister = false;

        // Navigate to login page
        this.router.navigate(['/login']);

        // Send registration notification
        this.notfi.showSuccess('Account has been registered', 'Registration');
      },
      error => {
        // Hide Loading Icon
        this.isLoading = false;

        // Show Error Message Box
        this.invalidRegister = true;

        //Set Error Message
        this.errorMessage = error.value[0];
      }
    );

  }

  // Customer Validator
  hasUpper(): ValidatorFn{
    return (passwordControl: AbstractControl): {[key: string]: boolean} | null => {
      
      // Check if empty
      if(passwordControl.value.length == ''){
        return null;
      }

      // Regular Expression for having Upper Case
      var reg = new RegExp('(?=.*[A-Z])');

      // Return Error Message if test false, otherwise return null
      if(!reg.test(passwordControl.value)){
        return {'noUpper': true};
      }
      else{
        return null;
      }
    }
  }

  hasLower(): ValidatorFn {
    return (passwordControl: AbstractControl): {[key: string]: boolean} | null => {

      // Check if empty
      if(passwordControl.value.length == ''){
        return null;
      }

      // Regular Expression for having Lower Case
      var reg = new RegExp('(?=.*[a-z])');

      // Return Error Message if test false, otherwise return null
      if(!reg.test(passwordControl.value)){
        return {'noLower': true};
      }
      else{
        return null;
      }
    }
  }

  hasNumeric(): ValidatorFn {
    return (passwordControl: AbstractControl): {[key: string]: boolean} | null => {

      // Check if empty
      if(passwordControl.value.length == ''){
        return null;
      }

      // Regular Expression for having Numeric Number
      var reg = new RegExp('(?=.*[0-9])');

      // Return Error Message if test false, otherwise return null
      if(!reg.test(passwordControl.value)){
        return {'noNumeric': true};
      }
      else{
        return null;
      }
    }
  }

  hasSpecial(): ValidatorFn {
    return (passwordControl: AbstractControl): {[key: string]: boolean} | null => {

      // Check if empty
      if(passwordControl.value.length == ''){
        return null;
      }

      // Regular Expression for having Numeric Number
      var reg = new RegExp('(?=.*[!@#$%^&*])');

      // Return Error Message if test false, otherwise return null
      if(!reg.test(passwordControl.value)){
        return {'noSpecial': true};
      }
      else{
        return null;
      }
    }
  }

  isMatch(passwordControl : AbstractControl) : ValidatorFn
  {
    return (confirmPasswordControl : AbstractControl) : {[key: string] : boolean} | null =>
    {
      
      if(!passwordControl && !confirmPasswordControl){
        return null;
      }
      
      if(confirmPasswordControl && !passwordControl){
        return null;
      }

      // Return Error Message if value don't match, otherwise return null
      if(passwordControl.value !== confirmPasswordControl.value){
        return {'noMatch': true};
      }
      else{
        return null;
      }
    }
  }

}
