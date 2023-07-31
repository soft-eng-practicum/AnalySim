import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { Notebook } from '../../../../../interfaces/notebook';
import { Project } from '../../../../../interfaces/project';
import { AccountService } from '../../../../../services/account.service';
import { ProjectService } from '../../../../../services/project.service';

@Component({
  selector: 'app-modal-notebook-folder',
  templateUrl: './modal-notebook-folder.component.html',
  styleUrls: ['./modal-notebook-folder.component.scss']
})
export class ModalNotebookFolderComponent implements OnInit {

  @Input() project: Project
  @Output() getNotebooks: EventEmitter<string> = new EventEmitter<string>();
  @Output() closeModal: EventEmitter<any> = new EventEmitter();
  @Input() currentDirectory: string;


  folderForm: FormGroup
  folderName: FormControl
  isLoading: boolean

  constructor(
    private formBuilder: FormBuilder,
    private projectService: ProjectService,
    private accountService: AccountService
  ) { }


  ngOnInit() {

    // Set up FormControl and its Validators
    this.folderName = new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(20), this.noSpaceSpecial()])

    // Initialize FormGroup using FormBuilder
    this.folderForm = this.formBuilder.group({
      'folderName': this.folderName,
    });
  }

  // Customer Validator

  // Custom Validator
  noSpaceSpecial(): ValidatorFn {
    return (projectNameControl: AbstractControl): { [key: string]: boolean } | null => {

      // Check if empty
      if (projectNameControl.value == null || projectNameControl.value.length == '') {
        return null;
      }

      // Regular Expression for having Space or Special Character
      var reg = new RegExp('^[a-zA-Z0-9\-\_]*$');

      // Return Error Message if test false, otherwise return null
      if (!reg.test(projectNameControl.value)) {
        return { 'noSpaceSpecial': true };
      }
      else {
        return null;
      }
    }
  }

  onSubmit() {
    // Variable for FormGroupValue
    let folderValue = this.folderForm.value;

    // Show loading icon
    this.isLoading = true;

    // Register the Account
    this.projectService.createNotebookFolder(this.currentDirectory, folderValue.folderName, this.project.projectID).subscribe(
      result => {
        this.isLoading = false;
        this.closeModal.emit()
        this.getNotebooks.emit(this.currentDirectory);
      },
      error => {
        // Hide Loading Icon
        this.isLoading = false;
      }
    );
  }

}
