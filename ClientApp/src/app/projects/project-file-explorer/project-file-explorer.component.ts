import { Component, OnInit, ViewChild, TemplateRef, Input } from '@angular/core';
import { ProjectService } from '../../services/project.service';
import { Project } from '../../interfaces/project';
import { BlobFileItem } from '../../interfaces/blob-file-item';
import { ActivatedRoute } from '@angular/router';
import { BsModalService, BsModalRef } from 'ngx-bootstrap/modal';
import { NotificationService } from 'src/app/services/notification.service';
import { AccountService } from 'src/app/services/account.service';
import { Observable } from 'rxjs';
import { ApplicationUser } from 'src/app/interfaces/user';
import { BlobFile } from 'src/app/interfaces/blob-file';
import { UploadFileItem } from 'src/app/interfaces/upload-file-item';
import { saveAs } from 'file-saver';

@Component({
  selector: 'app-project-file-explorer',
  templateUrl: './project-file-explorer.component.html',
  styleUrls: ['./project-file-explorer.component.css']
})
export class ProjectFileExplorerComponent implements OnInit {

  constructor(
    private projectService : ProjectService,
    private modalService : BsModalService, 
    private notfi : NotificationService) { }

  @ViewChild('uploadModal') uploadFileModal : TemplateRef<any>;
  @ViewChild('folderModal') folderModal : TemplateRef<any>;
  uploadModalRef : BsModalRef;
  folderModalRef : BsModalRef;

  @Input() project : Project
  @Input() currentUser : ApplicationUser
  @Input() currentDirectory : string
  @Input() isMember : boolean

  blobFileItemList : BlobFileItem[] = []
  validDirectory : boolean = true
  selectedItem : number = null

  uploadInProgress : boolean = false
  uploadFileList : UploadFileItem[] = []

  async ngOnInit() {
    console.log(this.project)
    this.setDirectoryFile(this.currentDirectory)
  }

  public fileEvent($event) {
    for (let file of $event.target.files)
    {
      // Check If Name Already Exist
      if((this.blobFileItemList.findIndex(x => x.name == file.name)) == -1)
      {
        // Add File To Upload List
        var fileItem : UploadFileItem = {
          file: file,
          directory: this.currentDirectory,
          projectID: 1,
          uploadStatus: "loading"
        }
        this.uploadFileList.push(fileItem)
      }    
    }
    
    if(this.uploadFileList.length == 0){
      // Show Warning If No Unique Name
      this.notfi.showWarning("File Name Already Exist", "Upload Error")
    }
    else{
      // Show Upload Modal
      this.toggleModalUpload()
    }
  }

  toggleModalUpload(){
    // Show Upload Modal
    if(this.isValidDirectory){
      this.uploadModalRef = this.modalService.show(this.uploadFileModal)
    }
  }

  toggleModalFolder(){
    // Show Folder Modal
    if(this.isValidDirectory){
      this.folderModalRef = this.modalService.show(this.folderModal)
    }
  }

  get isValidDirectory(){
    return !this.blobFileItemList.some(x => x.name == "Invalid Directory" || x.name == "Invalid File") 
  }

  delete(){
    if(this.selectedItem != null){
      // Get Selected Item
      var item = this.blobFileItemList[this.selectedItem]

      // Unselect The Current Item
      this.selectedItem = null

      // Delete Item If File
      if(item.type == "file"){

        // Remove Item From Project File
        let index = this.project.blobFiles.indexOf(item.file,0)
        if (index > -1) {
          this.project.blobFiles.splice(index, 1);
        }

        // Refresh The Page
        this.setDirectoryFile(this.currentDirectory)

        // Delete The Item
        this.projectService.deleteFile(item.file.blobFileID)
      }
    }
  }

  saveFile(){
    if(this.selectedItem != null){
      // Get Current Selected Item
      var item = this.blobFileItemList[this.selectedItem]
      if(item.type == "file"){
        // Download The File
        var fileName = item.file.name + item.file.extension
        this.projectService.downloadFile(item.file.blobFileID).subscribe(
          result =>{
            saveAs(result, fileName);
          },error =>{
            console.log(error)
          }
        )
      }
    }
  }

  updateFileList(uploadFileList : UploadFileItem[]){
    this.uploadFileList = uploadFileList;
  }

  addNewFile(blobFile : BlobFile){
    // Push File To Project
    this.project.blobFiles.push(blobFile)

    // Refresh the File List
    this.setDirectoryFile(this.currentDirectory)
  }

  setSelectedItem(itemNum : number){
    this.selectedItem = itemNum
  }

