import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { AccountService } from '../../../../services/account.service';

@Component({
  selector: 'app-user-display',
  templateUrl: './user-display.component.html',
  styleUrls: ['./user-display.component.scss']
})
export class UserDisplayComponent implements OnInit {

  @Input() user: User;
  @Output() userDeleted : EventEmitter<any> = new EventEmitter<any>();
  @Output() userUpdated : EventEmitter<User> = new EventEmitter<User>();
  statusLoading = false;

  constructor(private accountService: AccountService) { }

  ngOnInit(): void {
  }

  deleteUser() {
      this.accountService.deleteUser(this.user.id).subscribe(res => {
        this.userDeleted.emit();
      })
  }

  isDisabled(): boolean {
    return !!this.user.lockoutEnd && new Date(this.user.lockoutEnd).valueOf() > new Date().valueOf();
  }

  setDisabled(disabled: boolean) {
    this.statusLoading = true;
    this.accountService.setAccountStatus(this.user.id, disabled).subscribe({
      next: (updatedUser) => {
        this.user = updatedUser;
        this.statusLoading = false;
        this.userUpdated.emit(updatedUser);
      },
      error: () => {
        this.statusLoading = false;
      }
    });
  }
}
