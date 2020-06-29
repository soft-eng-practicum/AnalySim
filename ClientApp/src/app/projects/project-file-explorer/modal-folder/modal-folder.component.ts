import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal';
import { FormGroup, FormControl, Validators, FormBuilder, ValidatorFn, AbstractControl } from '@angular/forms';
import { BlobFile } from 'src/app/interfaces/blob-file';
import { BlobFileItem } from 'src/app/interfaces/blob-file-item';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-modal-folder',
  templateUrl: './modal-folder.component.html',
  styleUrls: ['./modal-folder.component.css']
})
export class ModalFolderComponent implements OnInit {

  @Input() folderModalRef : BsModalRef
  @Input() blobList : BlobFileItem[]
  @Input() currentDirectory : string
  @Input() projectID : number
  @Output() newFolderEvent = new EventEmitter<BlobFile>()

  folderForm : FormGroup
  folderName : FormControl
  isLoading : boolean

  constructor(
    private formBuilder : FormBuilder,
    private projectService : ProjectService
  ) {}

  ngOnInit() {
    // Set up FormControl and its Validators
    this.folderName = new FormControl('', [Validators.required, Validators.minLength(1), Validators.maxLength(20), this.noMatch(), this.noSpaceSpecial()])

     // Initialize FormGroup using FormBuilder
    this.folderForm = this.formBuilder.group({
      'folderName' : this.folderName,  
    });
  }

  // Customer Validator
  noMatch(): ValidatorFn{
    return (folderNameControl: AbstractControl): {[key: string]: boolean} | null => {
      
      // Check if empty
      if(folderNameControl.value == null || folderNameControl.value.length == ''){
        return null;
      }

      // Return Error Message if test false, otherwise return null
      if(this.blobList.findIndex(x => x.redirect == (this.currentDirectory + folderNameControl.value + "/")) > -1){
        return {'noMatch': true};
      }
      else{
        return null;
      }
    }
  }

  // Custom Validator
  noSpaceSpecial() : ValidatorFn
  {
    return (projectNameControl: AbstractControl): {[key: string]: boolean} | null => {

      // Check if empty
      if(projectNameControl.value == null || projectNameControl.value.length == ''){
        return null;
      }

      // Regular Expression for having Space or Special Character
      var reg = new RegExp('^[a-zA-Z0-9\-\_]*$');

      // Return Error Message if test false, otherwise return null
      if(!reg.test(projectNameControl.value)){
        return {'noSpaceSpecial': true};
      }
      else{
        return null;
      }
    }
  }

  closeModal(){
    this.folderModalRef.hide()
    this.folderForm.reset()
  }

  onSubmit(){
    // Variable for FormGroupValue
    let folderValue = this.folderForm.value;

    // Show loading icon
    this.isLoading = true;

    // Register the Account
    this.projectService.createFolder(this.currentDirectory + folderValue.folderName + "/", 1 , this.projectID).subscribe(
      result => {
        this.isLoading = false;
        this.closeModal()
        this.newFolderEvent.emit(result)
      },
      error => {
        // Hide Loading Icon
        this.isLoading = false;
      }
    );
  }


}
