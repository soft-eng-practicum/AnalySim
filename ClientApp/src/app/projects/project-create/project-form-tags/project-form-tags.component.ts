import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormArray, FormControl } from '@angular/forms';
import { ProjectService } from 'src/app/services/project.service';
import { Project } from 'src/app/interfaces/project';
import { ProjectTag } from 'src/app/interfaces/project-tag';

@Component({
  selector: 'app-project-form-tags',
  templateUrl: './project-form-tags.component.html',
  styleUrls: ['./project-form-tags.component.css']
})
export class ProjectFormTagsComponent implements OnInit {

  constructor(
    private projectService : ProjectService,
    private formBuilder : FormBuilder,
  ) { }

  // Form Control - Project Tag/Role
  @Input() projectID : number
  @Input() projectTags : ProjectTag[]
  @Output() updateProjectTags = new EventEmitter<ProjectTag[]>()
  tagForm: FormGroup
  tagName: FormControl

  ngOnInit(): void {

    // Initialize FormGroup using FormBuilder
    this.tagForm = this.formBuilder.group({
      tagName: this.tagName,
    });

    this.tagName = new FormControl('');
  }

  public onSubmit(){
    let tagForm = this.tagForm.value

    this.projectService.addTag(this.projectID, tagForm.tagName).subscribe(
      result => {
        this.projectTags.push(result)
        this.updateProjectTags.emit(this.projectTags)
        console.log(result)
      }, error =>{
        console.log(error)
      }
    )

    this.tagForm.reset()
  }
}
