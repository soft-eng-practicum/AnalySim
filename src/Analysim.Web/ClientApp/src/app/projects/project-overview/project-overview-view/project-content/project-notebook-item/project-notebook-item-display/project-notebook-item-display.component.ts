import { Component, Input, OnInit } from '@angular/core';
import { Notebook } from '../../../../../../interfaces/notebook';
import { ProjectService } from '../../../../../../services/project.service';

@Component({
  selector: 'app-project-notebook-item-display',
  templateUrl: './project-notebook-item-display.component.html',
  styleUrls: ['./project-notebook-item-display.component.scss']
})
export class ProjectNotebookItemDisplayComponent implements OnInit {


  @Input() notebook: Notebook;

  constructor(private projectService: ProjectService) { }

  ngOnInit() {
    this.fetchNotebook();
  }


  fetchNotebook() {
    if (this.notebook.type === "observable") {

    }
    else {
      this.projectService.downloadNotebook(this.notebook).subscribe(result => {
        var reader = new FileReader();
        reader.onload = function (e) {
          const resultFile: any = this.result;
          var parsed = JSON.parse(resultFile);
          console.log(parsed);
        };
        reader.readAsText(result);
      })
    }
    
  }


}
