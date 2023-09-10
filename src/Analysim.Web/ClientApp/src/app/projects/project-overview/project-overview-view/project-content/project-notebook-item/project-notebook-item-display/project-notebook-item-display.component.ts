import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { Notebook } from '../../../../../../interfaces/notebook';
import { ProjectService } from '../../../../../../services/project.service';

@Component({
  selector: 'app-project-notebook-item-display',
  templateUrl: './project-notebook-item-display.component.html',
  styleUrls: ['./project-notebook-item-display.component.scss']
})
export class ProjectNotebookItemDisplayComponent {


  @Input() notebook: Notebook;

  @Output() closeModal : EventEmitter<any> = new EventEmitter();

  constructor(private projectService: ProjectService, private _renderer2: Renderer2) { }

  @ViewChild('observablehqPanel', { read: ElementRef }) observablehqPanel;

  ngAfterViewInit() {
    this.fetchNotebook();
  }

  generateObservableNotebook() {

    let script = this._renderer2.createElement('script');
    script.type = `module`;
    script.text = this.generateScript;
    this._renderer2.appendChild(this.observablehqPanel.nativeElement, script);
  }

  get generateScript(): String {
    return ` import {Runtime, Inspector} from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js";
    var notebookLink = "https://api.` + this.notebook.uri.replace("https://", "") + `.js?v=3";
    import(notebookLink).then((define) =>{
        var notebook = define.default;
        (new Runtime).module(notebook, name =>{
            return Inspector.into("#notebook")();
        });
    });`
  }

  fetchNotebook() {
    console.log(this.notebook);
    if (this.notebook.type === "observable") {
      this.generateObservableNotebook()
    }
    else {
      this.projectService.downloadNotebook(this.notebook).subscribe(result => {
        var reader = new FileReader();
        reader.onload = function (e) {
          const resultFile: any = this.result;
          var parsed = JSON.parse(resultFile);
        };
        reader.readAsText(result);
      })
    }
    
  }

  closeNotebook() {
    this.closeModal.emit();
  }


}
