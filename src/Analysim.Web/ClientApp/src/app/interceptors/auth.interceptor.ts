import { Injectable, Injector } from '@angular/core';
import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest,
} from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { AccountService } from '../services/account.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshResult = new BehaviorSubject<boolean | null>(null);

  constructor(private injector: Injector) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const authRequest = this.prepareRequest(request);

    return next.handle(authRequest).pipe(
      catchError((error: HttpErrorResponse) => {
        if (!this.shouldRefresh(authRequest, error)) {
          return throwError(error);
        }

        return this.refreshAndRetry(authRequest, next);
      })
    );
  }

  private prepareRequest(request: HttpRequest<any>): HttpRequest<any> {
    let headers = request.headers;
    const authorization = headers.get('Authorization');

    if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
      headers = headers.delete('Authorization');
    }

    return request.clone({
      headers,
      withCredentials: true,
    });
  }

  private shouldRefresh(request: HttpRequest<any>, error: HttpErrorResponse): boolean {
    if (error.status !== 401 || request.headers.has('X-Auth-Retry')) {
      return false;
    }

    const url = request.url.toLowerCase();
    return !url.includes('/api/account/login')
      && !url.includes('/api/account/refresh')
      && !url.includes('/api/account/logout');
  }

  private refreshAndRetry(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    const accountService = this.injector.get(AccountService);

    if (this.isRefreshing) {
      return this.refreshResult.pipe(
        filter(refreshed => refreshed !== null),
        take(1),
        switchMap(refreshed => {
          if (!refreshed) {
            return throwError(() => new Error('Authentication renewal failed.'));
          }

          const retryRequest = this.prepareRequest(
            request.clone({ headers: request.headers.set('X-Auth-Retry', '1') })
          );

          return next.handle(retryRequest);
        })
      );
    }

    this.isRefreshing = true;
    this.refreshResult.next(null);

    return accountService.refreshSession().pipe(
      switchMap(() => {
        this.isRefreshing = false;
        this.refreshResult.next(true);
        const retryRequest = this.prepareRequest(
          request.clone({ headers: request.headers.set('X-Auth-Retry', '1') })
        );

        return next.handle(retryRequest);
      }),
      catchError(error => {
        this.isRefreshing = false;
        this.refreshResult.next(false);
        accountService.clearAuthenticationState();
        return throwError(error);
      })
    );
  }
}
