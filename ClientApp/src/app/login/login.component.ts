import { Component, OnInit } from '@angular/core';
import { FormGroup} from '@angular/forms';
import { AccountService } from '../services/account.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  private loginStatusGet : boolean;

  constructor(private acct : AccountService) { }

  ngOnInit() {
    
  }

}
