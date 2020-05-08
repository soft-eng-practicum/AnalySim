import { Component, OnInit, Input } from '@angular/core';
import { Project } from 'src/app/interfaces/project';
import { ProjectService } from 'src/app/services/project.service';
import { AccountService } from 'src/app/services/account.service';
import { Router } from '@angular/router';
import { ProjectUser } from 'src/app/interfaces/project-user';

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

  userID : number
  userData : ProjectUser

  ngOnInit(): void {
    this.accountService.currentUserID.subscribe(result => this.userID = result)
    this.userData = this.project.projectUsers.find(x =>
      x.userID == this.userID
    )
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

    var user = {} as ProjectUser;
    user.projectID = this.project.projectID
    this.accountService.currentUserID.subscribe(result => user.userID = result)
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
      }, error =>{
        console.log(error)
      }
    )
  }
}
