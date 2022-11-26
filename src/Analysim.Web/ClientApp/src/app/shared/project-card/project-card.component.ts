import { Component, OnInit, Input } from '@angular/core';
import { Project } from 'src/app/interfaces/project';
import { ProjectService } from 'src/app/services/project.service';
import { AccountService } from 'src/app/services/account.service';
import { Router } from '@angular/router';
import { ProjectUser } from 'src/app/interfaces/project-user';
import { Observable } from 'rxjs';
import { User } from 'src/app/interfaces/user';
import { of, } from 'rxjs';
import { map, switchAll } from 'rxjs/operators';


@Component({
  selector: 'app-project-card',
  templateUrl: './project-card.component.html',
  styleUrls: ['./project-card.component.scss']
})
export class ProjectCardComponent implements OnInit {

  constructor(
    private projectService : ProjectService,
    private accountService : AccountService,
    private router : Router
    ) { }

  @Input() project : Project;

  currentUser$ : Observable<User>
  currentUser : User = null
  projectUser : ProjectUser = null

  async ngOnInit() {
    // Get User And Check For Project User Match
    if(this.accountService.checkLoginStatus()){
      await this.accountService.currentUser.then((x) => this.currentUser$ = x)
      this.currentUser$.subscribe(x => this.currentUser = x)
      this.projectUser = this.project.projectUsers.find(x => x.userID == this.currentUser.id) || null
    }
  }

  get isFollowing() : boolean{
    if(this.currentUser == null) return false
    if(this.projectUser == null) return false
    if(this.projectUser.isFollowing == true) return true
    return false;
  }

  async displayUsers(){
  
    var projectmembers = []
    var myObj = this.project.projectUsers;


      await (myObj).forEach(element => { 
      this.accountService.getUserByID(element.userID).subscribe(
       user => {projectmembers.push(user.userName)
      console.log(user.userName)})
      projectmembers.push(element.userID)

     });
     alert(projectmembers)
    console.log(projectmembers)
    var results = this.accountService.getUserRange(projectmembers)
    console.log(results)


  }


  
  displayUsers1(){

    var projectmembers = []

    of((this.accountService.getUserByID(1),
    this.accountService.getUserByID(2)).subscribe(
      user => {projectmembers.push(user.userName)
     console.log(projectmembers)})

    )
  }
      
  displayUsers2(){

    var projectmembers = []

    of((this.accountService.getUserByID(1),
    this.accountService.getUserByID(2)).subscribe(
      user => {projectmembers.push(user.userName)
     console.log(projectmembers)})

    )
  }


/*
    displayUserTest(){
      map(userID => this.accountService.getUserByID(userID))(of(this.project.projectUsers)).subscribe(user => console.log(user.userName));

    }
    */


  followProject(){
    // Navigate To Login Page If User Not Logged In
    if(!this.accountService.checkLoginStatus())
      this.router.navigate(['/login'], {queryParams: {returnUrl : this.router.url}})

    if(this.projectUser == null)
    {
      // Create Project User As Follower
      this.projectService.addUser(this.project.projectID, this.currentUser.id, "follower", true).subscribe(
        result =>{
          this.project.projectUsers.push(result) 
          this.projectUser = result;  
        }, error =>{
          console.log(error)
        }
      )
    }
    else{
      // Modify Project User And Set Following To True
      this.projectUser.isFollowing = true;     
      this.projectService.updateUser(this.projectUser).subscribe(
        result =>{
          let index = this.project.projectUsers.findIndex(pu => pu.userID == result.userID)
          this.project.projectUsers[index] = result
          this.projectUser = result;          
        }, error =>{
          console.log(error)
        }
      )
    }
  }


  unFollowProject(){
    this.projectUser.isFollowing = false
    if(this.projectUser.userRole == "follower")
      this.projectService.removeUser(this.projectUser.projectID, this.projectUser.userID).subscribe(
        result => {
          let index = this.project.projectUsers.indexOf(result)
          this.project.projectUsers.splice(index, 1)
          this.projectUser = null
        }, error =>{
          console.log(error)
        }
      )
    else{
      this.projectService.updateUser(this.projectUser).subscribe(
        result => {
          let index = this.project.projectUsers.findIndex(pu => pu.userID == result.userID)
          this.project.projectUsers[index] = result
          this.projectUser = result 
        }, error =>{
          console.log(error)
        }
      )
    }
  }
}
