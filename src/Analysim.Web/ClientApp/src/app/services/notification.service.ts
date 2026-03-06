import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ToastrService } from 'ngx-toastr';
import * as signalR from '@microsoft/signalr';
import { AppNotification } from '../interfaces/app-notification';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private baseUrl = '/api/notification/';
  private hubConnection: signalR.HubConnection | null = null;

  private _notifications = new BehaviorSubject<AppNotification[]>([]);
  notifications$ = this._notifications.asObservable();

  get unreadCount$(): Observable<number> {
    return this.notifications$.pipe(
      map(list => list.filter(n => !n.isRead).length)
    );
  }

  constructor(private http: HttpClient, private toastr: ToastrService) {
    this.toastr.toastrConfig.positionClass = 'toast-bottom-right';
  }

  // ─── Toastr helpers ───────────────────────────────────────────────────────

  showSuccess(message: string, title: string) {
    this.toastr.success(message, title);
    console.log(title + ':' + message);
  }

  showInfo(message: string, title: string) {
    this.toastr.info(message, title);
    console.log(title + ':' + message);
  }

  showMessage(message: string, title: string) {
    this.toastr.error(message, title);
    console.log(title + ':' + message);
  }

  showWarning(message: string, title: string) {
    this.toastr.warning(message, title);
    console.log(title + ':' + message);
  }

  // ─── HTTP Methods ─────────────────────────────────────────────────────────

  fetchNotifications(): void {
    const headers = this.authHeaders();
    this.http.get<any>(this.baseUrl + 'getnotifications', { headers })
      .pipe(
        map(body => body.result as AppNotification[]),
        catchError(err => { console.error(err); return throwError(err); })
      )
      .subscribe(notifications => {
        this._notifications.next(notifications || []);
      });
  }

  markRead(id: number): void {
    const headers = this.authHeaders();
    this.http.put<any>(`${this.baseUrl}markread/${id}`, null, { headers })
      .pipe(catchError(err => { console.error(err); return throwError(err); }))
      .subscribe(() => {
        const updated = this._notifications.value.map(n =>
          n.id === id ? { ...n, isRead: true } : n
        );
        this._notifications.next(updated);
      });
  }

  markAllRead(): void {
    const headers = this.authHeaders();
    this.http.put<any>(`${this.baseUrl}markallread`, null, { headers })
      .pipe(catchError(err => { console.error(err); return throwError(err); }))
      .subscribe(() => {
        const updated = this._notifications.value.map(n => ({ ...n, isRead: true }));
        this._notifications.next(updated);
      });
  }

  // ─── SignalR ──────────────────────────────────────────────────────────────

  startSignalRConnection(token: string): void {
    if (this.hubConnection) return;

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('/hubs/notification', {
        accessTokenFactory: () => token,
      })
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    this.hubConnection.on('ReceiveNotification', (notification: AppNotification) => {
      const current = this._notifications.value;
      this._notifications.next([notification, ...current]);
      this.toastr.info(notification.message, notification.title);
    });

    this.hubConnection.start()
      .then(() => console.log('SignalR connected'))
      .catch(err => console.error('SignalR connection error:', err));
  }

  stopConnection(): void {
    if (this.hubConnection) {
      this.hubConnection.stop().then(() => {
        console.log('SignalR disconnected');
        this.hubConnection = null;
        this._notifications.next([]);
      });
    }
  }

  // ─── Helper ───────────────────────────────────────────────────────────────

  private authHeaders(): HttpHeaders {
    return new HttpHeaders().set('Authorization', `Bearer ${localStorage.getItem('jwt')}`);
  }
}
