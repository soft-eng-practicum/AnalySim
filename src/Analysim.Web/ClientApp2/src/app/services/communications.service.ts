import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { Router } from '@angular/router';
import { NotificationService } from './notification.service';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class CommunicationsService {

  constructor(private http : HttpClient, private router: Router, private notfi : NotificationService) { }

  // Url to access Web API
  private baseUrl : string = '/api/communication/'

  // Post
  private urlSendEmail : string = this.baseUrl +  "sendEmail";

  sendEmail (emailAddress : string, username : string, subject : string, bodyText : string, bodyHTML : string) : Observable<string>
  {

    let body = new FormData()
    body.append('emailAddress', emailAddress)
    body.append('username', username)
    body.append('subject', subject)
    body.append('bodyText', bodyText)
    body.append('bodyHTML', bodyHTML)
    
    //cc.forEach(x => emailBody.CcAddresses.push({ Name: x.name, Address: x.address }));
    //bcc.forEach(x => emailBody.BccAddresses.push({ Name: x.name, Address: x.address }));

    return this.http.post<any>(this.urlSendEmail, body)
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
}