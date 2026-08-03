import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { AccountService } from 'src/app/services/account.service';
import { Router } from '@angular/router';
import { User } from 'src/app/interfaces/user';
import { from, Observable } from 'rxjs';
import { NotificationService } from 'src/app/services/notification.service';
import { ProjectService } from 'src/app/services/project.service';
import { SafeUrl, DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-profile-setting',
  templateUrl: './profile-setting.component.html',
  styleUrls: ['./profile-setting.component.scss']
})
export class ProfileSettingComponent implements OnInit {
  currentUser$: Observable<User>;
  currentUser: User = null;

  profileImageUrl: SafeUrl;

  constructor(
    private accountService: AccountService,
    private projectService: ProjectService,
    private router: Router,
    private formBuilder: FormBuilder,
    private sanitizer: DomSanitizer,
    private notif: NotificationService,
  ) { }

  async ngOnInit(): Promise<void> {
    if (!this.accountService.checkLoginStatus())
      this.router.navigate(['/login'], {
        queryParams: { returnUrl: this.router.url },
      });

    await this.accountService.currentUser.then((x) => (this.currentUser$ = x));
    this.currentUser$.subscribe((x) => {
      this.currentUser = x;

      this.getProfileImage();
      this.buildProfileBioForm();
      this.buildPasswordForm();
      this.buildNotificationsPrefForm();
    });
  }

  public useFileInput() {
    document.getElementById('fileInput').click();
  }

  // Add FormControl to FormGroup for file input
  public fileEvent($event) {
    // Get Target File
    let file = $event.target.files[0];

    // Upload File Or Replace If Already Exist
    this.accountService.uploadProfileImage(file, this.currentUser.id).subscribe(
      (result) => {
        let index = this.currentUser.blobFiles.findIndex(
          (x) => x.blobFileID == result.blobFileID,
        );
        if (index > -1) this.currentUser.blobFiles[index] = result;
        else this.currentUser.blobFiles.push(result);
        // this.profileImage();
        this.accountService.setCurrentUser(this.currentUser);
      },
      (error) => {
        console.log(error);
      },
    );
  }

  getProfileImage() {
    if (this.currentUser.blobFiles.length != 0) {
      var blobFile = this.currentUser.blobFiles.find(
        (x) => x.container == 'profile',
      );
      if (blobFile != null) {
        this.projectService.downloadFile(blobFile.blobFileID).subscribe(
          (imageBlob) => {
            if (imageBlob == null)
              this.profileImageUrl = '../../assets/img/default-profile.png';
            const objectURL = URL.createObjectURL(imageBlob);
            this.profileImageUrl =
              this.sanitizer.bypassSecurityTrustUrl(objectURL);
          },
          (error) => {
            console.log(error);
          },
        );
      } else this.profileImageUrl = '../../assets/img/default-profile.png';
    } else this.profileImageUrl = '../../assets/img/default-profile.png';
  }

  onRemoveProfileImage() {
    let imageFileID = this.currentUser.blobFiles.find(
      (x) => x.container == 'profile',
    ).blobFileID;
    if (imageFileID != undefined) {
      this.accountService.deleteProfileImage(imageFileID).subscribe(
        (result) => {
          // Remove Item From Project File
          let index = this.currentUser.blobFiles.indexOf(result, 0);
          this.currentUser.blobFiles.splice(index, 1);
          this.accountService.setCurrentUser(this.currentUser);
        },
        (error) => {
          console.log(error);
        },
      );
    }
  }

  // BIO FORM
  profileBioForm: FormGroup;
  bio: FormControl;

  buildProfileBioForm() {
    this.bio = new FormControl(this.currentUser.bio);
    this.profileBioForm = this.formBuilder.group({
      bio: this.bio,
    });
  }

  onUpdateBio() {
    let form = this.profileBioForm.value;

    this.accountService.updateUser(form.bio, this.currentUser.id).subscribe(
      (result) => {
        this.currentUser = result;
        this.notif.showSuccess(
          'Account has been successfully updated',
          'Account Update',
        );
      },
      (error) => {
        console.log(error);
      },
    );
  }

  // EMAIL FORM
  emailForm: FormGroup;
  onChangeEmail() {
    // will need to revalidate email
  }

  // PASSWORD FORM
  passwordForm: FormGroup;
  currentPassword: FormControl;
  newPassword: FormControl;
  confirmPassword: FormControl;
  passwordUpdateLoading = false;
  passwordErrorMessage: string = null;

  buildPasswordForm() {
    this.currentPassword = new FormControl('', [Validators.required]);
    this.newPassword = new FormControl('', [
      Validators.required,
      Validators.minLength(6),
    ]);
    this.confirmPassword = new FormControl('', [Validators.required]);

    this.passwordForm = this.formBuilder.group({
      currentPassword: this.currentPassword,
      newPassword: this.newPassword,
      confirmPassword: this.confirmPassword,
    });
  }

  onChangePassword() {
    this.passwordErrorMessage = null;

    if (!this.passwordForm || this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }

    const form = this.passwordForm.value;
    if (form.newPassword !== form.confirmPassword) {
      this.passwordErrorMessage = 'New password and confirmation password do not match.';
      return;
    }

    this.passwordUpdateLoading = true;
    this.accountService.changeCurrentPassword(
      form.currentPassword,
      form.newPassword,
      form.confirmPassword,
    ).subscribe(
      () => {
        this.passwordUpdateLoading = false;
        this.passwordForm.reset();
        this.notif.showSuccess(
          'Password changed successfully. Please log in again.',
          'Password Update',
        );
        this.accountService.clearAuthenticationState();
        this.router.navigate(['/login']);
      },
      (error) => {
        this.passwordUpdateLoading = false;
        this.passwordErrorMessage = this.getPasswordErrorMessage(error);
        this.notif.showMessage(this.passwordErrorMessage, 'Password Update');
      },
    );
  }

  private getPasswordErrorMessage(error): string {
    if (error?.error?.errors && Array.isArray(error.error.errors)) {
      return error.error.errors[0];
    }

    if (error?.error?.message) {
      return error.error.message;
    }

    return 'Password could not be changed. Please check your current password and try again.';
  }

  // NOTIFICATION FORM
  notificationForm: FormGroup;
  sendCommentNotifications: FormControl;

  buildNotificationsPrefForm() {
    this.sendCommentNotifications = new FormControl(
      this.currentUser.receiveCommentReplyEmails,
    );
    this.notificationForm = this.formBuilder.group({
      sendCommentNotifications: this.sendCommentNotifications,
    });
  }

  onSaveNotificationPreferences() {
    let form = this.notificationForm.value;

    this.accountService.updateNotificationPreferences(form.sendCommentNotifications, this.currentUser.id).subscribe(
      (result) => {
        this.currentUser = result;
        this.notif.showInfo(
          'Notification Preferences successfully updated',
          'Account Update',
        );
      },
      (error) => {
        console.log(error);
        this.notif.showMessage(
          'Notification Preferences failed to update',
          'Account Update',
        );
      },
    );
  }
}
