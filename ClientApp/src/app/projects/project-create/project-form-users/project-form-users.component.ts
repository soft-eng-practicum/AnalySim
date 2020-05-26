import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { Project } from 'src/app/interfaces/project';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { ProjectService } from 'src/app/services/project.service';
import { ApplicationUser } from 'src/app/interfaces/user';
import { AccountService } from 'src/app/services/account.service';

@Component({
  selector: 'app-project-form-users',
  templateUrl: './project-form-users.component.html',
  styleUrls: ['./project-form-users.component.css']
})
export class ProjectFormUsersComponent implements OnInit {

  constructor(
    private projectService : ProjectService,
    private formBuilder : FormBuilder,
    private accountService : AccountService) { }

  // Form Control - Project Tag/Role
  @Input() project : Project
  @Output() updateProject = new EventEmitter<Project>()
  users : ApplicationUser[] = []
  filteredUsers : ApplicationUser[] = []
  userForm: FormGroup
  userName: FormControl

  ngOnInit(): void {

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

  public filterUser(val : string) : ApplicationUser[]{
    let count = 0
    if(val == null || val == "")
      return []

    var existingUser : ApplicationUser[] = []
    this.project.projectUsers.forEach(x => { if(x.userRole != "follower") existingUser.push(x.user) })

    return this.users.filter(x => {
      if(count < 5){
        if(x.userName.toLowerCase().indexOf(val.toLowerCase()) != -1 && existingUser.find(u => {x.userName == u.userName}) == undefined){
          count++
          return true
        }  
      }
      else
        return false
    })
  }

  public addUser(user : ApplicationUser){
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
}
