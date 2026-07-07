import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Project } from 'src/app/interfaces/project';
import { ProjectUser } from 'src/app/interfaces/project-user';
import { ProjectTag } from 'src/app/interfaces/project-tag';

@Component({
  selector: 'app-project-edit',
  templateUrl: './project-edit.component.html',
  styleUrls: ['./project-edit.component.scss'] 
})
export class ProjectEditComponent implements OnInit {

  project : Project = null;
  owner: string = null;
  projectname: string = null;

  constructor(private route: ActivatedRoute) { }


  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.owner = params['owner'];
      this.projectname = params['projectname'];
    });
  }

  setProject(project : Project){
    this.project = project
  }

  updateProjectTags(projectTags : ProjectTag[]){
    this.project.projectTags = projectTags
  }

  updateProjectUsers(projectUsers : ProjectUser[]){
    this.project.projectUsers = projectUsers
  }

}
