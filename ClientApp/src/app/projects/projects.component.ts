import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl, FormArray } from '@angular/forms';
import { ProjectService } from '../services/project.service';
import { FileService } from '../services/file.service';
import { AccountService } from '../services/account.service';


@Component({
  selector: 'app-projects',
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.css']
})
export class ProjectsComponent implements OnInit {

  isLoading : boolean;
  projectForm: FormGroup;
  projectName: FormControl;
  description: FormControl;
  files: FormArray;
  key: string;

  constructor(private acct : ProjectService, 
    private formBuilder : FormBuilder,
    private fileService : FileService
    ) { }


  ngOnInit() {
    this.isLoading = false;

    // Initialize Form Controls
    this.projectName = new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(20), this.noSpaceSpecial()]);
    this.description = new FormControl('');

    // Initialize FormGroup using FormBuilder
    this.projectForm = this.formBuilder.group({
        projectName : this.projectName,
        description : this.description,
        files : this.formBuilder.array([])
    });

    // Initialize FormGroup using FormBuilder
    this.files = <FormArray>this.projectForm.controls['files']
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

  onSubmit() {
    let userLogin = this.projectForm.value;

    /*
    this.fileService.upload(userLogin.file).subscribe(
      result => {
        console.log(result);
      },
      error => {        
        console.log(error);
      }
    );
    */
  }

}
