import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { ProjectService } from 'src/app/services/project.service';
import { Router } from '@angular/router';
import { Project } from 'src/app/interfaces/project';
import { ProjectUser } from 'src/app/interfaces/project-user';
import { ProjectTag } from 'src/app/interfaces/project-tag';

@Component({
  selector: 'app-project-edit',
  templateUrl: './project-edit.component.html',
  styleUrls: ['./project-edit-component.css'] 
})
export class ProjectEditComponent implements OnInit {

  project : Project = null;

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

}
