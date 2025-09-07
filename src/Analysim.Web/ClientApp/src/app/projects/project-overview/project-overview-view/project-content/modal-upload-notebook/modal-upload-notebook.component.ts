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

  constructor(private formBuilder: FormBuilder, private projectService: ProjectService) { }

  uploadNotebookForm: FormGroup;
  notebookName: FormControl;
  notebookURL: FormControl;
  notebookFile: FormControl;
  isLoading: Boolean;
  notebook: NotebookFile;
  existingNotebookURL: NotebookURL;
  showCreateNotebook: Boolean;
  showAddExistingNotebook: Boolean;
  showBlankNotebook: boolean;
  file: File;
  url: string;
  notebookType: "jupyter" | "observablehq" | "colab" = "jupyter";

  datasets: ObservableHQDataset[] = [];


  @Input() project: Project;
  @Output() getNotebooks: EventEmitter<string> = new EventEmitter<string>();
  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Input() currentDirectory: string;

  ngOnInit(): void {
    // console.log(this.project);
    this.showCreateNotebook = true;
    this.showAddExistingNotebook = false;
    this.showBlankNotebook = false;

    this.notebookName = new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(20)]);
    this.notebookURL = new FormControl('');
    this.notebookFile = new FormControl(null);

    this.uploadNotebookForm = this.formBuilder.group({
      'notebookName': this.notebookName,
      'notebookURL': this.notebookURL,
      'notebookFile': this.notebookFile
    });

    this.applyModeValidators('file');
  }

  private applyModeValidators(mode: string) {
    if (mode === 'file') {
      this.notebookFile.setValidators([Validators.required]);
      this.notebookURL.clearValidators();
    } else if (mode === 'url'){
      this.notebookURL.setValidators([
        Validators.required,
        Validators.pattern(/^(https?:\/\/)[^\s]+$/i)
      ]);
      this.notebookFile.clearValidators();
    } else { 
      this.notebookFile.clearValidators();
      this.notebookURL.clearValidators();
    }
    this.notebookFile.updateValueAndValidity();
    this.notebookURL.updateValueAndValidity();
  }

  onChange(selected: string) {
    this.showCreateNotebook = selected === 'file';
    this.showAddExistingNotebook = selected === 'url';
    this.showBlankNotebook = selected === 'blank';

    this.applyModeValidators(selected as 'file' | 'url' | 'blank');
  }

  onChangeNotebookType(selectedType) {
    this.notebookType = selectedType;
  }

  fileEvent($event) {
    const input = $event.target as HTMLInputElement;
    this.file = (input.files && input.files[0]) || null;
    this.uploadNotebookForm.patchValue({ notebookFile: this.file });
    this.notebookFile.updateValueAndValidity();
  }

  urlEvent($event) {
    const input = $event.target as HTMLInputElement;
    this.url = input.value;
    this.uploadNotebookForm.patchValue({ notebookURL: this.url });
    this.notebookURL.updateValueAndValidity();
  }

  private buildBlankNotebookFile(): File {
    const title = this.notebookName.value?.trim() || 'Untitled';
    const content = {
      cells: [
        {
          cell_type: 'code',
          metadata: {},
          source: [``]
        }
      ],
      metadata: {},
      nbformat: 4,
      nbformat_minor: 2
    };
    const blob = new Blob([JSON.stringify(content, null, 2)], { type: 'application/json' });
    return new File([blob], `${title}.ipynb`, { type: 'application/json' });
  }

  addNotebook() {

    for(let notebook of this.project.notebooks){
      if(notebook.name.toLowerCase() === this.notebookName.value.toLowerCase() && notebook.extension === ".ipynb"){
        alert("Notebook name must be unique");
        return;
      }
    }
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
      return;
    }

    if (this.showAddExistingNotebook) {
      if (this.notebookType === "observablehq") {
        let datasetMap = {

        }
        let params = [];
        for (let dataset of this.datasets) {
          let trimmedDatasetName = dataset.datasetName.trim().toLowerCase();
          if (!(trimmedDatasetName in datasetMap)) {
            datasetMap[trimmedDatasetName] = true;
            params.push(trimmedDatasetName + '=' + dataset.datasetURL);
          }
          else {
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
      // console.log("Existing Notebook URL: ", this.existingNotebookURL);
      this.projectService.uploadExistingNotebook(this.existingNotebookURL, this.currentDirectory).subscribe(result => {
        console.log(result);
        this.closeModal.emit();
        this.getNotebooks.emit(this.currentDirectory);
      });
      return;
    }

    if (this.showBlankNotebook) {
      const blankFile = this.buildBlankNotebookFile();
      const payload: NotebookFile = {
        file: blankFile,
        name: this.notebookName.value,
        projectID: this.project.projectID
      };
      this.projectService.uploadNotebook(payload, this.currentDirectory).subscribe(result => {
        this.closeModal.emit();
        this.getNotebooks.emit(this.currentDirectory);
      });
      return;
    }
  }

  addDataset() {
    this.datasets.push({
      datasetName: "",
      datasetURL: "",
      blobFileID: 0,
    })
    console.log(this.datasets);
  }

  removeDataset(index) {
    this.datasets.splice(index, 1);
  }

  changeDatasetName(index, $event) {
    this.datasets[index].datasetName = $event.target.value;
  }

  changeDatasetURL(index, $event) {
    this.datasets[index].datasetURL = $event.target.value;
  }



}
