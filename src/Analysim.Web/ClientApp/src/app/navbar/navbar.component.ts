import { Component, ElementRef, HostListener, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { ProjectService } from '../services/project.service';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user';
import { Project } from '../interfaces/project';
import { NotificationService } from '../services/notification.service';
import { ActivatedRoute, NavigationEnd, Router } from '@angular/router';
import { ExploreService } from '../services/explore.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';
import { filter } from 'rxjs/operators';

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
    private router: Router,
    private route: ActivatedRoute,
    private elementRef: ElementRef,
  ) {}

  searchText: string = '';
  termParam: string[];
  projects: Project[];
  profileImageUrl: SafeUrl;
  sectionTitle = 'Home';
  isMenuOpen = false;
  isProfileMenuOpen = false;

  loginStatus$: Observable<boolean>;
  currentUser$: Observable<User> = null;
  currentUser: User = null;
  isAdmin$: Observable<boolean>;

  async ngOnInit() {
    this.updateSectionTitle(this.router.url);
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
      )
      .subscribe((event) => {
        this.updateSectionTitle(event.urlAfterRedirects);
        this.closeMenus();
      });

    this.loginStatus$ = this.accountService.isLoggedIn;
    this.currentUser$ = await this.accountService.currentUser;
    this.currentUser$.subscribe((x) => {
      this.currentUser = x;
      if (x) {
        this.isAdmin$ = this.accountService.getIsAdmin(x.userName);
        this.profileImage();
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
    this.closeMenus();

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
    this.closeMenus();

    if (this.accountService.checkLoginStatus()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  onLogout() {
    this.closeMenus();
    this.accountService.logout();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
    this.isProfileMenuOpen = false;
  }

  toggleProfileMenu() {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
    this.isMenuOpen = false;
  }

  closeMenu() {
    this.isMenuOpen = false;
  }

  closeProfileMenu() {
    this.isProfileMenuOpen = false;
  }

  closeMenus() {
    this.closeMenu();
    this.closeProfileMenu();
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as Node;

    if (!this.elementRef.nativeElement.contains(target)) {
      this.closeMenus();
    }
  }

  @HostListener('document:keydown.escape')
  onEscape() {
    this.closeMenus();
  }

  private updateSectionTitle(url: string) {
    const parsedUrl = this.router.parseUrl(url || '/home');
    const segments = parsedUrl.root.children['primary']?.segments || [];
    const firstSegment = segments.length > 0 ? segments[0].path : 'home';

    if (firstSegment === 'project') {
      if (segments.length >= 3) {
        this.sectionTitle = this.formatSegment(segments[2].path);
      } else if (segments.length === 2) {
        this.sectionTitle = 'Project';
      } else {
        this.sectionTitle = 'Projects';
      }
      return;
    }

    if (firstSegment === 'profile' && segments.length >= 2) {
      this.sectionTitle = this.formatSegment(segments[1].path);
      return;
    }

    const sectionTitles: { [key: string]: string } = {
      home: 'Home',
      dashboard: 'Dashboard',
      explore: 'Explore',
      login: 'Login',
      register: 'Register',
      aboutus: 'About',
      contactus: 'Contact',
      admin: 'Admin',
      setting: 'Settings',
      'email-confirmation': 'Email Confirmation',
      'email-resend-verification': 'Email Confirmation',
      emailForgotPass: 'Password Reset',
      resetPassword: 'Password Reset',
      '404': 'Not Found',
    };

    this.sectionTitle =
      sectionTitles[firstSegment] || this.toTitleCase(firstSegment);
  }

  private toTitleCase(value: string): string {
    return value
      .replace(/[-_]/g, ' ')
      .replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  private formatSegment(value: string): string {
    return decodeURIComponent(value).replace(/[-_]/g, ' ');
  }
}
