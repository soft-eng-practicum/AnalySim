import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import { User } from '../interfaces/user';
import { UserUser } from '../interfaces/user-user';
import { NotificationService } from './notification.service';
import { ProjectUser } from '../interfaces/project-user';
import { BlobFile } from '../interfaces/blob-file';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private http: HttpClient, private router: Router, private notfi: NotificationService) {
    this.clearLegacyTokenStorage();
  }

  // Url to access Web API
  private baseUrl: string = '/api/account/'

  // Get
  private urlGetUserByID: string = this.baseUrl + "getuserbyid/"
  private urlGetUserByName: string = this.baseUrl + "getuserbyname/"
  private urlGetUserRange: string = this.baseUrl + "getuserrange?"
  private urlGetUserList: string = this.baseUrl + "getuserlist"
  private urlGetProfileImage: string = this.baseUrl + "getprofileimage?"
  private urlSearch: string = this.baseUrl + "search?"
  private urlVerify: string = this.baseUrl + "verify"
  private urlIsAdmin: string = this.baseUrl + "isAdmin/"

  // Post
  private urlFollow: string = this.baseUrl + "follow"
  private urlRegister: string = this.baseUrl + "register"
  private urlLogin: string = this.baseUrl + "login"
  private urlRefresh: string = this.baseUrl + "refresh"
  private urlLogout: string = this.baseUrl + "logout"
  private urlMe: string = this.baseUrl + "me"
  private urlUploadProfileImage: string = this.baseUrl + "uploadprofileimage"

  // Post
  private urlUpdateUser: string = this.baseUrl + "updateuser/"
  private urlForgotPassEmail: string = this.baseUrl + "forgotPassword/"
  private urlResetPassword: string = this.baseUrl + "resetPassword?"
  private urlChangePassword: string = this.baseUrl + "changePassword"
  private urlChangeCurrentPassword: string = this.baseUrl + "changeCurrentPassword"
  private urlReSendVerification: string = this.baseUrl + "sendConfirmationEmail"
  private urlUpdateNotificationPreferences: string = this.baseUrl + "updatenotificationpreferences/"
  private urlSetAccountStatus: string = this.baseUrl + "setAccountStatus/"

  // Delete
  private urlUnfollow: string = this.baseUrl + "unfollow/"
  private urlDeleteProfileImage: string = this.baseUrl + "deleteprofileimage/"
  private urlDeleteUser: string = this.baseUrl + "deleteUser/"

  // Unuse
  private urlGetProjects: string = this.baseUrl + "getprojects/"
  private urlGetFollowers: string = this.baseUrl + "getfollowers/"
  private urlGetFollowings: string = this.baseUrl + "getfollowings/"

  //User properties
  private loginStatus = new BehaviorSubject<boolean>(this.checkLoginStatus())
  private user = new BehaviorSubject<User>(null)
  private userID = new BehaviorSubject<number>(this.getStoredUserID())

  getUserByID(userID: number): Observable<User> {
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

  getUserByName(username: string): Observable<User> {
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

  getIsAdmin(username: string): Observable<boolean> {
    return this.http.get<any>(this.urlIsAdmin + username)
      .pipe(
        map(body => {
          return body.result
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })
      )
  }

  getUserRange(ids: number[]): Observable<User[]> {
    let params = new HttpParams()
    ids.forEach(x => params = params.append("id", x.toString()))

    return this.http.get<any>(this.urlGetUserRange, { params: params })
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

  getUserList(): Observable<User[]> {
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

  getProfileImage(userID: number): Observable<BlobFile> {
    let params = new HttpParams()
    params = params.append("id", userID.toString())

    return this.http.get<any>(this.urlGetProfileImage, { params: params })
      .pipe(
        map(body => {
          // console.log(body.message)
          if (body.result) return body.result;
          return null;
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })
      )
  }

  search(searchTerms: string[]): Observable<User[]> {
    let params = new HttpParams()
    searchTerms.forEach(function (x) {
      params = params.append("term", x)
    })

    return this.http.get<any>(this.urlSearch, { params: params })
      .pipe(
        map(body => {
          if (!body) return []
          console.log(body.message)
          return body.result
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })
      )
  }

  follow(userID: number, followerID: number): Observable<UserUser> {
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

  register(username: string, password: string, emailaddress: string, registrationSurvey: string) {
    let body = new FormData()
    body.append('emailaddress', emailaddress)
    body.append('username', username)
    body.append('password', password)
    body.append('registrationSurvey', registrationSurvey)

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

  login(username: string, password: string) {
    let body = new FormData()
    body.append('username', username)
    body.append('password', password)

    return this.http.post<any>(this.urlLogin, body)
      .pipe(
        map(body => {
          if (body && body.result) {
            this.setAuthenticatedUser(body.result)
          }
          return body
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })

      )
  }

  resetPassword(userID: string, token: string) {
    let body = new FormData()
    body.append('user', userID)
    body.append('code', token)

    return this.http.post<any>(this.urlResetPassword, body)
      .pipe(
        map(body => {
          return body
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })

      )
  }

  resendVerificationLink(email: string) {
    let params = new HttpParams();
    params = params.append("EmailAddress", email);

    return this.http.get<any>(this.urlReSendVerification, { params: params })
      .pipe(
        map(body => {
          return body
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })

      )
  }

  sendPasswordResetToken(email: string) {
    let body = new FormData()
    body.append('EmailAddress', email)
    console.log("sendPasswordResetToken is called");
    return this.http.post<any>(this.urlForgotPassEmail, body)
      .pipe(
        map(body => {
          return body
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })

      )
  }


  changePassword(userID: string, password: string, confirmPassword: string, token: string) {
    let body = new FormData()
    body.append('userID', userID)
    body.append('NewPassword', password)
    body.append('ConfirmPassword', confirmPassword)
    body.append('passwordToken', token)

    return this.http.post<any>(this.urlChangePassword, body)
      .pipe(
        map(body => {
          return body
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })

      )
  }

  changeCurrentPassword(currentPassword: string, newPassword: string, confirmPassword: string): Observable<any> {
    const body = {
      currentPassword,
      newPassword,
      confirmPassword
    }

    return this.http.post<any>(this.urlChangeCurrentPassword, body)
      .pipe(
        map(body => {
          return body
        }),
        catchError(error => {
          console.log(error)
          return throwError(error)
        })
      )
  }

  uploadProfileImage(file: any, userID: number): Observable<BlobFile> {
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

  updateUser(bio: string, userID: number): Observable<User> {
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

  updateNotificationPreferences(receiveCommentReplyEmails: boolean, userID: number): Observable<User> {
    const body = {
      receiveCommentReplyEmails: receiveCommentReplyEmails
    };
    
    return this.http.put<any>(this.urlUpdateNotificationPreferences + userID, body)
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

  unfollow(userID: number, followerID: number): Observable<UserUser> {
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

  deleteProfileImage(blobFileID: number): Observable<BlobFile> {
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

  deleteUser(userID: number): Observable<any> {
    return this.http.delete<any>(this.urlDeleteUser + userID).pipe(
      map(body => {
        console.log(body.message)
        return body.message
      }),
      catchError(error => {
        console.log(error)
        return throwError(error)
      })
    );
  }

  setAccountStatus(userID: number, disabled: boolean): Observable<User> {
    return this.http.put<any>(this.urlSetAccountStatus + userID, { disabled }).pipe(
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
    return this.getCookie('analysim.logged_in') === '1';
  }

  logout() {
    this.http.post<any>(this.urlLogout, {})
      .pipe(catchError(() => of(null)))
      .subscribe(() => {
        this.clearAuthenticationState()
        this.router.navigate(['/login'])
      })
  }

  refreshSession(): Observable<any> {
    return this.http.post<any>(this.urlRefresh, {}).pipe(
      map(body => {
        if (body && body.result) {
          this.setAuthenticatedUser(body.result)
        }
        return body
      }),
      catchError(error => {
        this.clearAuthenticationState()
        return throwError(error)
      })
    )
  }

  ensureAuthenticated(): Observable<boolean> {
    if (this.loginStatus.value) {
      return of(true)
    }

    return this.refreshSession().pipe(
      map(() => true),
      catchError(() => of(false))
    )
  }

  clearAuthenticationState(): void {
    this.loginStatus.next(false)
    this.user.next(null)
    this.userID.next(null)
    sessionStorage.removeItem('userID')
    document.cookie = 'analysim.logged_in=; Max-Age=0; path=/; SameSite=Lax; Secure'
    document.cookie = 'XSRF-TOKEN=; Max-Age=0; path=/; SameSite=Lax; Secure'
    this.clearLegacyTokenStorage()
  }

  get isLoggedIn() {
    return this.loginStatus.asObservable()
  }

  get currentUser() {
    if (this.user.value == null && this.loginStatus.value == true) {
      let promise = new Promise<any>((resolve, reject) => {
        this.getCurrentSessionUser()
          .toPromise()
          .then(
            body => {
              this.user.next(body)
              resolve(this.user.asObservable())
            }
          )
      })
      return promise
    }
    else {
      let promise = new Promise<any>((resolve, reject) => {
        resolve(this.user.asObservable())
      })
      return promise
    }
  }

  setCurrentUser(modifiedUser: User): void {
    this.user.next(modifiedUser);
  }

  get currentUserID() {
    return this.userID.asObservable()
  }

  private getCurrentSessionUser(): Observable<User> {
    return this.http.get<any>(this.urlMe).pipe(
      map(body => {
        if (body && body.result) {
          this.setAuthenticatedUser(body.result)
          return body.result
        }

        return null
      }),
      catchError(error => {
        this.clearAuthenticationState()
        return throwError(error)
      })
    )
  }

  private setAuthenticatedUser(user: User): void {
    this.loginStatus.next(true)
    this.user.next(user)
    this.userID.next(user ? user.id : null)
    if (user) {
      sessionStorage.setItem('userID', user.id.toString())
    }
  }

  private getStoredUserID(): number {
    const storedUserID = sessionStorage.getItem('userID')
    return storedUserID ? parseInt(storedUserID) : null
  }

  private getCookie(name: string): string {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith(name + '='))

    return cookie ? decodeURIComponent(cookie.split('=')[1]) : ''
  }

  private clearLegacyTokenStorage(): void {
    localStorage.removeItem('jwt')
    localStorage.removeItem('expiration')
    localStorage.removeItem('loginStatus')
    localStorage.removeItem('userID')
  }

  // Error
  getProjectList(userID: number): Observable<ProjectUser[]> {
    return this.http.get<any>(this.urlGetProjects + userID)
      .pipe(
        map(body => {
          console.log(body)
          if (body == null)
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

  getFollower(userID: number): Observable<UserUser[]> {
    return this.http.get<any>(this.urlGetFollowers + userID)
      .pipe(
        map(body => {
          if (body == null)
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

  getFollowing(followerID: number): Observable<UserUser[]> {
    return this.http.get<any>(this.urlGetFollowings + followerID)
      .pipe(
        map(body => {
          if (body == null)
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

  testApiCall(): Observable<string> {
    return this.http.get<any>(this.urlVerify)
      .pipe(
        map(body => {
          if (body == null)
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
