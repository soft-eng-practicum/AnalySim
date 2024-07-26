import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { ProjectService } from '../services/project.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user';
import { Project } from '../interfaces/project';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  constructor(
    private accountService: AccountService,
    private projectService: ProjectService,
    private sanitizer: DomSanitizer,
    private formBuilder: FormBuilder,
    public notfi: NotificationService,
    private router: Router
  ) { }

  searchForm: FormGroup;
  searchTerm: FormControl;
  termParam: string[];
  projects: Project[];
  profileImageUrl: SafeUrl;

  loginStatus$: Observable<boolean>;
  currentUser$: Observable<User> = null;
  currentUser: User = null;

  async ngOnInit() {
    this.loginStatus$ = this.accountService.isLoggedIn;
    this.currentUser$ = await this.accountService.currentUser;
    this.currentUser$.subscribe(x => {
      this.currentUser = x
      if (x) this.profileImage();
    });

    this.searchTerm = new FormControl();
    this.searchForm = new FormGroup({
      searchTerm: this.searchTerm
    });
  }

  profileImage() {
    if (this.currentUser.blobFiles.length != 0) {
      var blobFile = this.currentUser.blobFiles.find(x => x.container == 'profile')
      if (blobFile != null) {
        this.projectService.downloadFile(blobFile.blobFileID).subscribe(
          imageBlob => {
            if (imageBlob == null) this.profileImageUrl = "../../assets/img/default-profile.png";
            const objectURL = URL.createObjectURL(imageBlob);
            this.profileImageUrl = this.sanitizer.bypassSecurityTrustUrl(objectURL);
          }, error => {
            console.log(error)
          }
        )
      }
      else this.profileImageUrl = "../../assets/img/default-profile.png";
    }
  }

  searchProject(searchTerms: string[]) {
    if (searchTerms.length === 0) {
      this.projectService.getProjectList().subscribe(
        result => {
          this.projects = result;
        },
        error => {
          console.log(error);
        }
      );
    } else {
      this.projectService.search(searchTerms).subscribe(
        result => {
          this.projects = result;
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  onSubmit() {
    const searchForm = this.searchForm.value;
    const searchTerms: string[] = Array.from(
      new Set(searchForm.searchTerm.split(' ').filter(x => x.length !== 0))
    );

    console.log('SEARCH TERMS:', searchTerms);

    this.searchProject(searchTerms);
    this.router.navigate(['/explore'], {
      queryParams: { category: 'project', term: JSON.stringify(searchTerms) }
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