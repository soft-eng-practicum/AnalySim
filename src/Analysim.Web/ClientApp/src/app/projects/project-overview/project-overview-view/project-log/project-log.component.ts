import { Component, Input, OnInit } from '@angular/core';
import { Project } from 'src/app/interfaces/project';
import { ProjectLog } from 'src/app/interfaces/project-log';
import { User } from 'src/app/interfaces/user';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-project-log',
  templateUrl: './project-log.component.html',
  styleUrls: ['./project-log.component.scss']
})
export class ProjectLogComponent implements OnInit {
  // Inputs
  @Input() project: Project;
  @Input() currentUser: User;
  @Input() isMember: boolean;
  
  logs: ProjectLog[] = [];
  archivedLogs: ProjectLog[] = [];
  isLoading = false;
  isCreatingLog = false;

  isInArchive = false;

  constructor(
    private projectService: ProjectService,
  ) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  // Load active and archived logs
  loadLogs(): void {
    if (!this.project || this.project.projectID <= 0) return;

    this.isLoading = true;

    this.projectService.getProjectLogs(this.project.projectID).subscribe({
      next: (logs) => {
        this.logs = logs.filter(log => !log.isDeleted);
        this.archivedLogs = logs.filter(log => log.isDeleted);
        this.isLoading = false;
      },
      error: (error) => {
        console.log('Failed to load comments', error);
        this.isLoading = false;
      },
    });
  }

  // Open create log form
  onAddLog() {
    this.isCreatingLog = true;
  }

  // Refresh logs after create
  onCreateLog() {
    this.loadLogs();
    this.isCreatingLog = false;
  }

  // Switch between active logs and archive
  onMoveTab(){
    this.isInArchive = !this.isInArchive;
  }
}