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
  private baseUrl : string = '/api/communications/'

  // Post
  private urlSendEmail : string = this.baseUrl +  "sendEmail";

  sendEmail (to: any, from: any, cc: any[], bcc: any[], subject: string, bodyText: string, bodyHtml: string) : Observable<string>
  {
    let emailBody = {
        From: {
          Name: from.name,
          Address: from.address,
        },
        To: {
          Name: to.name,
          Address: to.address,
        },
        Subject: subject,
        BodyHtml: bodyHtml,
        BodyText: bodyText,
        CcAddresses: [],
        BccAddresses: []
      };

      cc.forEach(x => emailBody.CcAddresses.push({ Name: x.name, Address: x.address }));
      bcc.forEach(x => emailBody.BccAddresses.push({ Name: x.name, Address: x.address }));

      return this.http.post<any>(this.urlSendEmail, emailBody)
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