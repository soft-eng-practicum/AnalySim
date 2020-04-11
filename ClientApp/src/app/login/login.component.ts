import { Component, OnInit} from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder} from '@angular/forms';
import { AccountService } from '../services/account.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  insertForm: FormGroup;
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
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';

     // Initialize FormGroup using FormBuilder
    this.insertForm = this.formBuilder.group({
        "username" : this.username,
        "password" : this.password
    
    });

  }

  onSubmit()
  {
    let userLogin = this.insertForm.value;

    this.isLoading = true;
    this.insertForm.reset();
    

    this.acct.login(userLogin.username, userLogin.password).subscribe(
      result => {
        let token = (<any>result).token;      
        this.invalidLogin = false;
        this.router.navigate(['/dashboard']);
      },
      error => {
        this.isLoading = false;
        this.invalidLogin = true;
        this.errorMessage = "Username/Password is invalid";
      }
    );

  }

}
