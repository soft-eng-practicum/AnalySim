import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import {
  UserNotification,
  UserNotificationPage,
  UserNotificationPreference,
} from '../interfaces/user-notification';

@Injectable({
  providedIn: 'root',
})
export class UserNotificationService {
  private baseUrl = '/api/notifications';

  private notificationsSubject = new BehaviorSubject<UserNotification[]>([]);
  private unreadCountSubject = new BehaviorSubject<number>(0);

  notifications$ = this.notificationsSubject.asObservable();
  unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  loadNotifications(unreadOnly = false, page = 1, pageSize = 10): Observable<UserNotification[]> {
    let params = new HttpParams()
      .set('unreadOnly', String(unreadOnly))
      .set('page', String(page))
      .set('pageSize', String(pageSize));

    return this.http.get<UserNotificationPage>(this.baseUrl, { params }).pipe(
      map((body) => {
        const notifications = body.result || [];
        this.notificationsSubject.next(notifications);
        return notifications;
      }),
      catchError((error) => {
        console.log(error);
        return throwError(error);
      }),
    );
  }

  loadUnreadCount(): Observable<number> {
    return this.http.get<any>(`${this.baseUrl}/unread-count`).pipe(
      map((body) => {
        const count = body.result || 0;
        this.unreadCountSubject.next(count);
        return count;
      }),
      catchError((error) => {
        console.log(error);
        return throwError(error);
      }),
    );
  }

  markAsRead(notificationId: number): Observable<UserNotification> {
    return this.http.put<any>(`${this.baseUrl}/${notificationId}/read`, null).pipe(
      map((body) => {
        const updated = body.result as UserNotification;
        const notifications = this.notificationsSubject.value.map((notification) =>
          notification.notificationID === notificationId ? updated : notification,
        );

        this.notificationsSubject.next(notifications);
        this.unreadCountSubject.next(Math.max(0, this.unreadCountSubject.value - 1));

        return updated;
      }),
      catchError((error) => {
        console.log(error);
        return throwError(error);
      }),
    );
  }

  markAllAsRead(): Observable<number> {
    return this.http.put<any>(`${this.baseUrl}/read-all`, null).pipe(
      map((body) => {
        const updatedCount = body.result || 0;
        const notifications = this.notificationsSubject.value.map((notification) => ({
          ...notification,
          isRead: true,
        }));

        this.notificationsSubject.next(notifications);
        this.unreadCountSubject.next(0);

        return updatedCount;
      }),
      catchError((error) => {
        console.log(error);
        return throwError(error);
      }),
    );
  }

  getPreferences(): Observable<UserNotificationPreference[]> {
    return this.http.get<any>(`${this.baseUrl}/preferences`).pipe(
      map((body) => body.result || []),
      catchError((error) => {
        console.log(error);
        return throwError(error);
      }),
    );
  }

  updatePreference(
    notificationType: string,
    inAppEnabled: boolean,
    emailEnabled: boolean,
  ): Observable<UserNotificationPreference> {
    return this.http
      .put<any>(`${this.baseUrl}/preferences/${notificationType}`, {
        inAppEnabled,
        emailEnabled,
      })
      .pipe(
        map((body) => body.result),
        catchError((error) => {
          console.log(error);
          return throwError(error);
        }),
      );
  }

  clearState(): void {
    this.notificationsSubject.next([]);
    this.unreadCountSubject.next(0);
  }
}
