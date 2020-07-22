import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProjectService } from 'src/app/services/project.service';
import { ProjectTag } from 'src/app/interfaces/project-tag';
import { FormGroup, FormControl } from '@angular/forms';

@Component({
  selector: 'app-project-tag',
  templateUrl: './project-tag.component.html',
  styleUrls: ['./project-tag.component.css']
})
export class ProjectTagComponent implements OnInit {

  @Input() projectTag : ProjectTag
  @Output() deletedTag = new EventEmitter<ProjectTag>()

  

  constructor(private projectService : ProjectService) { }

  ngOnInit(): void {
  }

  deleteTag(){
    this.projectService.removeTag(this.projectTag.projectID, this.projectTag.tagID).subscribe(
      result => {
        this.deletedTag.emit(this.projectTag)
        console.log(result)
      }, error =>{
        console.log(error)
      }
    )
  }

}
