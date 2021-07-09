import { HttpClient, HttpErrorResponse, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ErrorService } from '@core/services/error/error.service';
import { environment } from '@env';

const BASE_URL = environment.serverUrl;

@Injectable({
  providedIn: 'root'
})
export class ApiService {

  constructor(
    private httpClient: HttpClient,
    private errorService: ErrorService
  ) { }

  private options = { headers: new HttpHeaders().set('Content-Type', 'application/json') };

  public get(path: string, params?: HttpParams): Observable<any> {
    return this.httpClient
      .get(BASE_URL + path, {params})
      .pipe(catchError(this.handleError));
  }

  public post(path: string, data?: any): Observable<any> {
    return this.httpClient
      .post(BASE_URL + path, data, this.options)
      .pipe(catchError(this.handleError));
  }

  public put(path: string, data?: any): Observable<any> {
    return this.httpClient
      .put(BASE_URL + path, data, this.options)
      .pipe(catchError(this.handleError));
  }

  public delete(path: string): Observable<any> {
    return this.httpClient
      .delete(BASE_URL + path)
      .pipe(catchError(this.handleError));
  }

  handleError(error: HttpErrorResponse){
    if(error.error instanceof ErrorEvent){
      console.error('An error occured:', error.error.message);
    }
    else{
      this.errorService.whichError(error.status, error.message)
      return throwError({error: error.message, status: error.status});
    }
  }
}
