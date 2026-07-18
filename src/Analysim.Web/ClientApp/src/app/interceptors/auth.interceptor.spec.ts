import { HTTP_INTERCEPTORS, HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';
import { AuthInterceptor } from './auth.interceptor';
import { AccountService } from '../services/account.service';

describe('AuthInterceptor', () => {
  let http: HttpClient;
  let httpMock: HttpTestingController;
  let accountService: jasmine.SpyObj<AccountService>;

  beforeEach(() => {
    accountService = jasmine.createSpyObj<AccountService>(
      'AccountService',
      ['refreshSession', 'clearAuthenticationState']
    );
    accountService.refreshSession.and.returnValue(of({ result: { id: 1 } }));

    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        { provide: AccountService, useValue: accountService },
        { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true },
      ],
    });

    http = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('sends credentials and strips stale bearer headers', () => {
    http.get('/api/projects', {
      headers: new HttpHeaders({ Authorization: 'Bearer stale-token' }),
    }).subscribe();

    const request = httpMock.expectOne('/api/projects');
    expect(request.request.withCredentials).toBeTrue();
    expect(request.request.headers.has('Authorization')).toBeFalse();

    request.flush({});
  });

  it('refreshes once on 401 and retries the original request', () => {
    http.get('/api/projects').subscribe();

    const firstRequest = httpMock.expectOne('/api/projects');
    firstRequest.flush({}, { status: 401, statusText: 'Unauthorized' });

    expect(accountService.refreshSession).toHaveBeenCalledTimes(1);

    const retryRequest = httpMock.expectOne('/api/projects');
    expect(retryRequest.request.headers.get('X-Auth-Retry')).toBe('1');
    retryRequest.flush({ result: [] });
  });
});
