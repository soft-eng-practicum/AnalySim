import { Injectable } from '@angular/core';
import { HttpClient} from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as jwt_decode from 'jwt-decode';
import { ApplicationUser } from '../interfaces/user';
import { UserUser } from '../interfaces/user-user';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private http : HttpClient, private router: Router) { }

  // Url to access Web API
  private baseUrlLogin : string = "/api/account/login"
  private baseUrlRegister : string = "/api/account/register"
  private baseUrlRead : string = "/api/account/read/"
  private baseUrlReadList : string = "/api/account/read"
  private baseUrlSearch : string = "/api/account/search/"
  private baseUrlFollow : string = "/api/account/follow"
  private baseUrlUnfollow : string = "/api/account/unfollow/"

  //User properties
  private loginStatus = new BehaviorSubject<boolean>(this.checkLoginStatus())
  private username = new BehaviorSubject<string>(localStorage.getItem('username'))
  private userRole = new BehaviorSubject<string>(localStorage.getItem('userRole'))
  private userID = new BehaviorSubject<number>(parseInt(localStorage.getItem('userID')))

  register (username: string, password: string, emailaddress: string)
  {
    let body = new FormData()
    body.append('emailaddress', emailaddress)
    body.append('username', username)
    body.append('password', password)

    return this.http.post<any>(this.baseUrlRegister, body).pipe(
      map(result => {
        return result
      },
      error =>{
        return error
      })
    );
  }

  login (username: string, password: string)
  {
    let body = new FormData()
    body.append('username', username)
    body.append('password', password)

    return this.http.post<any>(this.baseUrlLogin, body).pipe(
      map(result => {
        if(result && result.token)
        {
          this.loginStatus.next(true)
          localStorage.setItem('loginStatus', '1')
          localStorage.setItem('jwt', result.token)
          localStorage.setItem('username', result.username)
          localStorage.setItem('expiration', result.expiration)
          localStorage.setItem('userRole', result.userRole)
          localStorage.setItem('userID', result.userID)
          this.username.next(localStorage.getItem('username'))
          this.userRole.next(localStorage.getItem('userRole'))
          this.userID.next(parseInt(localStorage.getItem('userID')))
        }
        return result
      })
    );
  }

  Read (userID : number) : Observable<ApplicationUser>
  {

    return this.http.get<any>(this.baseUrlRead + userID).pipe(
      map(result => {
        console.log(result.message)
        return result.user[0]
      },
      error =>{
        return error
      })
    );
  }

  ReadUserList () : Observable<ApplicationUser[]>
  {
    return this.http.get<any>(this.baseUrlReadList).pipe(
      map(result => {
        console.log(result.message)
        return result.user
      },
      error =>{
        return error
      })
    );
  }

  Search (searchTerm: string) : Observable<ApplicationUser[]>
  {
    return this.http.get<any>(this.baseUrlSearch + searchTerm).pipe(
      map(result => {
        console.log(result.message)
        return result.user
      },
      error =>{
        return error
      })
    );
  }

  Follow (userFollower : UserUser) : Observable<UserUser>
  {
    let body = new FormData()
    body.append('userID', userFollower.userID.toString())
    body.append('followerID', userFollower.followerID.toString())
    

    return this.http.post<any>(this.baseUrlFollow, body ).pipe(
      map(result => {
        console.log(result.message)
        return result.userFollower
      },
      error =>{
        return error
      })
    );
  }

  Unfollow (userFollower : UserUser) : Observable<UserUser>
  {
    let userID = userFollower.userID.toString()
    let followerID = userFollower.followerID.toString()

    return this.http.delete<any>(this.baseUrlUnfollow + userID + '/' + followerID).pipe(
      map(result => {
        console.log(result.message)
        return result.userFollower
      },
      error =>{
        return error
      })
    );
  }

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
      
      const decoded = jwt_decode(token)

      // Check if the cookie is valid
      if(decoded.exp === undefined) 
      {
          return false;
      }
      

      // Get Current Time
      const date = new Date(0)

      // Convert Expiration to UTC
      let tokenExpDate = date.setUTCSeconds(decoded.exp)

      // Compare Expiration time with current time
      if(tokenExpDate.valueOf() > new Date().valueOf()) 
      {
        return true;
      }

      return false;
    }
    return false;
  }

  logout()
  {
    // Set Login Status to false
    this.loginStatus.next(false)

    // Remove item from localStorage
    localStorage.setItem('loginStatus', '0')
    localStorage.removeItem('jwt')
    localStorage.removeItem('username')
    localStorage.removeItem('expiration')
    localStorage.removeItem('userRole')
    localStorage.removeItem('userID')

    // Navigate back to the login page
    this.router.navigate(['/login'])
  }

  get isLoggedIn()
  {
    return this.loginStatus.asObservable()
  }

  get currentUsername()
  {
    return this.username.asObservable()
  }

  get currentUserRole()
  {
    return this.userRole.asObservable()
  }

  get currentUserID()
  {
    return this.userID.asObservable()
  }

}
