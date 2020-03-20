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
    this.EmailAddress = new FormControl('test2@gmail.com', [Validators.required, Validators.email])
    this.Username = new FormControl('asdfg', [Validators.required, Validators.maxLength(10), Validators.minLength(5)])
    this.Password = new FormControl('Aa2345!', [Validators.required, Validators.maxLength(10), Validators.minLength(5)])
    this.ConfirmPassword = new FormControl('Aa2345!', [Validators.required, this.MustMatch(this.Password)])  
    this.errorList = [];

     // Initialize FormGroup using FormBuilder
    this.insertForm = this.formBuilder.group({
      "EmailAddress" : this.EmailAddress,
      "Username" : this.Username,
      "Password" : this.Password,
      "ConfirmPassword" : this.ConfirmPassword   
    });
  }

  showError(){
    console.log(this.Username.errors);
    console.log(this.Username.errors?.minLength);
  }

  onSubmit()
  {
    let userReg = this.insertForm.value;

    this.acct.register(userReg.Username, userReg.Password, userReg.EmailAddress).subscribe(
      result => {
        console.log('Register Successfully');
        this.router.navigate(['/login']);
      },
      err => {
        console.log(userReg.Username + userReg.Password + userReg.EmailAddress);
        
        this.errorList = [];

        for(var i = 0; i < err.error.value.length; i++) 
        {
          console.log(err.error.value[i])
          this.errorList.push(err.error.value[i]);
        }
        console.log(this.errorList)
        
      }
    );

  }

}
