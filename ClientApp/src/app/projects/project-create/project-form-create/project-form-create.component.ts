import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder, ValidatorFn, AbstractControl } from '@angular/forms';
import { ProjectService } from 'src/app/services/project.service';
import { Project } from 'src/app/interfaces/project';
import { AccountService } from 'src/app/services/account.service';
import { ApplicationUser } from 'src/app/interfaces/user';

@Component({
  selector: 'app-project-form-create',
  templateUrl: './project-form-create.component.html',
  styleUrls: ['./project-form-create.component.css']
})
export class ProjectFormCreateComponent implements OnInit {

  constructor(
    private projectService : ProjectService,
    private accountService : AccountService,
    private formBuilder : FormBuilder) { }

  // Form Control - Create Project
  projectForm: FormGroup
  name: FormControl
  description: FormControl
  visibility: FormControl

  currentUser : ApplicationUser
  isLoading : boolean

  @Output() setProject = new EventEmitter<Project>();

  //files: FormArray;

  ngOnInit(): void {
    this.accountService.currentUser.subscribe(result => this.currentUser = result)
    this.isLoading = false;

    // Initialize Form Controls
    this.name = new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(20), this.noSpaceSpecial()]);
    this.description = new FormControl('');
    this.visibility = new FormControl('');

    // Initialize FormGroup using FormBuilder
    this.projectForm = this.formBuilder.group({
        name : this.name,
        description : this.description,
        visibility : this.visibility
        //files : this.formBuilder.array([])
    });
    //this.files = <FormArray>this.projectForm.controls['files']
  }

  // Custom Validator
  noSpaceSpecial() : ValidatorFn
  {
    return (projectNameControl: AbstractControl): {[key: string]: boolean} | null => {

      // Check if empty
      if(projectNameControl.value.length == ''){
        return null;
      }

      // Regular Expression for having Space or Special Character
      var reg = new RegExp('^[a-zA-Z0-9\-\_]*$');

      // Return Error Message if test false, otherwise return null
      if(!reg.test(projectNameControl.value)){
        return {'noSpaceSpecial': true};
      }
      else{
        return null;
      }
    }
  }

  /*
  public deleteFormControl(formControl : FormControl){
    let formIndex = this.files.controls.findIndex(x => x === formControl)
    this.files.removeAt(formIndex)
  }

  // Add FormControl to FormGroup for file input
  public fileEvent($event) {

    for (let file of $event.target.files)
    {
      // Check if FormControl already exist
      if((this.files.controls.findIndex(x => x.value.name === file.name)) == -1)
      {
        // Add FormControl to files FormGroup
        this.files.push(new FormControl(file))
      }    
    }

  }
  */

  onSubmit() {
    let projectForm = this.projectForm.value;
    this.projectService.createProject(this.currentUser, projectForm.name, projectForm.visibility, projectForm.description).subscribe(
      result =>{
        this.setProject.emit(result)
        console.log(result)
      },error =>{
        console.log(error)
      }
    )

  }

}
