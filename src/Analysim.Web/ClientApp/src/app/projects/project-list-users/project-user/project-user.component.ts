import { Component, OnInit, Input, EventEmitter, Output } from '@angular/core';
import { ProjectUser } from 'src/app/interfaces/project-user';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-project-user',
  templateUrl: './project-user.component.html',
  styleUrls: ['./project-user.component.css']
})
export class ProjectUserComponent implements OnInit {

  constructor(private projectService : ProjectService) { }

  @Input() projectUser : ProjectUser
  @Output() updatedUser = new EventEmitter<ProjectUser>()
  @Output() removedUser = new EventEmitter<ProjectUser>()

  roles: any[] = ['member', 'admin'];

  ngOnInit(): void {
  }

  updateUser(role : string){
    this.projectUser.userRole = role.toLowerCase();
    this.projectService.updateUser(this.projectUser).subscribe(
      result => {
        this.updatedUser.emit(this.projectUser)
      }, error =>{
        console.log(error)
      }
    )
  }

  deleteUser(){
    this.projectService.removeUser(this.projectUser.projectID, this.projectUser.userID).subscribe(
      result => {
        this.removedUser.emit(this.projectUser)
      }, error =>{
        console.log(error)
      }
    )
  }

}
