import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { NotebookFile, NotebookURL } from 'src/app/interfaces/notebook';
import { ObservableHQDataset } from 'src/app/interfaces/observablehqDatasets';
import { Project } from 'src/app/interfaces/project';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-modal-upload-notebook',
  templateUrl: './modal-upload-notebook.component.html',
  styleUrls: ['./modal-upload-notebook.component.scss']
})
export class ModalUploadNotebookComponent implements OnInit {

  constructor(private formBuilder: FormBuilder,private projectService: ProjectService) { }

  uploadNotebookForm : FormGroup;
  notebookName: FormControl;
  notebookURL: FormControl;
  isLoading: Boolean;
  notebook: NotebookFile;
  existingNotebookURL: NotebookURL;
  showCreateNotebook: Boolean;
  showAddExistingNotebook: Boolean;
  file: File;
  url: string;
  notebookType: "jupyter" | "observablehq" | "collab" = "jupyter";

  datasets : ObservableHQDataset[] = [];


  @Input() project: Project;
  @Output() getNotebooks: EventEmitter<string> = new EventEmitter<string>();
  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Input() currentDirectory: string;

  ngOnInit(): void {
    this.showCreateNotebook = true;

    this.notebookName = new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(20)]);
    this.notebookURL = new FormControl('');

    this.uploadNotebookForm = this.formBuilder.group({
      'notebookName': this.notebookName,
      'notebookURL': this.notebookURL
    });
  }

  onChange(selectedType) {
    if (selectedType === "true") {
      this.showCreateNotebook = true;
      this.showAddExistingNotebook = false;
    }
    else {
      this.showCreateNotebook = false;
      this.showAddExistingNotebook = true;
    }
  }

  onChangeNotebookType(selectedType) {
    this.notebookType = selectedType;
  }

  fileEvent($event)
  {
    this.file=$event.target.files[0];
  }

  urlEvent($event) {
    this.url = $event.target.value;
  }

  addNotebook() {
    if (this.showCreateNotebook) {
      this.notebook = {
        'file': this.file,
        'name': this.notebookName.value,
        'projectID': this.project.projectID,
      }
      this.projectService.uploadNotebook(this.notebook, this.currentDirectory).subscribe(result => {
        console.log(result);
        this.closeModal.emit();
        this.getNotebooks.emit(this.currentDirectory);
      });
    }
    if (this.showAddExistingNotebook) {
      if(this.notebookType==="observablehq")
      {
        let datasetMap ={

        }
        let params = [];
        for(let dataset of this.datasets)
        {
          let trimmedDatasetName = dataset.datasetName.trim().toLowerCase();
          if(!(trimmedDatasetName in datasetMap))
          {
            datasetMap[trimmedDatasetName] = true;
            params.push(trimmedDatasetName+'='+dataset.datasetURL);
          }
          else{
            alert("All the dataset names must be unique");
            return;
          }
        };

      }
      this.existingNotebookURL = {
        'url': this.url,
        'name': this.notebookName.value,
        'projectID': this.project.projectID,
        'type': this.notebookType,
        'datasets': this.datasets
      }
      this.projectService.uploadExistingNotebook(this.existingNotebookURL, this.currentDirectory).subscribe(result => {
        console.log(result);
        this.closeModal.emit();
        this.getNotebooks.emit(this.currentDirectory);
      });
    }
  }

  addDataset(){
    this.datasets.push({
      datasetName: "",
      datasetURL: "",
    })
    console.log(this.datasets);
  }

  removeDataset(index){
    this.datasets.splice(index,1);
  }

  changeDatasetName(index,$event){
    this.datasets[index].datasetName = $event.target.value;
  }

  changeDatasetURL(index,$event){
    this.datasets[index].datasetURL = $event.target.value;
  }



}
