import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Notebook } from 'src/app/interfaces/notebook';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-modal-rename-notebook',
  templateUrl: './modal-rename-notebook.component.html',
  styleUrls: ['./modal-rename-notebook.component.scss']
})
export class ModalRenameNotebookComponent implements OnInit {


  renameNotebookForm : FormGroup;
  notebookName: FormControl;
  isLoading: Boolean;

  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Output() renameNotebookEvent: EventEmitter<string> = new EventEmitter<string>();

  @Input() notebook: Notebook;

  constructor(private formBuilder: FormBuilder,private projectService: ProjectService) { }


  ngOnInit(): void {
    this.notebookName = new FormControl('', [Validators.required]);
    
    this.renameNotebookForm = this.formBuilder.group({
      'notebookName': this.notebookName,
    });
  }

  renameNotebook(): void{
    this.projectService.renameNotebook(this.notebook.notebookID,this.notebookName.value).subscribe(result => {
      console.log(result);
      this.closeModal.emit();
      this.renameNotebookEvent.emit(result.name);
    });
  }

}
