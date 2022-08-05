import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { User } from 'src/app/interfaces/user';
import { AccountService } from 'src/app/services/account.service';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-modal-delete',
  templateUrl: './modal-delete.component.html',
  styleUrls: ['./modal-delete.component.css']
})
export class ModalDeleteComponent implements OnInit {
  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private accountService: AccountService,
    private projectService: ProjectService,
    private modalService: BsModalService,
  ) { }

  @Input() deleteModalRef: BsModalRef
  @Input() projectID: number;
  @Input() currentUser: User;

  ngOnInit(): void {
  }

  DeleteProject() {
    this.projectService.deleteProject(this.projectID).subscribe(
      result => {
        this.router.navigate(['/home'])
        this.closeModal()
      }, error => {
        console.log(error);
      }
    )
  }

  DeleteProjectClick() {
    this.DeleteProject();
  }

  closeModal() {
    this.deleteModalRef.hide()
  }

  confirmationPopUp() {
    // if user is not log in
    if (!this.accountService.checkLoginStatus()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: this.router.url } })
    } else {
      console.log("Delete Confirmation should pop up")
      // this.toggleModalFork()//fork model pops up
    }
  }
}
