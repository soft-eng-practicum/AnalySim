import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { Router } from '@angular/router';
import jwt_decode from "jwt-decode";
import { User } from '../interfaces/user';
import { UserUser } from '../interfaces/user-user';
import { NotificationService } from './notification.service';
import { ProjectUser } from '../interfaces/project-user';
import { BlobFile } from '../interfaces/blob-file';

@Injectable({
  providedIn: 'root'
})
export class AccountService {

  constructor(private http: HttpClient, private router: Router, private notfi: NotificationService) { }

  // ─── URLs ─────────────────────────────────────────────────────────────────
  private baseUrl: string = '/api/account/'

  private urlGetUserByID: string       = this.baseUrl + "getuserbyid/"
  private urlGetUserByName: string     = this.baseUrl + "getuserbyname/"
  private urlGetUserRange: string      = this.baseUrl + "getuserrange?"
  private urlGetUserList: string       = this.baseUrl + "getuserlist"
  private urlGetProfileImage: string   = this.baseUrl + "getprofileimage?"
  private urlSearch: string            = this.baseUrl + "search?"
  private urlVerify: string            = this.baseUrl + "verify"
  private urlIsAdmin: string           = this.baseUrl + "isAdmin/"

  private urlFollow: string            = this.baseUrl + "follow"
  private urlRegister: string          = this.baseUrl + "register"
  private urlLogin: string             = this.baseUrl + "login"
  private urlUploadProfileImage: string = this.baseUrl + "uploadprofileimage"

  private urlUpdateUser: string        = this.baseUrl + "updateuser/"
  private urlForgotPassEmail: string   = this.baseUrl + "forgotPassword/"
  private urlResetPassword: string     = this.baseUrl + "resetPassword?"
  private urlChangePassword: string    = this.baseUrl + "changePassword"
  private urlReSendVerification: string = this.baseUrl + "sendConfirmationEmail"

  private urlUnfollow: string          = this.baseUrl + "unfollow/"
  private urlDeleteProfileImage: string = this.baseUrl + "deleteprofileimage/"
  private urlDeleteUser: string        = this.baseUrl + "deleteUser/"

  private urlGetProjects: string       = this.baseUrl + "getprojects/"
  private urlGetFollowers: string      = this.baseUrl + "getfollowers/"
  private urlGetFollowings: string     = this.baseUrl + "getfollowings/"

  // ─── State ────────────────────────────────────────────────────────────────

  isLoggedIn = new BehaviorSubject<boolean>(this.checkLoginStatus());

  private user   = new BehaviorSubject<User>(null);
  private userID = new BehaviorSubject<number>(parseInt(localStorage.getItem('userID')));

  // ─── GET ──────────────────────────────────────────────────────────────────

  getUserByID(userID: number): Observable<User> {
    return this.http.get<any>(this.urlGetUserByID + userID).pipe(
      map(body => { console.log(body.message); return body.result; }),
      catchError(error => { console.log(error); return throwError(error); })
    );
  }

  getUserByName(username: string): Observable<User> {
    return this.http.get<any>(this.urlGetUserByName + username).pipe(
      map(body => { console.log(body.message); return body.result; }),
      catchError(error => { console.log(error); return throwError(error); })
    );
  }

  getIsAdmin(username: string): Observable<boolean> {
    return this.http.get<any>(this.urlIsAdmin + username).pipe(
      map(body => body.result),
      catchError(error => { console.log(error); return throwError(error); })
    );
  }

  getUserRange(ids: number[]): Observable<User[]> {
    let params = new HttpParams();
    ids.forEach(x => params = params.append("id", x.toString()));

    return this.http.get<any>(this.urlGetUserRange, { params }).pipe(
      map(body => { console.log(body.message); return body.result; }),
      catchError(error => { console.log(error); return throwError(error); })
    );
  }

  getUserList(): Observable<User[]> {
    return this.http.get<any>(this.urlGetUserList).pipe(
      map(body => { console.log(body.message); return body.result; }),
      catchError(error => { console.log(error); return throwError(error); })
    );
  }

