import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
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
  @Input() project: Project;
  @Input() currentUser: User;
  @Input() isMember: boolean;
  
  logs: ProjectLog[] = [];
  isLoading = false;
  isCreatingLog = false;

  constructor(
    private modalService: BsModalService,
    private projectService: ProjectService,
  ) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    if (!this.project || this.project.projectID <= 0) return;

    this.isLoading = true;

    this.projectService.getProjectLogs(this.project.projectID).subscribe({
      next: (logs) => {
        this.logs = logs;
        this.isLoading = false;
      },
      error: (error) => {
        console.log('Failed to load comments', error);
        this.isLoading = false;
      },
    });
  }


  onAddLog() {
    this.isCreatingLog = true;
  }

  onCreateLog() {
    this.loadLogs();
    this.isCreatingLog = false;
  }

}
