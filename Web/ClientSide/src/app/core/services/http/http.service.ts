import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {ErrorService} from '@appRoot/core/services/error/error.service';
import {AuthEndPoints, ApiMethod} from '@appRoot/core/services/conts';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class HttpService {

  methods: ApiMethod;

  constructor(
    private http: HttpClient,
    private _error: ErrorService
  ) { }

  /**
   * this function is used to make api calls, you will only have to call this function and will have
   * method name, api url and the data if you wanna do put or post call
   */
  requestCall(api: AuthEndPoints, method: ApiMethod, data?: any){
    let response;
    switch(method){
      case ApiMethod.Get:
        response = this.http.get('${enivronment.apiUrl}${api}')
          .pipe(catchError((err) => this.handleError(err,this)));
        break;
      return response;
    }
  }

  handleError(error: HttpErrorResponse, self){
    if(error.error instanceof ErrorEvent){
      console.error('An error occured:', error.error.message);
    }
    else{
      this._error.whichError(error.status, error.message)
      return throwError({error: error.message, status: error.status});
      }
    }
  }
}
