import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormBuilder, Validators, ValidatorFn, AbstractControl } from '@angular/forms';
import { ProjectService } from '../services/project.service';

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
  procedure: FormControl;
  data: FormControl;

  constructor(private acct : ProjectService, 
    private formBuilder : FormBuilder,
    ) { }

  ngOnInit() {
    this.isLoading = false;

    // Initialize Form Controls
    this.projectName = new FormControl('', [Validators.required, Validators.minLength(5), Validators.maxLength(20), this.noSpaceSpecial()]);
    this.description = new FormControl('');
    this.procedure = new FormControl('');

     // Initialize FormGroup using FormBuilder
    this.projectForm = this.formBuilder.group({
        'projectName' : this.projectName,
        'description' : this.description,
        'procedure' : this.procedure,
        'data' : this.data
    });
  }

  noSpaceSpecial() : ValidatorFn
  {
    return (projectNameControl: AbstractControl): {[key: string]: boolean} | null => {

      if(projectNameControl.value.length == ''){
        return null;
      }

      var reg = new RegExp('^(\d|\w)+$');
      if(!reg.test(projectNameControl.value)){
        return {'noSpaceSpecial': true};
      }
      else{
        return null;
      }
    }
  }

  onSubmit() {

  }

}
