import { Component, OnInit, Input } from '@angular/core';
import { ApplicationUser } from 'src/app/interfaces/user';
import { AccountService } from 'src/app/services/account.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile-card',
  templateUrl: './profile-card.component.html',
  styleUrls: ['./profile-card.component.css']
})
export class ProfileCardComponent implements OnInit {

  constructor(private accountService : AccountService,
    private router : Router) { }

  @Input() profile : ApplicationUser
  profileImage : string = null
  userID : number
  isFollowing : boolean

  ngOnInit(): void {
    this.accountService.currentUserID.subscribe(result => this.userID = result)
    this.isFollowing = this.profile.followers.some(x =>
      x.followerID == this.userID  
    )
    this.profileImage = this.accountService.getProfileImage(this.profile);
  }

  followUser(){
    if(!this.accountService.checkLoginStatus())
      this.router.navigate(['/login'])

    this.accountService.follow(this.profile.id, this.userID).subscribe(
      result =>{
        this.isFollowing = true
        this.reloadUser(result.userID)
      }, error =>{
        console.log(error)
      }
    )
  }

  unFollowUser(){
    this.accountService.unfollow(this.profile.id, this.userID).subscribe(
      result =>{
        this.isFollowing = false
        this.reloadUser(result.userID)       
      }, error =>{
        console.log(error)
      }
    )
 
  }

  reloadUser(profileID : number){
    this.accountService.getUserByID(profileID).subscribe(
      result =>{
        this.profile = result
      }, error =>{
        console.log(error)
      }
    )
  }

}
