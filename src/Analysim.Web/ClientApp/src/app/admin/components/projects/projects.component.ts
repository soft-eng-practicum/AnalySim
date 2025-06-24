// src/app/admin/admin-projects/admin-projects.component.ts
import { Component, OnInit } from '@angular/core';
import { ProjectService } from 'src/app/services/project.service';
import { Project } from '../../../interfaces/project';

@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent implements OnInit {
  projects: Project[] = [];
  loading = true;
  error: string = null;

  constructor(private projectService: ProjectService) { }

  ngOnInit() {
    this.projectService.getProjectList().subscribe({
      next: result => {
        this.projects = result;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load projects';
        this.loading = false;
      }
    });
  }
}
