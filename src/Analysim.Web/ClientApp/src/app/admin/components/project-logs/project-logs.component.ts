import { Component, OnInit } from '@angular/core';
import { ExpiredProjectLog } from 'src/app/interfaces/expired-project-log';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-project-logs',
  templateUrl: './project-logs.component.html',
  styleUrls: ['./project-logs.component.scss']
})
export class ProjectLogsComponent implements OnInit {
  expiredLogs: ExpiredProjectLog[] = [];
  isLoading: boolean = false;

  errorStatusAlert = false;
  errorResult = "";

  constructor(private projectService: ProjectService) {}

  ngOnInit(): void {
    this.loadLogs();
  }

  loadLogs(): void {
    this.isLoading = true;

    this.projectService.getExpiredProjectLogs().subscribe({
      next: (expiredLogs) => {
        this.expiredLogs = expiredLogs;
        this.isLoading = false;
      },
      error: (error) => {
        console.log('Failed to load flagged comments', error);
        this.isLoading = false;
      },
    });
  }

  deleteExpiredLog(logID: number){
    this.projectService.deleteExpiredProjectLog(logID).subscribe({
      next: (result) => {
        console.log('Deleted project log', logID);
        this.loadLogs();
      },
      error: (error) => {
        this.errorStatusAlert = true;
        this.errorResult = "Error: unable to delete project log, please try again later";
        console.log(error);
      },
    });
  }
}
