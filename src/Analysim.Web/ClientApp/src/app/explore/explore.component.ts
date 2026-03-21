import { Component, HostListener, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

import { Project } from '../interfaces/project';
import { User } from '../interfaces/user';

import { AccountService } from '../services/account.service';
import { ExploreService } from '../services/explore.service';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.scss']
})
export class ExploreComponent implements OnInit {
  constructor(
    private accountService: AccountService,
    public exploreService: ExploreService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  // Query / filter state
  termParam: string[];
  categoryParam: string;
  sortOrder: 'newest' | 'oldest' = 'newest';

  // Local data
  projects: Project[];
  users: User[];

  // Dropdown UI state
  isCategoryOpen = false;
  isSortOpen = false;

  @HostListener('document:click')
  closeDropdowns() {
    this.isCategoryOpen = false;
    this.isSortOpen = false;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.projects = null;
      this.users = null;

      this.termParam = JSON.parse(params['term'] || '[]');
      this.categoryParam = params['category'] || 'project';

      let searchTermString = '';
      this.termParam.forEach(x => (searchTermString += x + ' '));

      switch (this.categoryParam) {
        case 'project':
          this.exploreService.exploreProject(searchTermString);
          break;

        case 'profile':
          this.searchProfile(this.termParam);
          break;

        default:
          this.router.navigate(['/explore'], {
            queryParams: {
              category: 'project',
              term: JSON.stringify(this.termParam)
            }
          });
          break;
      }
    });
  }

  searchProfile(searchTerms: string[]) {
    this.users = null;

    if (searchTerms.length == 0) {
      this.accountService.getUserList().subscribe(
        result => {
          this.users = result;
        },
        error => {
          console.log(error);
        }
      );
    } else {
      this.accountService.search(searchTerms).subscribe(
        result => {
          this.users = result;
        },
        error => {
          console.log(error);
        }
      );
    }
  }

  changeCategory(category: string) {
    if (this.categoryParam === category) return;

    const currentTerm = this.route.snapshot.queryParams['term'] || '[]';

    this.router.navigate(['/explore'], {
      queryParams: {
        category: category,
        term: currentTerm
      }
    });
  }

  clearSearch() {
    this.router.navigate(['/explore'], {
      queryParams: {
        category: this.categoryParam || 'project',
        term: JSON.stringify([])
      }
    });
  }

  setSortOrder(order: 'newest' | 'oldest') {
    if (this.sortOrder === order) return;

    this.sortOrder = order;
  }

  toggleCategoryDropdown() {
    this.isCategoryOpen = !this.isCategoryOpen;
    this.isSortOpen = false;
  }

  toggleSortDropdown() {
    this.isSortOpen = !this.isSortOpen;
    this.isCategoryOpen = false;
  }

  selectCategory(category: string) {
    this.isCategoryOpen = false;
    this.changeCategory(category);
  }

  selectSortOrder(order: 'newest' | 'oldest') {
    this.isSortOpen = false;
    this.setSortOrder(order);
  }

  get sortedProjects(): Project[] {
    const projects = this.exploreService.projects
      ? [...this.exploreService.projects]
      : [];

    return projects.sort((a, b) => {
      const aTime = new Date(a.dateCreated).getTime();
      const bTime = new Date(b.dateCreated).getTime();

      return this.sortOrder === 'newest' ? bTime - aTime : aTime - bTime;
    });
  }

  get sortedUsers(): User[] {
    const users = this.users ? [...this.users] : [];

    return users.sort((a, b) => {
      const aTime = new Date(a.dateCreated).getTime();
      const bTime = new Date(b.dateCreated).getTime();

      return this.sortOrder === 'newest' ? bTime - aTime : aTime - bTime;
    });
  }
}