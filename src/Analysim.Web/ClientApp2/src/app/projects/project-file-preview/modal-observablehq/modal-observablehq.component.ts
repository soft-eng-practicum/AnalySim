import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { AbstractControl, ValidatorFn, FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'app-modal-observablehq',
  templateUrl: './modal-observablehq.component.html',
  styleUrls: ['./modal-observablehq.component.css']
})
export class ModalObservablehqComponent implements OnInit {

  @Output() loadNotebookEvent = new EventEmitter<string>()

  currentUserID : number

  notebookForm : FormGroup
  notebookLink : FormControl
  isLoading : boolean

  constructor(
    private formBuilder : FormBuilder
  ) {}
  

  ngOnInit() {
    // Set up FormControl and its Validators
    this.notebookLink = new FormControl('', [Validators.required, this.fromObservable(), this.isValidURL()])

     // Initialize FormGroup using FormBuilder
    this.notebookForm = this.formBuilder.group({
      'notebookLink' : this.notebookLink,  
    });
  }

  // Customer Validator
  fromObservable(): ValidatorFn{
    return (modalURLControl: AbstractControl): {[key: string]: boolean} | null => {
      
      // Check if empty
      if(modalURLControl.value == null || modalURLControl.value.length == ''){
        return null;
      }
      
      // Return Error Message if test false, otherwise return null
      if(!modalURLControl.value.includes("observablehq.com")){
        return {'fromObservable': false};
      }
      else{
        return null;
      }
    }
  }

  // Custom Validator
  isValidURL() : ValidatorFn
  {
    return (modalURLControl: AbstractControl): {[key: string]: boolean} | null => {

      // Check if empty
      if(modalURLControl.value == null || modalURLControl.value.length == ''){
        return null;
      }

      // Regular Expression for having Space or Special Character
      var reg = new RegExp('^(https:\/\/)?(www.)?[a-z0-9]+\.[a-z]+(\/[a-zA-Z0-9#@-]+\/?)*$');

      // Return Error Message if test false, otherwise return null
      if(!reg.test(modalURLControl.value)){
        return {'isValidURL': false};
      }
      else{
        return null;
      }
    }
  }

  closeModal(){
    this.notebookForm.reset()
  }

  usePreset(){
    // Show loading icon
    this.isLoading = true;

    this.closeModal()
    this.loadNotebookEvent.emit('observablehq.com/@cengique/csv-dataset-visualization')
  }

  onSubmit(){
    // Variable for FormGroupValue
    let notebookValue = this.notebookForm.value;

    // Show loading icon
    this.isLoading = true;

    this.closeModal()
    this.loadNotebookEvent.emit(notebookValue.notebookLink)
  }

}
