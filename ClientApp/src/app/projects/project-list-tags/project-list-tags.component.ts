import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProjectTag } from 'src/app/interfaces/project-tag';

@Component({
  selector: 'app-project-list-tags',
  templateUrl: './project-list-tags.component.html',
  styleUrls: ['./project-list-tags.component.css']
})
export class ProjectListTagsComponent implements OnInit {

  constructor() { }

  @Input() projectTags : ProjectTag[]
  @Output() updateProjectTags = new EventEmitter<ProjectTag[]>()

  ngOnInit(): void {
  }

  updateProjectTag(projectTags : ProjectTag){
    let index = this.projectTags.indexOf(projectTags,0)
    if (index > -1) {
      this.projectTags.splice(index, 1);
    }
    this.updateProjectTags.emit(this.projectTags)
  }

}
