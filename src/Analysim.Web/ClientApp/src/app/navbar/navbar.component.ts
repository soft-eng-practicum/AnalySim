import { Component, OnInit } from '@angular/core';
import { AccountService } from '../services/account.service';
import { ProjectService } from '../services/project.service';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { User } from '../interfaces/user';
import { Project } from '../interfaces/project';
import { NotificationService } from '../services/notification.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss']
})
export class NavbarComponent implements OnInit {
  constructor(
    private accountService: AccountService,
    private projectService: ProjectService,
    private formBuilder: FormBuilder,
    public notfi: NotificationService,
    private router: Router
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

  onLogout(){
    this.accountService.logout();
  }
}
