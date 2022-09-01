import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Project } from 'src/app/interfaces/project';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { ProjectService } from 'src/app/services/project.service';
import { User } from 'src/app/interfaces/user';
import { AccountService } from 'src/app/services/account.service';

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
  @Output() updateProject = new EventEmitter<Project>()
  users : User[] = []
  filteredUsers : User[] = []
  userForm: FormGroup
  userName: FormControl

  ngOnInit(): void {
    this.loadUser()

    this.accountService.getUserList().subscribe(
      result => 
      {
        this.users = result
      }
    )

    // Initialize FormGroup using FormBuilder
    this.userForm = this.formBuilder.group({
      userName: this.userName,
    });

    this.userName = new FormControl('');
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

    var existingUser : User[] = []
    this.project.projectUsers
    .forEach(x => { 
      if(x.userRole != "follower"){
        existingUser.push(x.user)
      }   
    })

    return this.users.filter(x => {
      if(count < 5){
        if(x.userName.toLowerCase().indexOf(val.toLowerCase()) != -1 && existingUser.find(u => x.userName == u.userName) == undefined){
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

  public addUser(user : User){
    this.projectService.addUser(this.project.projectID, user.id, "member", false).subscribe(
      result => {
        this.project.projectUsers.push(result)
        this.updateProject.emit(this.project)
      }, error =>{
        console.log(error)
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
        // Map Project
        this.users = this.project.projectUsers
          .map(x => x.user)
      }, error =>{
        console.log(error)
      }
    )

  }
  
}
