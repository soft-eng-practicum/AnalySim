import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { ProjectService } from '../services/project.service';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user';
import { Project } from '../interfaces/project';
import { NotificationService } from '../services/notification.service';
import { ActivatedRoute, Router } from '@angular/router';
import { ExploreService } from '../services/explore.service';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

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
  ) {}

  searchText: string = '';
  termParam: string[];
  projects: Project[];
  profileImageUrl: SafeUrl;

  loginStatus$: Observable<boolean>;
  currentUser$: Observable<User> = null;
  currentUser: User = null;
  isAdmin$: Observable<boolean>;

  async ngOnInit() {
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
    this.accountService.logout();
  }
}
