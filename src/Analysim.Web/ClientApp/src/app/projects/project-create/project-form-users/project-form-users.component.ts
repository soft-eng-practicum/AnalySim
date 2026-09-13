import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Project } from 'src/app/interfaces/project';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { ProjectService } from 'src/app/services/project.service';
import { User } from 'src/app/interfaces/user';
import { AccountService } from 'src/app/services/account.service';
import { ProjectMembershipRequest } from 'src/app/interfaces/project-membership-request';

@Component({
  selector: 'app-project-form-users',
  templateUrl: './project-form-users.component.html',
  styleUrls: ['./project-form-users.component.scss']
})
export class ProjectFormUsersComponent implements OnInit {

  constructor(
    private projectService : ProjectService,
    private formBuilder : FormBuilder,
    private accountService : AccountService) { }

  // Form Control - Project Tag/Role
  @Input() project : Project
  @Input() membershipRequests : ProjectMembershipRequest[] = []
  @Output() invitationCreated = new EventEmitter<ProjectMembershipRequest>()
  users : User[] = []
  filteredUsers : User[] = []
  userForm: FormGroup
  userName: FormControl
  invitationMessage: string = ''

  ngOnInit(): void {
    this.loadUser()

    this.accountService.getUserList().subscribe(
      result => 
      {
        this.users = result
      }
    )

    this.userName = new FormControl('');
    this.userForm = this.formBuilder.group({
      userName: this.userName,
    });

    this.userForm.get("userName").valueChanges.subscribe(
      val => {
        this.filteredUsers =this.filterUser(val)
      }
    )
  }

  public filterUser(val : string) : User[]{
    let count = 0
    if(val == null || val == "")
      return []

    var existingUserIDs : number[] = []
    this.project.projectUsers
    .forEach(x => { 
      if(x.userRole != "follower"){
        existingUserIDs.push(x.userID)
      }   
    })

    return this.users.filter(x => {
      if(count < 5){
        let hasPendingMembershipRequest = this.membershipRequests.find(request =>
          request.targetUserID == x.id &&
          request.status == "pending") != undefined

        if(x.userName.toLowerCase().indexOf(val.toLowerCase()) != -1 &&
          existingUserIDs.find(userID => x.id == userID) == undefined &&
          !hasPendingMembershipRequest){
          count++
          return true
        }  
      }
      else {
        return false
      }
      return false;
    })
    
  }

  public inviteUser(user : User){
    this.invitationMessage = ''

    this.projectService.inviteProjectMember(this.project.projectID, user.id).subscribe(
      result => {
        this.invitationCreated.emit(result)
        this.invitationMessage = "Invitation sent to " + user.userName
      }, error =>{
        console.log(error)
        this.invitationMessage = error?.error?.message || "Failed to send invitation."
      }
    )
    this.userForm.reset() 
  }

  public loadUser(){
    let userIDs : number[] = this.project.projectUsers.map(pu => pu.userID)
    
    this.accountService.getUserRange(userIDs).subscribe(
      result =>{
        
        // Map Project in Project User
        this.project.projectUsers.map(pu => pu.user = result.find(u => u.id == pu.userID))
      }, error =>{
        console.log(error)
      }
    )

  }
  
}
