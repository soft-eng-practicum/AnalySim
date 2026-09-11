import { Component, HostListener, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { ProjectService } from '../services/project.service';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user';
import { Project } from '../interfaces/project';
import { NotificationService } from '../services/notification.service';
import { UserNotificationService } from '../services/user-notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ExploreService } from '../services/explore.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { UserNotification } from '../interfaces/user-notification';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  constructor(
    private accountService: AccountService,
    private projectService: ProjectService,
    private exploreService: ExploreService,
    private sanitizer: DomSanitizer,
    public notfi: NotificationService,
    private userNotificationService: UserNotificationService,
    private router: Router,
    private route: ActivatedRoute,
  ) {}

  searchText: string = '';
  termParam: string[];
  projects: Project[];
  profileImageUrl: SafeUrl;

  loginStatus$: Observable<boolean>;
  currentUser$: Observable<User> = null;
  currentUser: User = null;
  isAdmin$: Observable<boolean>;
  notifications$: Observable<UserNotification[]>;
  unreadCount$: Observable<number>;
  isNotificationMenuOpen = false;

  async ngOnInit() {
    this.loginStatus$ = this.accountService.isLoggedIn;
    this.notifications$ = this.userNotificationService.notifications$;
    this.unreadCount$ = this.userNotificationService.unreadCount$;
    this.currentUser$ = await this.accountService.currentUser;
    this.currentUser$.subscribe((x) => {
      this.currentUser = x;
      if (x) {
        this.isAdmin$ = this.accountService.getIsAdmin(x.userName);
        this.profileImage();
        this.loadNotifications();
      } else {
        this.userNotificationService.clearState();
      }
    });
  }

  profileImage() {
    this.profileImageUrl = '../../assets/img/default-profile.png';

    if (
      !this.currentUser ||
      !this.currentUser.blobFiles ||
      this.currentUser.blobFiles.length === 0
    ) {
      return;
    }

    const blobFile = this.currentUser.blobFiles.find(
      (x) => x.container === 'profile',
    );

    if (!blobFile) {
      return;
    }

    this.projectService.downloadFile(blobFile.blobFileID).subscribe(
      (imageBlob) => {
        if (!imageBlob) {
          this.profileImageUrl = '../../assets/img/default-profile.png';
          return;
        }

        const objectURL = URL.createObjectURL(imageBlob);
        this.profileImageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
      },
      (error) => {
        console.log(error);
        this.profileImageUrl = '../../assets/img/default-profile.png';
      },
    );
  }

  searchProject(searchTerms: string[]) {
    if (searchTerms.length === 0) {
      this.projectService.getProjectList().subscribe(
        (result) => {
          this.projects = result;
        },
        (error) => {
          console.log(error);
        },
      );
    } else {
      this.projectService.search(searchTerms).subscribe(
        (result) => {
          this.projects = result;
        },
        (error) => {
          console.log(error);
        },
      );
    }
  }

  onSubmit() {
    const rawTerm = this.searchText || '';

    const searchTerms: string[] = Array.from(
      new Set(
        rawTerm
          .split(' ')
          .map((x: string) => x.trim())
          .filter((x: string) => x.length !== 0),
      ),
    );

    let category = 'project';

    if (this.router.url.startsWith('/explore')) {
      const currentCategory = this.router.parseUrl(this.router.url).queryParams[
        'category'
      ];
      category = currentCategory || 'project';
    }

    this.router.navigate(['/explore'], {
      queryParams: {
        category: category,
        term: JSON.stringify(searchTerms),
      },
    });
  }

  navigateHome() {
    if (this.accountService.checkLoginStatus()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  onLogout() {
    this.userNotificationService.clearState();
    this.accountService.logout();
  }

  loadNotifications() {
    this.userNotificationService.loadUnreadCount().subscribe(
      () => {},
      (error) => console.log(error),
    );

    this.userNotificationService.loadNotifications(false, 1, 8).subscribe(
      () => {},
      (error) => console.log(error),
    );
  }

  toggleNotifications(event: Event) {
    event.preventDefault();
    this.isNotificationMenuOpen = !this.isNotificationMenuOpen;

    if (this.isNotificationMenuOpen) {
      this.loadNotifications();
    }
  }

  @HostListener('document:click', ['$event'])
  closeNotificationsOnOutsideClick(event: MouseEvent) {
    const target = event.target as Element | null;
    const clickedInsideNotifications = !!target?.closest('.notification-nav-item');

    if (this.isNotificationMenuOpen && !clickedInsideNotifications) {
      this.isNotificationMenuOpen = false;
    }
  }

  onNotificationClick(notification: UserNotification) {
    const navigate = () => {
      this.isNotificationMenuOpen = false;
      if (notification.link) {
        this.router.navigateByUrl(notification.link);
      }
    };

    if (notification.isRead) {
      navigate();
      return;
    }

    this.userNotificationService.markAsRead(notification.notificationID).subscribe(
      () => navigate(),
      () => navigate(),
    );
  }

  markAllNotificationsRead(event: Event) {
    event.preventDefault();
    event.stopPropagation();

    this.userNotificationService.markAllAsRead().subscribe(
      () => {},
      (error) => console.log(error),
    );
  }

  getNotificationIcon(type: string): string {
    switch (type) {
      case 'comment.reply':
        return 'fa-comment';
      case 'project.invitation.received':
        return 'fa-envelope-open-text';
      case 'project.member.added':
      case 'project.joined':
        return 'fa-user-plus';
      case 'project.log.created':
      case 'project.log.updated':
        return 'fa-bell';
      default:
        return 'fa-bell';
    }
  }
}
