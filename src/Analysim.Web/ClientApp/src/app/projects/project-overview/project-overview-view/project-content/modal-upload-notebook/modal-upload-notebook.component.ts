import { Component, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Notebook } from 'src/app/interfaces/notebook';
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
  notebookName : FormControl;
  isLoading: Boolean;
  notebook: Notebook;

  @Input() project : Project;

  ngOnInit(): void {

    this.notebookName = new FormControl('',[Validators.required, Validators.minLength(1), Validators.maxLength(20)]);

    this.uploadNotebookForm = this.formBuilder.group({
      'notebookName': this.notebookName
    });
  }

  fileEvent($event)
  {
    let file: File = $event.target.files[0];
    this.notebook ={
      'file': file,
      'name': this.notebookName.value,
      'projectID': this.project.projectID
    }
  }

  addNotebook (){
    this.projectService.uploadNotebook(this.notebook).subscribe(result=>{
      console.log(result);
    });
  }



}
