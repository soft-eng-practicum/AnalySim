import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, AbstractControl, ValidatorFn } from '@angular/forms';
import { AccountService } from '../services/account.service';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  insertForm: FormGroup;
  EmailAddress : FormControl;
  Username: FormControl;
  Password: FormControl;
  ConfirmPassword: FormControl;
  errorList : string[];

  constructor(
    private acct : AccountService, 
    private router : Router,
    private route : ActivatedRoute,
    private formBuilder : FormBuilder           
  ) { }

  MustMatch(passwordControl : AbstractControl) : ValidatorFn
  {
    return (confirmPasswordControl : AbstractControl) : {[key: string] : boolean} | null =>
    {
      if(!passwordControl && !confirmPasswordControl){
        return null;
      }
      
      if(confirmPasswordControl && !passwordControl){
        return null;
      }

      if(passwordControl.value !== confirmPasswordControl.value){
        return {'mustMatch': true};
      }
      else{
        return null;
      }
    }
  }

  ngOnInit() {
    this.Username = new FormControl('', [Validators.required, Validators.maxLength(10), Validators.minLength(5)])
    this.Password = new FormControl('', [Validators.required, Validators.maxLength(10), Validators.minLength(5)])
    this.ConfirmPassword = new FormControl('', [Validators.required, this.MustMatch(this.Password)])
    this.EmailAddress = new FormControl('', [Validators.required])
    this.errorList = [];

     // Initialize FormGroup using FormBuilder
     this.insertForm = this.formBuilder.group({
      "Username" : this.Username,
      "Password" : this.Password,
      "ConfirmPassword" : this.ConfirmPassword,
      "EmailAddress" : this.EmailAddress
    });
  }


  onSubmit()
  {
    let userReg = this.insertForm.value;

    this.acct.register(userReg.Username, userReg.Password, userReg.EmailAddress).subscribe(
      result => {
        this.router.navigate(['/login']);
      },
      error => {
        this.errorList = [];

        for(var i = 0; i < error.error.value.length; i++) 
        {
          this.errorList.push(error.error.value[i]);
        }

        console.log(error)
      }
    );

  }

}
