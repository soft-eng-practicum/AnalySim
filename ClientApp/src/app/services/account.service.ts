import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  

  constructor(private http : HttpClient, private router: Router) { }

  private baseUrlLogin : string = "/api/account/login";
  private baseUrlRegister : string = "/api/account/register";

  
  private loginStatus = new BehaviorSubject<boolean>(this.checkLoginStatus());
  private username = new BehaviorSubject<string>(localStorage.getItem('username'));
  private userRole = new BehaviorSubject<string>(localStorage.getItem('userRole'));

  checkLoginStatus(): boolean {
    var loginCookie = localStorage.getItem('loginStatus');
    if(loginCookie == "1")
    {
      return true;
    }
    else
    {
      return false;
    }
    
  }

  register (username: string, password: string, emailaddress: string)
  {
    return this.http.post<any>(this.baseUrlRegister, {username, password, emailaddress}).pipe(
      map(result => {
        console.log('test:' + result)
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
        }
        return result;
      })
    );
  }

  logout()
  {
    this.loginStatus.next(false);
    localStorage.setItem('loginStatus', '0');
    localStorage.removeItem('jwt');
    localStorage.removeItem('username');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userRole');
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
