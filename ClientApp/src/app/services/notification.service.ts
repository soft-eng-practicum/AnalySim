import { Injectable } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
  providedIn: 'root'
})

export class NotificationService {

  constructor(private toastr: ToastrService) {
    this.toastr.toastrConfig.positionClass = "toast-bottom-right";
  }

  showSuccess(message, title){
    this.toastr.success(message, title)
  }

  showInfo(message, title){
    this.toastr.info(message, title)
  }

  showMessage(message, title){
    this.toastr.error(message, title)
  }

  showWarning(message, title){
    this.toastr.warning(message, title)
  }
}