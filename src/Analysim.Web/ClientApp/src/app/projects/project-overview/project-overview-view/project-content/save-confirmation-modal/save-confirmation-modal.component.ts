import { Component, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-save-confirmation-modal',
  templateUrl: './save-confirmation-modal.component.html',
  styleUrls: ['./save-confirmation-modal.component.scss']
})
export class SaveConfirmationModalComponent {
  @Output() confirmSave = new EventEmitter<void>();
  @Output() cancelSave = new EventEmitter<void>();

  ngOnInit(): void {
    console.log('SaveConfirmationModalComponent loaded');
  }

  onConfirmSave() {
    this.confirmSave.emit();
  }

  onCancelSave() {
    this.cancelSave.emit();
  }
}
