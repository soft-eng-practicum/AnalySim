import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface DashboardOverview {
  totalProjects: number;
  totalDataFiles: number;
  totalNotebooks: number;
  storageUsedBytes: number;
  storageQuotaBytes: number;
}

export interface DashboardStorageUsage {
  usedBytes: number;
  quotaBytes: number;
  usedGigabytes: number;
  quotaGigabytes: number;
  percentUsed: number;
}

export interface DashboardResearchImpact {
  recommends: number;
  followers: number;
  members: number;
  forks: number;
  recommendsPlaceholder: boolean;
}

export interface DashboardProjectListItem {
  projectID: number;
  name: string;
  visibility: string;
  description: string;
  route: string;
  dateCreated: Date;
  lastUpdated: Date;
  currentUserRole: string;
  ownerUserName: string;
  dataFileCount: number;
  notebookCount: number;
  followersCount: number;
  membersCount: number;
  forksCount: number;
  recommendsCount: number;
  popularityScore: number;
  tags: string[];
}

export interface DashboardPagedResult<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalResults: number;
  totalPages: number;
}

export interface DashboardActivityMonth {
  month: string;
  year: number;
  created: number;
  updated: number;
  total: number;
}

export interface DashboardActivity {
  months: DashboardActivityMonth[];
  growthRate: number;
}

export interface DashboardProjectQuery {
  query?: string;
  visibility?: string;
  tag?: string;
  sortBy?: string;
  sortDirection?: string;
  page?: number;
  pageSize?: number;
}

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = '/api/dashboard/';

  constructor(private http: HttpClient) { }

  getOverview(): Observable<DashboardOverview> {
    return this.getAuthorized<DashboardOverview>('overview');
  }

  getStorageUsage(): Observable<DashboardStorageUsage> {
    return this.getAuthorized<DashboardStorageUsage>('storage-usage');
  }

  getResearchImpact(): Observable<DashboardResearchImpact> {
    return this.getAuthorized<DashboardResearchImpact>('research-impact');
  }

  getPopularProjects(limit: number = 4, scope: string = 'public'): Observable<DashboardProjectListItem[]> {
    const params = new HttpParams()
      .set('limit', limit.toString())
      .set('scope', scope);

    return this.getAuthorized<DashboardProjectListItem[]>('popular-projects', params);
  }

  getActivity(months: number = 6): Observable<DashboardActivity> {
    const params = new HttpParams().set('months', months.toString());
    return this.getAuthorized<DashboardActivity>('activity', params);
  }

  getProjects(filters: DashboardProjectQuery): Observable<DashboardPagedResult<DashboardProjectListItem>> {
    return this.getAuthorized<DashboardPagedResult<DashboardProjectListItem>>('projects', this.buildProjectParams(filters));
  }

  getPublicProjects(filters: DashboardProjectQuery): Observable<DashboardPagedResult<DashboardProjectListItem>> {
    return this.get<DashboardPagedResult<DashboardProjectListItem>>('public-projects', this.buildProjectParams(filters));
  }

  inviteCollaborator(projectID: number, identifier: string, userRole: string = 'member'): Observable<any> {
    const body = new FormData();
    body.append('projectID', projectID.toString());
    body.append('identifier', identifier);
    body.append('userRole', userRole);

    return this.http.post<any>(this.baseUrl + 'collaborators', body, { headers: this.authHeaders() }).pipe(
      map(response => response.result),
      catchError(error => throwError(error))
    );
  }

  private getAuthorized<T>(resource: string, params?: HttpParams): Observable<T> {
    return this.http.get<any>(this.baseUrl + resource, { headers: this.authHeaders(), params }).pipe(
      map(response => response.result as T),
      catchError(error => throwError(error))
    );
  }

  private get<T>(resource: string, params?: HttpParams): Observable<T> {
    return this.http.get<any>(this.baseUrl + resource, { params }).pipe(
      map(response => response.result as T),
      catchError(error => throwError(error))
    );
  }

  private buildProjectParams(filters: DashboardProjectQuery): HttpParams {
    let params = new HttpParams();
    const keys = Object.keys(filters) as Array<keyof DashboardProjectQuery>;

    keys.forEach(key => {
      const value = filters[key];
      if (value !== undefined && value !== null && value !== '') {
        params = params.set(key, value.toString());
      }
    });

    return params;
  }

  private authHeaders(): HttpHeaders {
    return new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('jwt')}`);
  }
}
