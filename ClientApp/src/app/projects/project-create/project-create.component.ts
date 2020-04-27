import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { ProjectService } from 'src/app/services/project.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-project-create',
  templateUrl: './project-create.component.html',
  styleUrls: ['./project-create.component.css']
})
export class ProjectCreateComponent implements OnInit {

  // Form Control - Create Project
  projectForm: FormGroup;
  name: FormControl;
  description: FormControl;
  visibility: FormControl;
  

  isLoading : boolean;
  //files: FormArray;
  key: string;

  constructor(private projectService : ProjectService,
    private formBuilder : FormBuilder,
    private router : Router,
    //private fileService : FileService
    ) { }


  ngOnInit() {
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

    // Initialize FormGroup using FormBuilder
    //this.files = <FormArray>this.projectForm.controls['files']
    // Key for storing temp file
    this.key = this.makeString();
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
      var reg = new RegExp('^(\d|\w)+$');

      // Return Error Message if test false, otherwise return null
      if(!reg.test(projectNameControl.value)){
        return {'noSpaceSpecial': true};
      }
      else{
        return null;
      }
    }
  }

  // Make Random 32 Character String
  makeString(): string {
    let outString: string = '';
    let inOptions: string = 'abcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 32; i++) {

      outString += inOptions.charAt(Math.floor(Math.random() * inOptions.length));

    }

    return outString;
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
    this.router.navigateByUrl('/projects/testuser/gasdgasdg');

    /*
    this.projectService.CreateProject(projectForm).subscribe(
      result =>{
        console.log('/projects/' + result.route)
        

      },error =>{
        console.log('Error:' + error)
      }
    )
    */

  }

}
