import { Component, OnInit, Input } from '@angular/core';
import { Project } from 'src/app/interfaces/project';
import { ProjectService } from 'src/app/services/project.service';
import { AccountService } from 'src/app/services/account.service';
import { Router } from '@angular/router';
import { ProjectUser } from 'src/app/interfaces/project-user';
import { RoutePipe } from 'src/app/custom.pipe';

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

  userID : number
  userData : ProjectUser = null

  ngOnInit(): void {
    this.accountService.currentUserID.subscribe(result => this.userID = result)
    this.userData = this.project.projectUsers.find(x =>
      x.userID == this.userID
    )
  }

  get isFollowing() : boolean{
    if(this.userData != null && this.userData.isFollowing == true)
      return true
    else 
      return false;
  }

  followProject(){
    if(!this.accountService.checkLoginStatus())
      this.router.navigate(['/login'])

    if(this.userData != null){
      var user = {} as ProjectUser;
      user.projectID = this.project.projectID
      this.accountService.currentUserID.subscribe(result => user.userID = result)
      user.isFollowing = true;
      user.userRole = this.userData.userRole  
      
      this.projectService.UpdateUser(user).subscribe(
        result =>{
          this.resetProject()
        }, error =>{
          console.log(error)
        }
      )
    }
    else
    {
      this.projectService.AddUser(this.project.projectID, this.userID, "follower", true).subscribe(
        result =>{      
          this.resetProject()
        }, error =>{
          console.log(error)
        }
      )
    }
  }

  unFollowProject(){
    this.userData.isFollowing = false
    this.projectService.UpdateUser(this.userData).subscribe(
      result =>{
        this.resetProject()       
      }, error =>{
        console.log(error)
      }
    )

    
  }

  resetProject(){
    const filterPipe = new RoutePipe();
    let owner = filterPipe.transform(this.project.route,"owner");
    let projectName = filterPipe.transform(this.project.route,"projectname");

    this.projectService.getProject(owner, projectName).subscribe(
      result =>{
        this.project = result
        this.userData = this.project.projectUsers.find(x =>
          x.userID == this.userID
        )
      }, error =>{
        console.log(error)
      }
    )
  }
}