  public setDirectoryFile(directory : string){
    // Set Current Directory
    this.currentDirectory = directory

    var defaultRoute = "project/" + this.project.route

    if(this.project.blobFiles.length != 0){
      // Check If Directory Is File
      if(!(this.currentDirectory.indexOf(".") > -1)){

        // Check If Directory Is valid
        if(!this.project.blobFiles.find(x => x.directory == directory)){
          console.log(this.currentDirectory)
          console.log("test")
          // Return Nothing If No Valid Path
          this.blobFileItemList = [
            {
              type: "none",
              name: ". . .",
              file: null,
              defaultroute: defaultRoute,
              redirect: "",
              order: 0
            },
            {
              type: "none",
              name: "Invalid Directory",
              file: null,
              defaultroute: null,
              redirect: null,
              order: 1
            }
          ]
        } 
        else{

          let fileItemList : BlobFileItem[] = [];

          // Input Directory Num
          var currentDirectoryNum = directory.split("/").length-1;

          // Check If File 
          this.project.blobFiles.forEach(file => 
          {

            // Get Full Path Of File
            let fullName = file.directory + file.name + file.extension

            // File Directory Num
            var fileDirectoryNum = fullName.split("/").length-1

            // Total Directory Num
            var totalDirectoryNum = fileDirectoryNum - currentDirectoryNum

            // Check Match Starting Directory
            if (fullName.startsWith(directory)){
              switch (totalDirectoryNum){
                // Match Current Directory File
                case 0:
                  var fileItem : BlobFileItem = {
                    type: "file",
                    name: file.name + file.extension,
                    file: file,
                    defaultroute: defaultRoute + "/",
                    redirect: file.directory + file.name + file.extension,
                    order: null
                  }
                  fileItemList.push(fileItem)
                  break;
                // Match Next Folder Directory
                case 1:
                  let newDirectory = file.directory.replace(directory, "")
                  var fileItem : BlobFileItem = {
                    type: "folder",
                    name: newDirectory.substring(0, newDirectory.lastIndexOf("/")),
                    file: null,
                    defaultroute: defaultRoute + "/",
                    redirect: file.directory,
                    order: null
                  }
                  fileItemList.push(fileItem)
                  break;
              }
            }
          })

          // If One Slash, Redirect to Root
          if(currentDirectoryNum == 1){
            var fileItem : BlobFileItem = {
              type: "none",
              name: ". . .",
              file: null,
              defaultroute: defaultRoute,
              redirect: "",
              order: null
            }
            fileItemList.push(fileItem)
          }
          // If More Then One Slash, Redirect to Previous Directory
          else if(currentDirectoryNum > 1){
            var fileItem : BlobFileItem = {
              type: "none",
              name: ". . .",
              file: null,
              defaultroute: defaultRoute + "/",
              redirect: directory.substring(0 , directory.substring(0, directory.lastIndexOf("/")).lastIndexOf("/") + 1),
              order: null
            }
            fileItemList.push(fileItem)
          }

          // Remove Duplicate
          fileItemList = fileItemList.filter((item, index) => { return fileItemList.findIndex(file => file.name == item.name) == index })

          // Sort By Name
          fileItemList.sort((a,b) => (a.name > b.name) ? 1 : -1)

          // Sort By Type
          fileItemList.sort((a,b) => (a.type < b.type) ? 1 : -1)

          // Remove Placeholder File
          fileItemList = fileItemList.filter(x => x.name != "$$$.$$")

          // Set Order Number
          fileItemList.map((item, index) => item.order = index)

          // Set File List
          this.blobFileItemList = fileItemList
        }
      }
      else{
        // Set File List
        let fileItemList : BlobFileItem[] = [];

        var file = this.project.blobFiles.find(x => this.currentDirectory == x.directory + x.name + x.extension)
        if(file == undefined ){
          this.blobFileItemList = [
            {
              type: "none",
              name: ". . .",
              file: null,
              defaultroute: defaultRoute,
              redirect: "",
              order: 0
            },
            {
              type: "none",
              name: "Invalid File",
              file: null,
              defaultroute: null,
              redirect: null,
              order: 1
            }
          ]
        }
        else {
          fileItemList.push( 
            {
              type: "none",
              name: ". . .",
              file: null,
              defaultroute: defaultRoute + "/",
              redirect: directory.substring(0 , directory.lastIndexOf("/")+1),
              order: 0
            },
            {
              type: "file",
              name: file.name + file.extension,
              file: file,
              defaultroute: null,
              redirect: null,
              order: 1
            }
          )
          this.blobFileItemList = fileItemList
        }      
      }
    }
  }

}
