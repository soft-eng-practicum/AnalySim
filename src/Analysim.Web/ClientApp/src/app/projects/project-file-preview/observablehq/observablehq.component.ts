import { Component, OnInit, Inject, Input, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-observablehq',
  templateUrl: './observablehq.component.html',
  styleUrls: ['./observablehq.component.scss']
})
export class ObservablehqComponent{

  constructor(
    private _renderer2: Renderer2, 
    @Inject(DOCUMENT) private _document: Document, 
    private router: Router,
    private route: ActivatedRoute
  ) { }

  @Input() observableNotebookLink : string
  @Input() blobUri : string


  @ViewChild('observablehqPanel', {read: ElementRef}) observablehqPanel;

  ngAfterViewInit() {

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        API: this.blobUri
      }
    });

    let script = this._renderer2.createElement('script');
    script.type = `module`;
    script.text = this.generateScript;
    this._renderer2.appendChild(this.observablehqPanel.nativeElement, script);
  }

  get generateScript() : String{
    return ` import {Runtime, Inspector} from "https://cdn.jsdelivr.net/npm/@observablehq/runtime@4/dist/runtime.js";
    var notebookLink = "https://api.` + this.observableNotebookLink.replace("https://", "") + `.js?v=3";
    import(notebookLink).then((define) =>{
        var notebook = define.default;
        (new Runtime).module(notebook, name =>{
            return Inspector.into("#notebook")();
        });
    });`
  }

}