  getProfileImage(userID: number): Observable<BlobFile> {
    let params = new HttpParams();
    params = params.append("id", userID.toString());

    return this.http.get<any>(this.urlGetProfileImage, { params }).pipe(
      map(body => body.result ?? null),
      catchError(error => { console.log(error); return throwError(error); })
    );
  }

  search(searchTerms: string[]): Observable<User[]> {
    let params = new HttpParams();
    searchTerms.forEach(x => params = params.append("term", x));

    return this.http.get<any>(this.urlSearch, { params }).pipe(
      map(body => { if (!body) return []; console.log(body.message); return body.result; }),
      catchError(error => { console.log(error); return throwError(error); })
    );
  }

  // ─── POST ─────────────────────────────────────────────────────────────────

  follow(userID: number, followerID: number): Observable<UserUser> {
    let body = new FormData();
    body.append('userID', userID.toString());
    body.append('followerID', followerID.toString());

    return this.http.post<any>(this.urlFollow, body, { headers: this.authHeaders() }).pipe(
      map(body => { console.log(body.message); return body.result; }),
      catchError(error => { console.log(error); return throwError(error); })
    );
  }

  register(username: string, password: string, emailaddress: string, registrationSurvey: string) {
    let body = new FormData();
    body.append('emailaddress', emailaddress);
    body.append('username', username);
    body.append('password', password);
    body.append('registrationSurvey', registrationSurvey);

    return this.http.post<any>(this.urlRegister, body).pipe(
      map(body => { console.log(body.message); return body.result; }),
      catchError(error => { console.log(error); return throwError(error); })
    );
  }

  login(username: string, password: string) {
    let body = new FormData();
    body.append('username', username);
    body.append('password', password);

    return this.http.post<any>(this.urlLogin, body).pipe(
      map(body => {
        if (body && body.token) {
          localStorage.setItem('loginStatus', '1');
          localStorage.setItem('jwt', body.token);
          localStorage.setItem('userID', body.result.id);
          localStorage.setItem('expiration', body.expiration);

          this.isLoggedIn.next(true);
          this.user.next(body.result);
          this.userID = new BehaviorSubject<number>(parseInt(body.result.id));

          this.notfi.fetchNotifications();
          this.notfi.startSignalRConnection(body.token);
        }
        return body;
      }),
      catchError(error => { console.log(error); return throwError(error); })
    );
  }

  resetPassword(userID: string, token: string) {
    let body = new FormData();
    body.append('user', userID);
    body.append('code', token);

    return this.http.post<any>(this.urlResetPassword, body).pipe(
      map(body => body),
      catchError(error => { console.log(error); return throwError(error); })
    );
  }

  resendVerificationLink(email: string) {
    let params = new HttpParams();
    params = params.append("EmailAddress", email);

    return this.http.get<any>(this.urlReSendVerification, { params }).pipe(
      map(body => body),
      catchError(error => { console.log(error); return throwError(error); })
    );
  }

  sendPasswordResetToken(email: string) {
    let body = new FormData();
    body.append('EmailAddress', email);
    console.log("sendPasswordResetToken is called");

    return this.http.post<any>(this.urlForgotPassEmail, body).pipe(
      map(body => body),
      catchError(error => { console.log(error); return throwError(error); })
    );
  }

  changePassword(userID: string, password: string, confirmPassword: string, token: string) {
    let body = new FormData();
    body.append('userID', userID);
    body.append('NewPassword', password);
    body.append('ConfirmPassword', confirmPassword);
    body.append('passwordToken', token);

    return this.http.post<any>(this.urlChangePassword, body).pipe(
      map(body => body),
      catchError(error => { console.log(error); return throwError(error); })
    );
  }

  uploadProfileImage(file: any, userID: number): Observable<BlobFile> {
    let body = new FormData();
    body.append('file', file);
    body.append('userID', userID.toString());

    return this.http.post<any>(this.urlUploadProfileImage, body, { headers: this.authHeaders() }).pipe(
      map(body => { console.log(body.message); return body.result; }),
      catchError(error => { console.log(error); return throwError(error); })
    );
  }

  // ─── PUT ──────────────────────────────────────────────────────────────────

