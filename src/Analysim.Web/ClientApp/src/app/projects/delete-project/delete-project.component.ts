import { Component, OnInit } from '@angular/core';
import { ProjectService } from 'src/app/services/project.service';
import { AccountService } from 'src/app/services/account.service';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
  selector: 'app-delete-project',
  templateUrl: './delete-project.component.html',
  styleUrls: ['./delete-project.component.css']
})
export class DeleteProjectComponent implements OnInit {

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private projectService: ProjectService,
    private modalService: BsModalService,
  ) { }

  ngOnInit(): void {
  }


  confirmationPopUp() {
    // if user is not log in
    if (!this.accountService.checkLoginStatus()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } })
    } else {
      console.log("Delete Confirmation should pop up")
    }
  }

}
