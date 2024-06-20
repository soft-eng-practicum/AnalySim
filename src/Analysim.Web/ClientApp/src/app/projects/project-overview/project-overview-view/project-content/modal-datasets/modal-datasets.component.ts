import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Notebook } from 'src/app/interfaces/notebook';
import { Project } from 'src/app/interfaces/project';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-modal-datasets',
  templateUrl: './modal-datasets.component.html',
  styleUrls: ['./modal-datasets.component.scss']
})
export class ModalDatasetsComponent implements OnInit {

  isLoading: Boolean;
  fileTree: any;

  @Output() closeModal: EventEmitter<any> = new EventEmitter();

  @Input() notebook: Notebook;
  @Input() project: Project;

  blobFiles = [
    {
      directory: "test/",
      name: "test.txt",
    },
    {
      directory: "test/hero/",
      name: "hero.txt",
    },
    {
      directory: "honda/",
      name: "honda.txt",
    }
  ]

  constructor(private projectService: ProjectService) { }

  ngOnInit(): void {
    console.log("received notebook in datasets : ", this.notebook);
    console.log("received project in datasets : ", this.project);
    this.fileTree = this.organizeFiles(this.project.blobFiles);
    console.log("fileTree : ", this.fileTree);
  }

  toggleFolder(folder: any): void {
    folder.open = !folder.open;
    console.log("folder toggled: ", folder);
  }

  organizeFiles(blobFiles: any[]) {
    const fileTree: any = { __files__: [] };

    blobFiles.forEach(file => {
      const parts = file.directory ? file.directory.split('/') : [];
      if (parts.length > 0) {
        parts.splice(parts.length - 1, 1);
      }
      console.log("parts : ", parts);
      let current = fileTree;

      parts.forEach(part => {
        if (part) {
          if (!current.hasOwnProperty(part)) {
            current[part] = { __files__: [], open: Boolean(false) };
          }
          current = current[part];
        }
      });

      if (file.extension !== ".$$") {
        current.__files__.push(file);
      }
    });

    return fileTree;
  }

}
