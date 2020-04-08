import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as jwt_decode from 'jwt-decode';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private http : HttpClient, private router: Router) { }

  // Url to access Web API
  private baseUrlLogin : string = "/api/account/login";
  private baseUrlRegister : string = "/api/account/register";

  //User properties
  private loginStatus = new BehaviorSubject<boolean>(this.checkLoginStatus());
  private username = new BehaviorSubject<string>(localStorage.getItem('username'));
  private userRole = new BehaviorSubject<string>(localStorage.getItem('userRole'));


  checkLoginStatus(): boolean {
    var loginCookie = localStorage.getItem('loginStatus');
    if(loginCookie == "1")
    {
      if(localStorage.getItem('jwt') === null || localStorage.getItem('jwt') === undefined) 
      {
          return false;
      }

      // Get and Decode the Token
      const token = localStorage.getItem('jwt');
      
      const decoded = jwt_decode(token);

      // Check if the cookie is valid
      if(decoded.exp === undefined) 
      {
          return false;
      }
      

      // Get Current Time
      const date = new Date(0);

      // Convert Expiration to UTC
      let tokenExpDate = date.setUTCSeconds(decoded.exp);

      // Compare Expiration time with current time
      if(tokenExpDate.valueOf() > new Date().valueOf()) 
      {
        return true;
      }

      return false;
    }
    return false;
  }

  register (username: string, password: string, emailaddress: string)
  {
    return this.http.post<any>(this.baseUrlRegister, {username, password, emailaddress}).pipe(
      map(result => {
        return result;
      },
      error =>{
        return error;
      })
    );
  }

  login (username: string, password: string)
  {
    return this.http.post<any>(this.baseUrlLogin, {username, password}).pipe(
      map(result => {
        if(result && result.token)
        {
          this.loginStatus.next(true);
          localStorage.setItem('loginStatus', '1');
          localStorage.setItem('jwt', result.token);
          localStorage.setItem('username', result.username);
          localStorage.setItem('expiration', result.expiration);
          localStorage.setItem('userRole', result.userRole);
          this.username.next(localStorage.getItem('username'));
          this.userRole.next(localStorage.getItem('userRole'));
        }
        return result;
      })
    );
  }

  logout()
  {
    // Set Login Status to false
    this.loginStatus.next(false);

    // Remove item from localStorage
    localStorage.setItem('loginStatus', '0');
    localStorage.removeItem('jwt');
    localStorage.removeItem('username');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userRole');

    // Navigate back to the login page
    this.router.navigate(['/login']);
  }

  get isLoggedIn()
  {
    return this.loginStatus.asObservable();
  }

  get currentUsername()
  {
    return this.username.asObservable();
  }

  get currentUserRole()
  {
    return this.userRole.asObservable();
  }

}
