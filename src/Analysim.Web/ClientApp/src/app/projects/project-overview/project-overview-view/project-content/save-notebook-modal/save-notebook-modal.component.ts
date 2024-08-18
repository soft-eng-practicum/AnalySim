import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-save-notebook-modal',
  templateUrl: './save-notebook-modal.component.html',
  styleUrls: ['./save-notebook-modal.component.scss']
})
export class SaveNotebookModalComponent implements OnInit {

  @Input() loading: boolean;
  @Output() saveNotebook = new EventEmitter<void>();
  @Output() cancelSave = new EventEmitter<void>();

  ngOnInit(): void {
    console.log('SaveNotebookModalComponent loaded');
  }

  onConfirmSave() {
    this.saveNotebook.emit();
  }

  onCancelSave() {
    this.cancelSave.emit();
  }

}
