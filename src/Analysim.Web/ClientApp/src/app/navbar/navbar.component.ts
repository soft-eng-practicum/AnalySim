import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { ProjectService } from '../services/project.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user';
import { Project } from '../interfaces/project';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';
import { ExploreService } from '../services/explore.service';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  constructor(
    private accountService: AccountService,
    private projectService: ProjectService,
    private exploreService: ExploreService,
    private formBuilder: FormBuilder,
    public notfi: NotificationService,
    private router: Router,
  ) { }

  searchForm: FormGroup;
  searchTerm: FormControl;
  termParam: string[];
  projects: Project[];

  loginStatus$: Observable<boolean>;
  currentUser$: Observable<User> = null;

  async ngOnInit() {
    this.loginStatus$ = this.accountService.isLoggedIn;
    this.currentUser$ = await this.accountService.currentUser;

    this.searchTerm = new FormControl();
    this.searchForm = new FormGroup({
      searchTerm: this.searchTerm
    });
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
    console.log(searchForm.searchTerm)
  }

  navigateHome() {
    if (this.accountService.checkLoginStatus()) {
      this.router.navigate(['/dashboard']);
    } else {
      this.router.navigate(['/home']);
    }
  }

  onLogout(){
    this.accountService.logout();
  }
}