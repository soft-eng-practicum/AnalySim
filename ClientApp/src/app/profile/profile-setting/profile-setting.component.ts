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

  currentUser : ApplicationUser = null
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

    this.accountService.currentUser.subscribe(result => {
      // Set User
      this.currentUser = result

      // Make Form Control
      this.bio = new FormControl(this.currentUser.bio)

      // Initialize FormGroup using FormBuilder
      this.profileForm = this.formBuilder.group({
        bio : this.bio
      });
    })
  }

  public useFileInput() {
    document.getElementById('fileInput').click();
  }
  
  // Add FormControl to FormGroup for file input
  public fileEvent($event) {
    // Get Target File
    let file = $event.target.files[0]

    // Upload File Or Replace If Already Exist
    this.fileService.uploadProfileImage(file, this.currentUser.id).subscribe(
      result => {
        let index = this.currentUser.blobFiles.findIndex(x => x.blobFileID == result.blobFileID)
        this.currentUser.blobFiles[index] = result    
      }, error => {
        console.log(error)
      }
    )
  }

  clearProfile(){
    let imageFileID = this.currentUser.blobFiles.find(x => x.container == 'profile').blobFileID
    this.fileService.delete(imageFileID).subscribe(
      result => {
        console.log(result)
      },error => {
        console.log(error)
      }
    )
  }

  onSubmit(){
    let form = this.profileForm.value

    this.accountService.updateUser(form.bio, this.currentUser.id).subscribe(
      result => {
        this.currentUser = result
      }, error =>{
        console.log(error)
      }
    )
  }

}
