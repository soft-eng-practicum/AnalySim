import { Component, OnInit} from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder} from '@angular/forms';
import { AccountService } from '../services/account.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {

  loginForm: FormGroup;
  username: FormControl;
  password: FormControl;
  returnUrl: string;
  errorMessage: string;
  invalidLogin: boolean;
  isLoading: boolean;


  constructor(private acct : AccountService, 
              private router : Router,
              private route : ActivatedRoute,
              private formBuilder : FormBuilder,
              public notfi : NotificationService
              ) { }

  ngOnInit() {
    // Initialize Form Controls
    this.username = new FormControl('', [Validators.required]);
    this.password = new FormControl('', [Validators.required]);

    this.isLoading = false;

    // get return url from route parameters or default to '/'
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || 'dashboard';

     // Initialize FormGroup using FormBuilder
    this.loginForm = this.formBuilder.group({
        "username" : this.username,
        "password" : this.password
    });

  }

  onSubmit()
  {
    let userLogin = this.loginForm.value;

    this.isLoading = true;
    this.loginForm.reset();
    

    this.acct.login(userLogin.username, userLogin.password).subscribe(
      result => {
        let token = (<any>result).token;      
        this.invalidLogin = false;
        this.router.navigateByUrl(this.returnUrl);
      },
      error => {
        this.isLoading = false;
        this.invalidLogin = true;
        this.errorMessage = "Username/Password is invalid";
      }
    );

  }

}
