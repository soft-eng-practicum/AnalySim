import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, catchError, map, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ConfigService {

  private getNumofRegistrationCodes : string = "/api/configuration/GetLengthOfRegistrationCodes"

  constructor(private http: HttpClient, private router: Router) { }

  checkRegistrationCodesLength(): Observable<Number> {
    return this.http.get<any>(this.getNumofRegistrationCodes)
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
