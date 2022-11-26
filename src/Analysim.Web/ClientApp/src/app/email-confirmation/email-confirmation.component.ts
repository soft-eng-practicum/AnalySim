import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from 'src/app/services/account.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { User } from 'src/app/interfaces/user';
import { NotificationService } from '../services/notification.service';

@Component({
  selector: 'app-email-confirmation',
  templateUrl: './email-confirmation.component.html',
  styleUrls: ['./email-confirmation.component.css']
})
export class EmailConfirmationComponent implements OnInit {


  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private modalService: BsModalService,
    public notfi: NotificationService
  ) { }

  async ngOnInit(): Promise<void> {
    this.router.navigate(['/login']);
    this.notfi.showInfo('Email Confirmation Successful','You can now login!');
    CheckEmailToken: Boolean = null;
  }
}
