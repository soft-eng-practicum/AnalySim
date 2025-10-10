import { Component, OnInit } from '@angular/core';
import { EventEmitter, Input, Output } from '@angular/core';
import { Project } from 'src/app/interfaces/project';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-project-display',
  templateUrl: './project-display.component.html',
  styleUrls: ['./project-display.component.scss']
})
export class ProjectDisplayComponent implements OnInit {

  @Input() project : Project;
  @Output() projectDeleted : EventEmitter<any> = new EventEmitter<any>();
  constructor( private projectService : ProjectService) { }

  ngOnInit(): void {
  }

  deleteProject() {
      this.projectService.deleteProject(this.project.projectID).subscribe(res => {
        this.projectDeleted.emit();
      })
  }

}
