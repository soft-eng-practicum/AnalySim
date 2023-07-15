import { Component, Input, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { Notebook } from '../../../../../interfaces/notebook';

@Component({
  selector: 'app-project-notebook-item',
  templateUrl: './project-notebook-item.component.html',
  styleUrls: ['./project-notebook-item.component.scss']
})
export class ProjectNotebookItemComponent implements OnInit {

  constructor(private modalService: BsModalService) { }


  @Input() notebook: Notebook;
  @ViewChild('displayNotebookModal') displayNotebookModal: TemplateRef<any>;

  displayNotebookModalRef: BsModalRef;

  ngOnInit(): void {
    console.log(this.notebook);
  }

  showNotebook() {
    this.displayNotebookModalRef = this.modalService.show(this.displayNotebookModal);
  }

}
