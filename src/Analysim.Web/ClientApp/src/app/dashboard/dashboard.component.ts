import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  DashboardActivity,
  DashboardOverview,
  DashboardProjectListItem,
  DashboardResearchImpact,
  DashboardService,
  DashboardStorageUsage
} from '../services/dashboard.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  overview: DashboardOverview;
  storageUsage: DashboardStorageUsage;
  researchImpact: DashboardResearchImpact;
  popularProjects: DashboardProjectListItem[] = [];
  activity: DashboardActivity;
  projects: DashboardProjectListItem[] = [];

  totalProjectResults = 0;
  isLoading = true;
  isProjectListLoading = false;
  errorMessage = '';
  activeTab: 'projects' | 'datasets' = 'projects';

  searchTerm = '';
  visibilityFilter = '';
  tagFilter = '';
  sortBy = 'lastUpdated';
  sortDirection = 'desc';
  page = 1;
  pageSize = 10;

  // TODO: Replace the temporary recommends value when recommendations are implemented.
  // TODO: Replace these rows when dataset metadata endpoints are available after data/project separation.
  datasetPlaceholders = [
    {
      name: 'Health Indicators 2026',
      description: 'A preview row for health metrics, regional indicators, and yearly reporting coverage.',
      size: '27.3 MB',
      rows: '152,314 rows',
      columns: '16 columns',
      visibility: 'Public',
      usage: 'Used in 3 Projects',
      updated: '4 Days ago'
    },
    {
      name: 'Population census 2023',
      description: 'A preview row for demographic distribution, density, and socioeconomic indicators.',
      size: '36.2 MB',
      rows: '112,624 rows',
      columns: '13 columns',
      visibility: 'Public',
      usage: 'Used in 1 Project',
      updated: '5 Days ago'
    },
    {
      name: 'Energy Consumption',
      description: 'A preview row for energy usage patterns across residential and industrial sectors.',
      size: '13.8 MB',
      rows: '42,814 rows',
      columns: '19 columns',
      visibility: 'Public',
      usage: 'Used in 2 Projects',
      updated: '1 Week ago'
    }
  ];

  constructor(
    private dashboardService: DashboardService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.isLoading = true;
    this.errorMessage = '';

    forkJoin({
      overview: this.dashboardService.getOverview(),
      storageUsage: this.dashboardService.getStorageUsage(),
      researchImpact: this.dashboardService.getResearchImpact(),
      popularProjects: this.dashboardService.getPopularProjects(4, 'public'),
      activity: this.dashboardService.getActivity(6),
      projects: this.dashboardService.getProjects(this.projectQuery())
    }).subscribe(result => {
      this.overview = result.overview;
      this.storageUsage = result.storageUsage;
      this.researchImpact = result.researchImpact;
      this.popularProjects = result.popularProjects;
      this.activity = result.activity;
      this.projects = result.projects.items;
      this.totalProjectResults = result.projects.totalResults;
      this.isLoading = false;
    }, error => {
      console.log(error);
      this.errorMessage = 'Unable to load dashboard.';
      this.isLoading = false;
    });
  }

  loadProjects(): void {
    this.isProjectListLoading = true;

    this.dashboardService.getProjects(this.projectQuery()).subscribe(result => {
      this.projects = result.items;
      this.totalProjectResults = result.totalResults;
      this.isProjectListLoading = false;
    }, error => {
      console.log(error);
      this.isProjectListLoading = false;
    });
  }

  applyFilters(): void {
    this.page = 1;
    this.loadProjects();
  }

  resetFilters(): void {
    this.searchTerm = '';
    this.visibilityFilter = '';
    this.tagFilter = '';
    this.sortBy = 'lastUpdated';
    this.sortDirection = 'desc';
    this.page = 1;
    this.loadProjects();
  }

  switchTab(tab: 'projects' | 'datasets'): void {
    this.activeTab = tab;
  }

  navigateToProject(project: DashboardProjectListItem): void {
    const parts = project.route.split('/');
    if (parts.length >= 2) {
      this.router.navigate(['/project', parts[0], parts[1]]);
    }
  }

  goToCreateProject(): void {
    this.router.navigate(['/project/create']);
  }

  goToExplorePublicProjects(): void {
    this.router.navigate(['/explore']);
  }

  get storageLabel(): string {
    if (!this.storageUsage) return '0 / 0 GB';

    return `${this.storageUsage.usedGigabytes} / ${this.storageUsage.quotaGigabytes} GB`;
  }

  get maxActivityValue(): number {
    if (!this.activity || !this.activity.months || this.activity.months.length === 0) return 1;

    return Math.max(...this.activity.months.map(month => Math.max(month.created, month.updated)), 1);
  }

  get growthRateLabel(): string {
    if (!this.activity) return '0%';

    return `${this.activity.growthRate}%`;
  }

  get hasAnyProjects(): boolean {
    return (this.overview?.totalProjects || 0) > 0;
  }

  get shouldShowFirstProjectEmptyState(): boolean {
    return !this.isProjectListLoading && !this.hasAnyProjects;
  }

  activityBarHeight(value: number): number {
    return Math.max((value / this.maxActivityValue) * 60, value > 0 ? 10 : 4);
  }

  projectLink(project: DashboardProjectListItem): any[] {
    const parts = project.route.split('/');
    return parts.length >= 2 ? ['/project', parts[0], parts[1]] : ['/dashboard'];
  }

  private projectQuery() {
    return {
      query: this.searchTerm,
      visibility: this.visibilityFilter,
      tag: this.tagFilter,
      sortBy: this.sortBy,
      sortDirection: this.sortDirection,
      page: this.page,
      pageSize: this.pageSize
    };
  }
}
