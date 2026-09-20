import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { ProjectService } from 'src/app/services/project.service';
import { Router } from '@angular/router';
import { Project } from 'src/app/interfaces/project';
import { ProjectUser } from 'src/app/interfaces/project-user';
import { ProjectTag } from 'src/app/interfaces/project-tag';
import { ProjectMembershipRequest } from 'src/app/interfaces/project-membership-request';

@Component({
  selector: 'app-project-create',
  templateUrl: './project-create.component.html',
  styleUrls: ['./project-create.component.scss']
})
export class ProjectCreateComponent implements OnInit {

  project : Project = null
  membershipRequests : ProjectMembershipRequest[] = []

  constructor(private projectService : ProjectService,
    private formBuilder : FormBuilder,
    private router : Router
    ) { }


  ngOnInit(): void {
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

  addMembershipRequest(request : ProjectMembershipRequest){
    this.membershipRequests.push(request)
  }

}
