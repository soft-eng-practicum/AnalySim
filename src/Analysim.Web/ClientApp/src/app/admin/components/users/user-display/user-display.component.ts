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
  constructor(private accountService: AccountService) { }

  ngOnInit(): void {
  }

  deleteUser() {
      this.accountService.deleteUser(this.user.id).subscribe(res => {
        this.userDeleted.emit();
      })
  }

}
