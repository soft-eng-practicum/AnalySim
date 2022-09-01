import { Component, OnInit, Input } from '@angular/core';
import { User } from 'src/app/interfaces/user';
import { AccountService } from 'src/app/services/account.service';
import { ProjectService } from 'src/app/services/project.service';
import { Project } from 'src/app/interfaces/project';

@Component({
  selector: 'app-dashboard-following',
  templateUrl: './dashboard-following.component.html',
  styleUrls: ['./dashboard-following.component.css']
})
export class DashboardFollowingComponent implements OnInit {

  constructor(private accountService : AccountService,
    private projectService : ProjectService) { }

  @Input() currentUser : User
  userID : number
  projects : Project[]
  followings : User[]
  tabActive : boolean[] = [true, false]

  ngOnInit(): void {
    this.loadProject(this.currentUser)
    this.loadFollowing(this.currentUser)
  }

  changeTab(num : number)
  {
    this.tabActive.forEach((t,i) => {
      if(num != i)
        this.tabActive[i] = false
      else {
        this.tabActive[i] = true
      }
    }); 
  }

  loadFollowing(profile : User){
    let userIDs : number[] = profile.following.map(f => f.userID)

    this.accountService.getUserRange(userIDs).subscribe(
      result =>{
        // Map Project in Project User
        profile.following
          .map(f => f.user = result.find(u => u.id == f.userID))
        this.followings = profile.following
          .map(x => x.user)
      }, error =>{
        console.log(error)
      }
    )
  }

  loadProject(profile : User){
    let projectIDs : number[] = profile.projectUsers.map(pu => pu.projectID)
    
    this.projectService.getProjectRange(projectIDs).subscribe(
      result =>{
        // Map Project in Project User
        profile.projectUsers.map(pu => pu.project = result.find(p => p.projectID == pu.projectID))
        // Map Project
        this.projects = profile.projectUsers
          .filter(x => x.userRole == "follower" || x.isFollowing == true)
          .map(x => x.project)
      }, error =>{
        console.log(error)
      }
    )
  }
}
