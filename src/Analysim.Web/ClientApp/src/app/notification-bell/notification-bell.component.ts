import { Component, OnInit, OnDestroy, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, Subscription } from 'rxjs';
import { filter, take } from 'rxjs/operators';
import { NotificationService } from '../services/notification.service';
import { AccountService } from '../services/account.service';
import { AppNotification } from '../interfaces/app-notification';

@Component({
  selector: 'app-notification-bell',
  templateUrl: './notification-bell.component.html',
  styleUrls: ['./notification-bell.component.scss']
})
export class NotificationBellComponent implements OnInit, OnDestroy {
  notifications$: Observable<AppNotification[]>;
  unreadCount$: Observable<number>;
  showDropdown = false;
  private loginSub: Subscription;

  constructor(
    public notificationService: NotificationService,
    private accountService: AccountService,
    private router: Router
  ) {
    this.notifications$ = this.notificationService.notifications$;
    this.unreadCount$ = this.notificationService.unreadCount$;
  }

  ngOnInit() {
    this.loginSub = this.accountService.isLoggedIn
      .pipe(filter(isLoggedIn => isLoggedIn === true), take(1))
      .subscribe(() => {
        const token = localStorage.getItem('jwt');
        if (!token) return;

        this.notificationService.fetchNotifications();
        this.notificationService.startSignalRConnection(token);
      });
  }

  ngOnDestroy() {
    this.loginSub?.unsubscribe();
  }

  @HostListener('document:click')
  onDocumentClick() {
    this.showDropdown = false;
  }

  toggleDropdown(event: MouseEvent) {
    event.stopPropagation();
    this.showDropdown = !this.showDropdown;
  }

  onNotificationClick(notification: AppNotification) {
    this.notificationService.markRead(notification.id);
    this.showDropdown = false;
    this.router.navigate([notification.linkUrl]);
  }

  onMarkAllRead(event: MouseEvent) {
    event.stopPropagation();
    this.notificationService.markAllRead();
  }

  stopProp(event: MouseEvent) {
    event.stopPropagation();
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'ProjectInvitation': return 'fa fa-users';
      case 'NewFollower':       return 'fa fa-user-plus';
      case 'SecurityAlert':     return 'fa fa-shield';
      default:                  return 'fa fa-bell';
    }
  }
}
