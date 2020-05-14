import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder } from '@angular/forms';
import { AccountService } from 'src/app/services/account.service';
import { Router } from '@angular/router';
import { FileService } from 'src/app/services/file.service';
import { ApplicationUser } from 'src/app/interfaces/user';

@Component({
  selector: 'app-profile-setting',
  templateUrl: './profile-setting.component.html',
  styleUrls: ['./profile-setting.component.css']
})
export class ProfileSettingComponent implements OnInit {

  profile : ApplicationUser
  profileImage: string
  profileForm: FormGroup
  bio : FormControl

  constructor(
    private accountService : AccountService, 
    private router : Router,
    private formBuilder : FormBuilder,
    private fileService: FileService        
  ) {}

  ngOnInit() {
    if(!this.accountService.checkLoginStatus())
      this.router.navigate(['/login'])

    let userID;
    this.accountService.currentUserID.subscribe(result => userID = result)
    this.accountService.getUserByID(userID).subscribe(
      result => {
        this.profileImage = this.accountService.getProfileImage(result);
        this.profile = result 
        
        this.bio = new FormControl(this.profile.bio);
    
        // Initialize FormGroup using FormBuilder
        this.profileForm = this.formBuilder.group({
          bio : this.bio
        });
      }, error =>{
        console.log(error)
      }
    )

    // Initialize Form Controls
    
  }

  public useFileInput() {
    document.getElementById('fileInput').click();
  }

  
  // Add FormControl to FormGroup for file input
  public fileEvent($event) {
    let file = $event.target.files[0]
    this.fileService.uploadProfileImage(file, this.profile.id).subscribe(
      result => {
        console.log(this.profileImage)
        this.profileImage = result.uri + "?" + new Date().getTime();
        console.log(this.profileImage)
      }, error => {
        console.log(error)
      }
    )
  }

  clearProfile(){
    let imageFileID = this.profile.blobFiles.find(x => x.container == 'profile').blobFileID
    this.fileService.delete(imageFileID).subscribe(
      result => {
        this.profileImage = "../../assets/img/default-profile.png";
      },error => {
        console.log(error)
      }
    )
  }

  onSubmit(){
    let form = this.profileForm.value

    this.accountService.updateUser(form.bio, this.profile.id).subscribe(
      result => {
        this.profile = result
        this.profileImage = this.accountService.getProfileImage(result);
      }, error =>{
        console.log(error)
      }
    )

  }

}
