import { Component, OnInit, Input } from '@angular/core';
import { ApplicationUser } from 'src/app/interfaces/user';
import { AccountService } from 'src/app/services/account.service';
import { Router } from '@angular/router';
import { UserUser } from 'src/app/interfaces/user-user';

@Component({
  selector: 'app-explore-profile-detail',
  templateUrl: './explore-profile-detail.component.html',
  styleUrls: ['./explore-profile-detail.component.css']
})
export class ExploreProfileDetailComponent implements OnInit {

  constructor(private accountService : AccountService,
    private router : Router) { }

  @Input() profile : ApplicationUser

  userID : number
  isFollowing : boolean

  ngOnInit(): void {
    this.accountService.currentUserID.subscribe(result => this.userID = result)
    this.isFollowing = this.profile.followers.some(x =>
      x.followerID == this.userID  
    )
  }

  followUser(){
    if(!this.accountService.checkLoginStatus())
      this.router.navigate(['/login'])

    let followData = {} as UserUser;
    followData.userID = this.profile.id
    followData.followerID = this.userID

    this.accountService.Follow(followData).subscribe(
      result =>{
        this.isFollowing = true
        this.reloadUser(result.userID)
      }, error =>{
        console.log(error)
      }
    )
  }

  unFollowUser(){
    let followData = {} as UserUser;
    followData.userID = this.profile.id
    followData.followerID = this.userID

    this.accountService.Unfollow(followData).subscribe(
      result =>{
        this.isFollowing = false
        this.reloadUser(result.userID)       
      }, error =>{
        console.log(error)
      }
    )

    
  }

  reloadUser(profileID : number){
    this.accountService.Read(profileID).subscribe(
      result =>{
        this.profile = result
      }, error =>{
        console.log(error)
      }
    )
  }

}
