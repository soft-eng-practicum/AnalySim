import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { ProjectUser } from 'src/app/interfaces/project-user';

@Component({
  selector: 'app-project-list-users',
  templateUrl: './project-list-users.component.html',
  styleUrls: ['./project-list-users.component.scss']
})
export class ProjectListUsersComponent implements OnInit {

  constructor() { }

  @Input() projectUsers : ProjectUser[]
  @Output() removeProjectUsers = new EventEmitter<ProjectUser[]>()

  ngOnInit(): void {
  }

  removeProjectUser(projectUser : ProjectUser){
    let index = this.projectUsers.indexOf(projectUser,0)
    if (index > -1) {
      this.projectUsers.splice(index, 1);
    }

    this.removeProjectUsers.emit(this.projectUsers)
  }

  

}
