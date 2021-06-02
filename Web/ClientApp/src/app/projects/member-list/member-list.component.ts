import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { Project } from 'src/app/interfaces/project';
import { ProjectUser } from 'src/app/interfaces/project-user';
import { Input } from '@angular/core';


@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {
    
  constructor() { }

    @Input() project : Project

    membersList: User[] = []

    async ngOnInit() {
      let projectUsers : ProjectUser[] = this.project.projectUsers
      for(let i = 0; i<projectUsers.length; i++ ){
        this.membersList.push(projectUsers[i].user)
      } 
  }
}