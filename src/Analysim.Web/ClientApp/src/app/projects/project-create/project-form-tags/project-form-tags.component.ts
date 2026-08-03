import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, FormControl, Validators } from '@angular/forms';
import { ProjectService } from 'src/app/services/project.service';
import { ProjectTag } from 'src/app/interfaces/project-tag';

@Component({
  selector: 'app-project-form-tags',
  templateUrl: './project-form-tags.component.html',
  styleUrls: ['./project-form-tags.component.scss']
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
    this.tagName = new FormControl('', [Validators.required]);

    // Initialize FormGroup using FormBuilder
    this.tagForm = this.formBuilder.group({
      tagName: this.tagName,
    });
  }

  public onSubmit(){
    if (this.tagForm.invalid) return;

    let tagForm = this.tagForm.value
    let tagName = tagForm.tagName?.trim();
    if (!tagName) return;

    if (!this.projectTags) {
      this.projectTags = [];
    }

    this.projectService.addTag(this.projectID, tagName).subscribe(
      result => {
        this.projectTags.push(result)
        this.updateProjectTags.emit(this.projectTags)
        this.tagForm.reset()
      }, error =>{
        console.log(error)
      }
    )
  }
}
