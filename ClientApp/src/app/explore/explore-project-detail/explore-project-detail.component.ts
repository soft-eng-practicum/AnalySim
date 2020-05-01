import { Component, OnInit, Input } from '@angular/core';
import { Project } from 'src/app/interfaces/project';
import { ProjectService } from 'src/app/services/project.service';
import { ApplicationUserProject } from 'src/app/interfaces/application-user-project';
import { AccountService } from 'src/app/services/account.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-explore-project-detail',
  templateUrl: './explore-project-detail.component.html',
  styleUrls: ['./explore-project-detail.component.css']
})
export class ExploreProjectDetailComponent implements OnInit {

  constructor(
    private projectService : ProjectService,
    private accountService : AccountService,
    private router : Router
    ) { }

  @Input() project : Project;

  owner : string
  projectname : string
  followers : number
  members : number
  lastUpdate : string

  userID : string
  userData : ApplicationUserProject

  ngOnInit(): void {
    this.accountService.currentUserID.subscribe(result => this.userID = result)
    this.setValue()
  }

  setValue(){
    this.owner = this.project.route.split("/")[0];
    this.projectname = this.project.route.split("/")[1];
    this.followers = this.project.applicationUserProjects.filter(x => 
      x.isFollowing == true
    ).length
    this.members = this.project.applicationUserProjects.filter(x => 
      x.userRole == 'Owner' || 
      x.userRole == 'Admin' || 
      x.userRole == 'Member'
    ).length  
    this.userData = this.project.applicationUserProjects.find(x =>
      x.applicationUserID == this.userID
    )
    this.lastUpdate = this.getTimeElapsed()
  }

  getTimeElapsed()
  {
    var timeNow = new Date()
    var timeThen = new Date(this.project.lastUpdated)
    var elapsed = new Date(timeNow.getTime() - timeThen.getTime())

    if(elapsed.getMonth() > 12){
      return Math.floor(elapsed.getMonth() / 12) + " Year"
    }
    else if(elapsed.getMonth() > 0){
      return elapsed.getMonth()+ " Month"
    }
    else if(elapsed.getDay() > 0){
      return elapsed.getDay() + " Day"
    }
    else if(elapsed.getHours() > 0){
      return elapsed.getHours() + " Hour"
    }
    else if(elapsed.getMinutes() > 0){
      return elapsed.getMinutes() + " Minute"
    }
    else if(elapsed.getSeconds() > 0){
      return elapsed.getSeconds() + " Second"
    }
  }

  get isFollowing() : boolean{
    if(this.userData && this.userData.isFollowing == true)
      return true
    else 
      return false;
  }

  followProject(){
    if(!this.accountService.checkLoginStatus())
      this.router.navigate(['/login'])

    var user = {} as ApplicationUserProject;
    user.projectID = this.project.projectID
    this.accountService.currentUserID.subscribe(result => user.applicationUserID = result)
    user.isFollowing = true;
    if(this.userData != null && !this.userData.isFollowing){
      user.userRole = this.userData.userRole   
      this.projectService.UpdateUserRole(user).subscribe(
        result =>{
          console.log(result)
          this.resetProject()
        }, error =>{
          console.log(error)
        }
      )
    }
    else
    {
      user.userRole = "follower"
      this.projectService.CreateUserRole(user).subscribe(
        result =>{
          console.log(result)
          this.resetProject()
        }, error =>{
          console.log(error)
        }
      )
    }
  }

  unFollowProject(){
    this.userData.isFollowing = false
    this.projectService.UpdateUserRole(this.userData).subscribe(
      result =>{
        console.log(result)
        this.resetProject()       
      }, error =>{
        console.log(error)
      }
    )

    
  }

  resetProject(){
    this.projectService.ReadProject(this.owner, this.projectname).subscribe(
      result =>{
        console.log(result)
        this.project = result
        this.setValue()
      }, error =>{
        console.log(error)
      }
    )
  }
}
