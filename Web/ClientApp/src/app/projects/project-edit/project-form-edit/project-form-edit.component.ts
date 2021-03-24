import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, ValidatorFn, AbstractControl } from '@angular/forms';
import { ProjectService } from 'src/app/services/project.service';
import { Project } from 'src/app/interfaces/project';
import { AccountService } from 'src/app/services/account.service';
import { User } from 'src/app/interfaces/user';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-project-form-edit',
  templateUrl: './project-form-edit.component.html',
  styleUrls: ['./project-form-edit.component.css']
})
export class ProjectFormEditComponent implements OnInit {

  constructor(
    private projectService : ProjectService,
    private accountService : AccountService,
    private formBuilder : FormBuilder,
    private router : Router) { }

  // Form Control - Create Project
  projectForm: FormGroup
  name: FormControl
  description: FormControl
  visibility: FormControl

  currentUser$ : Observable<User>
  currentUser : User
  isLoading : boolean

  currentProject$ : Observable<Project> = null
  project: Project

  @Output() setProject = new EventEmitter<Project>()

  async ngOnInit() {
    if(!this.accountService.checkLoginStatus())
      this.router.navigate(['/login'], {queryParams: {returnUrl : this.router.url}})

    this.isLoading = false;


    await this.accountService.currentUser.then((x) => this.currentUser$ = x)
    this.currentUser$.subscribe(x => this.currentUser = x)

    await this.projectService.getProjectByID(1).subscribe(result => this.project = result);
    console.log(this.project)
    
    // Initialize Form Controls
    this.name = new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(20), this.noSpaceSpecial()])
    this.description = new FormControl('')
    this.visibility = new FormControl('')

    // Initialize FormGroup using FormBuilder
    this.projectForm = this.formBuilder.group({
        name : this.name,
        description : this.description,
        visibility : this.visibility
    })
    
  }

  updateProject(){
      alert("Project has been updated!");
  }
  // Custom Validator
  noSpaceSpecial() : ValidatorFn
  {
    return (projectNameControl: AbstractControl): {[key: string]: boolean} | null => {

      // Check if empty
      if(projectNameControl.value.length == ''){
        return null
      }

      // Regular Expression for having Space or Special Character
      var reg = new RegExp('^[a-zA-Z0-9\-]*$');

      // Return Error Message if test false, otherwise return null
      if(!reg.test(projectNameControl.value)){
        return {'noSpaceSpecial': true}
      }
      else{
        return null
      }
    }
  }

  onSubmit() {
    let projectForm = this.projectForm.value;

    this.projectService.updateProject(this.project).subscribe(
      result =>{
        this.setProject.emit(result)
      },error =>{
        console.log(error)
      }
    )

  }

}