  updateUser(bio: string, userID: number): Observable<User> {
    let body = new FormData();
    body.append('bio', bio);

    return this.http.put<any>(this.urlUpdateUser + userID, body, { headers: this.authHeaders() }).pipe(
      map(body => { console.log(body.message); return body.result; }),
      catchError(error => { console.log(error); return throwError(error); })
    );
  }

  // ─── DELETE ───────────────────────────────────────────────────────────────

  unfollow(userID: number, followerID: number): Observable<UserUser> {
    return this.http.delete<any>(this.urlUnfollow + userID + '/' + followerID, { headers: this.authHeaders() }).pipe(
      map(body => { console.log(body.message); return body.result; }),
      catchError(error => { console.log(error); return throwError(error); })
    );
  }

  deleteProfileImage(blobFileID: number): Observable<BlobFile> {
    return this.http.delete<any>(this.urlDeleteProfileImage + blobFileID, { headers: this.authHeaders() }).pipe(
      map(body => { console.log(body.message); return body.result; }),
      catchError(error => { console.log(error); return throwError(error); })
    );
  }

  deleteUser(userID: number): Observable<any> {
    return this.http.delete<any>(this.urlDeleteUser + userID, { headers: this.authHeaders() }).pipe(
      map(body => { console.log(body.message); return body.message; }),
      catchError(error => { console.log(error); return throwError(error); })
    );
  }

  // ─── Auth Helpers ─────────────────────────────────────────────────────────

  checkLoginStatus(): boolean {
    const loginCookie = localStorage.getItem('loginStatus');

    if (loginCookie !== "1") {
      this.user = new BehaviorSubject<User>(null);
      return false;
    }

    const token = localStorage.getItem('jwt');
    if (!token) return false;

    const decoded: any = jwt_decode(token);
    if (decoded.exp === undefined) return false;

    const tokenExpDate = new Date(0).setUTCSeconds(decoded.exp);
    if (tokenExpDate.valueOf() > new Date().valueOf()) return true;

    this.user = new BehaviorSubject<User>(null);
    return false;
  }

  logout() {
    this.notfi.stopConnection();

    this.isLoggedIn.next(false);

    localStorage.setItem('loginStatus', '0');
    localStorage.removeItem('jwt');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userID');

    this.router.navigate(['/login']);
  }

  private authHeaders(): HttpHeaders {
    return new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('jwt')}`);
  }

  // ─── Getters ──────────────────────────────────────────────────────────────

  get currentUser() {
    if (this.userID.value != null && this.user.value == null && this.isLoggedIn.value == true) {
      return new Promise<any>((resolve) => {
        this.getUserByID(this.userID.value).toPromise().then(body => {
          this.user.next(body);
          resolve(this.user.asObservable());
        });
      });
    }
    return Promise.resolve(this.user.asObservable());
  }

  setCurrentUser(modifiedUser: User): void {
    this.user.next(modifiedUser);
  }

  get currentUserID() {
    return this.userID.asObservable();
  }

  // ─── Unused / Legacy ─────────────────────────────────────────────────────

  getProjectList(userID: number): Observable<ProjectUser[]> {
    return this.http.get<any>(this.urlGetProjects + userID).pipe(
      map(body => { if (!body) return []; console.log(body.message); return body.result; }),
      catchError(error => { console.log(error); return throwError(error); })
    );
  }

  getFollower(userID: number): Observable<UserUser[]> {
    return this.http.get<any>(this.urlGetFollowers + userID).pipe(
      map(body => { if (!body) return []; console.log(body.message); return body.result; }),
      catchError(error => { console.log(error); return throwError(error); })
    );
  }

  getFollowing(followerID: number): Observable<UserUser[]> {
    return this.http.get<any>(this.urlGetFollowings + followerID).pipe(
      map(body => { if (!body) return []; console.log(body.message); return body.result; }),
      catchError(error => { console.log(error); return throwError(error); })
    );
  }

  testApiCall(): Observable<string> {
    return this.http.get<any>(this.urlVerify).pipe(
      map(body => { if (!body) return []; console.log(body.message); return body.result; }),
      catchError(error => { console.log(error); return throwError(error); })
    );
  }
}
