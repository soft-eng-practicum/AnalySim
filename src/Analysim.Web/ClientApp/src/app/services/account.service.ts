import { Injectable } from '@angular/core';
import { HttpClient, HttpParams} from '@angular/common/http';
import { BehaviorSubject, Observable, empty, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import * as jwt_decode from 'jwt-decode';
import { User } from '../interfaces/user';
import { UserUser } from '../interfaces/user-user';
import { Project } from '../interfaces/project';
import { NotificationService } from './notification.service';
import { ProjectUser } from '../interfaces/project-user';
import { BlobFile } from '../interfaces/blob-file';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private http : HttpClient, private router: Router, private notfi : NotificationService) { }

  // Url to access Web API
  private baseUrl : string = '/api/account/'

  // Get
  private urlGetUserByID : string = this.baseUrl + "getuserbyid/"
  private urlGetUserByName : string = this.baseUrl + "getuserbyname/"
  private urlGetUserRange : string = this.baseUrl + "getuserrange?"
  private urlGetUserList : string = this.baseUrl + "getuserlist"
  private urlSearch : string = this.baseUrl + "search?"

  // Post
  private urlFollow : string = this.baseUrl + "follow"
  private urlRegister : string = this.baseUrl + "register"
  private urlLogin : string = this.baseUrl + "login"
  private urlUploadProfileImage : string = this.baseUrl + "uploadprofileimage"

  // Post
  private urlUpdateUser : string = this.baseUrl + "updateuser/"

  // Delete
  private urlUnfollow : string = this.baseUrl + "unfollow/"
  private urlDeleteProfileImage : string = this.baseUrl + "deleteprofileimage/"

  // Unuse
  private urlGetProjects : string = this.baseUrl + "getprojects/"
  private urlGetFollowers : string = this.baseUrl + "getfollowers/"
  private urlGetFollowings : string = this.baseUrl + "getfollowings/"

  //User properties
  private loginStatus = new BehaviorSubject<boolean>(this.checkLoginStatus())
  private user = new BehaviorSubject<User>(null)
  private userID = new BehaviorSubject<number>(parseInt(localStorage.getItem('userID')))

  getUserByID (userID : number) : Observable<User>
  {
    return this.http.get<any>(this.urlGetUserByID + userID)
    .pipe(
      map(body => {
        console.log(body.message)
        return body.result
      }),
      catchError(error => {
        console.log(error)    
        return throwError(error)
      })
    )
  }

  getUserByName (username : string) : Observable<User>
  {
    return this.http.get<any>(this.urlGetUserByName + username)
    .pipe(
      map(body => {
        console.log(body.message)
        return body.result
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    )
  }

  getUserRange (ids : number[]) : Observable<User[]>
  {
    let params = new HttpParams()
    ids.forEach(x => params = params.append("id", x.toString()))

    return this.http.get<any>(this.urlGetUserRange, {params: params})
    .pipe(
      map(body => {
        console.log(body.message)
        return body.result
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    )
  }

  getUserList () : Observable<User[]>
  {
    return this.http.get<any>(this.urlGetUserList)
    .pipe(
      map(body => {
        console.log(body.message)
        return body.result
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    )
  }
  
  search (searchTerms: string[]) : Observable<User[]>
  {
    let params = new HttpParams()
    searchTerms.forEach(function (x) {
      params = params.append("term", x)
    })

    return this.http.get<any>(this.urlSearch, {params : params})
    .pipe(
      map(body => {
        if(!body) return []
        console.log(body.message)
        return body.result
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    )
  }

  follow (userID : number, followerID : number) : Observable<UserUser>
  {
    let body = new FormData()
    body.append('userID', userID.toString())
    body.append('followerID', followerID.toString())
    
    return this.http.post<any>(this.urlFollow, body)
    .pipe(
      map(body => {
        console.log(body.message)
        return body.result
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    )
  }

  register (username: string, password: string, emailaddress: string)
  {
    let body = new FormData()
    body.append('emailaddress', emailaddress)
    body.append('username', username)
    body.append('password', password)

    return this.http.post<any>(this.urlRegister, body)
    .pipe(
      map(body => {
        console.log(body.message)
        return body.result
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    )
  }

  login (username: string, password: string)
  {
    let body = new FormData()
    body.append('username', username)
    body.append('password', password)

    return this.http.post<any>(this.urlLogin, body)
    .pipe(
      map(body => {
        if(body && body.token)
        {
          this.loginStatus.next(true)
          this.user.next(body.result)
          this.userID = new BehaviorSubject<number>(parseInt(body.result.id))
          localStorage.setItem('loginStatus', '1')
          localStorage.setItem('jwt', body.token)
          localStorage.setItem('userID', body.result.id)
          localStorage.setItem('expiration', body.expiration)
        }
        return body
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
      
    )
  }

  uploadProfileImage(file: any, userID: number) : Observable<BlobFile>{
    let body = new FormData()
    body.append('file', file)
    body.append('userID', userID.toString())

    return this.http.post<any>(this.urlUploadProfileImage, body).pipe(
      map(body => {
        console.log(body.message)
        return body.result
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    );
  }

  updateUser (bio : string, userID : number) : Observable<User>
  {
    let body = new FormData()
    body.append('bio', bio)

    return this.http.put<any>(this.urlUpdateUser + userID, body)
    .pipe(
      map(body => {
        console.log(body.message)
        return body.result
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    )
  }

  unfollow (userID : number, followerID : number) : Observable<UserUser>
  {
    return this.http.delete<any>(this.urlUnfollow + userID + '/' + followerID)
    .pipe(
      map(body => {
        console.log(body.message)
        return body.result
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    )
  }

  deleteProfileImage(blobFileID : number) : Observable<BlobFile>{
    return this.http.delete<any>(this.urlDeleteProfileImage + blobFileID).pipe(
      map(body => {
        console.log(body.message)
        return body.result
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    );
  }

  checkLoginStatus(): boolean {
    // Get Login Cookie
    var loginCookie = localStorage.getItem('loginStatus');

    // Check Login Cookie
    // 0 = Not Logged In
    // 1 = Logged In 
    if(loginCookie == "1")
    {
      // Return False If Null
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

      // Return False Since Token Expire
      this.user = new BehaviorSubject<User>(null)
      return false;
    }
    this.user = new BehaviorSubject<User>(null)
    return false;
  }

  logout()
  {
    // Set Login Status to false
    this.loginStatus.next(false)

    // Remove item from localStorage
    localStorage.setItem('loginStatus', '0')
    localStorage.removeItem('jwt')
    localStorage.removeItem('expiration')
    localStorage.removeItem('userID')

    // Navigate back to the login page
    this.router.navigate(['/login'])
  }

  get isLoggedIn()
  {
    return this.loginStatus.asObservable()
  }

  get currentUser()
  {
    if(this.userID.value != null && this.user.value == null && this.loginStatus.value == true){
      let promise = new Promise<any>((resolve, reject) => {
        this.getUserByID(this.userID.value)
        .toPromise()
        .then(
          body =>{
            this.user.next(body)
            resolve(this.user.asObservable())
          }
        )
      })
      return promise
    }
    else{
      let promise = new Promise<any>((resolve, reject) =>{
        resolve(this.user.asObservable())
      })
      return promise
    } 
  }

  get currentUserID()
  {
    return this.userID.asObservable()
  }

  // Error
  getProjectList (userID : number) : Observable<ProjectUser[]>
  {
    return this.http.get<any>(this.urlGetProjects + userID)
    .pipe(
      map(body => {
        console.log(body)
        if(body == null)
          return []
        console.log(body.message)
        return body.result
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    )
  }

  getFollower (userID : number) : Observable<UserUser[]>
  {
    return this.http.get<any>(this.urlGetFollowers + userID)
    .pipe(
      map(body => {
        if(body == null)
          return []
        console.log(body.message)
        return body.result
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    )
  }

  getFollowing (followerID : number) : Observable<UserUser[]>
  {
    return this.http.get<any>(this.urlGetFollowings + followerID)
    .pipe(
      map(body => {
        if(body == null)
          return []
        console.log(body.message)
        return body.result
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    )
  }
}
