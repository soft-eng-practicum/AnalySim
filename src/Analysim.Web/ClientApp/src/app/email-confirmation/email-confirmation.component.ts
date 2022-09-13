import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AccountService } from 'src/app/services/account.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { User } from 'src/app/interfaces/user';

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
  ) { }

  async ngOnInit(): Promise<void> {
    CheckEmailToken: Boolean = null;
  }
}
