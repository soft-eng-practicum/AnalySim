import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { Project } from '../interfaces/project';
import { BlobFileItem } from '../interfaces/blob-file-item';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-file-explorer',
  templateUrl: './file-explorer.component.html',
  styleUrls: ['./file-explorer.component.css']
})
export class FileExplorerComponent implements OnInit {

  constructor(public projectService : ProjectService, private route: ActivatedRoute) { }

  project : Project = null
  blobFileItemList : BlobFileItem[]
  currentDirectory : string = null

  ngOnInit(): void {
    this.route.url.subscribe(segments =>{
      if(segments.length == 0){
        this.currentDirectory = "/"
      } 
      else{
        this.currentDirectory = segments.join("/") + "/"
      } 
      console.log(this.currentDirectory)
    });


    this.projectService.getProjectByID(1).subscribe(
      result =>{
        this.project = result
        this.directoryFile(this.currentDirectory)
      }
    )
  }

  directoryFile(directory : string){
    if(!this.project.blobFiles.find(x => x.directory == directory)){
      this.blobFileItemList = []
    }
    
    if(directory == "/"){
      directory = ""
    }
    this.currentDirectory = directory

    let blobFileItemList : BlobFileItem[] = [];

    // Input Direction Num
    var directoryNum = directory.split("/").length-1;

    this.project.blobFiles.forEach(x => 
    {
      // Change Root Directory To Empty String 
      
      if(x.directory == "/"){
        x.directory = ""
      }
       
    
      let fullName = x.directory + x.name + x.extension

      var blobDirectoryNum = fullName.split("/").length-1
      var totalDirectoryNum = blobDirectoryNum - directoryNum

      if (fullName.startsWith(directory)){
        switch (totalDirectoryNum){
          case 0:
            var fileItem : BlobFileItem = {
              type: "file",
              name: x.name + x.extension,
              file: x,
              redirect: null
            }
            blobFileItemList.push(fileItem)
            break;
          case 1:
            let newDirectory = x.directory.replace(directory, "")
            var fileItem : BlobFileItem = {
              type: "folder",
              name: newDirectory.substring(0, newDirectory.lastIndexOf("/")),
              file: null,
              redirect: x.directory
            }
            blobFileItemList.push(fileItem)
            break;
        }
      }
    })

    if(directoryNum == 1){
      var fileItem : BlobFileItem = {
        type: "folder",
        name: "...",
        file: null,
        redirect: ""
      }
      blobFileItemList.push(fileItem)
    }
    else if(directoryNum > 1){
      var fileItem : BlobFileItem = {
        type: "folder",
        name: "...",
        file: null,
        redirect: directory.substring(0 , directory.substring(0, directory.lastIndexOf("/")).lastIndexOf("/") + 1)
      }
      blobFileItemList.push(fileItem)
    }

    // Remove Duplicate
    blobFileItemList = blobFileItemList.filter((item, index) => {return blobFileItemList.findIndex(x => x.name == item.name) == index})

    // Sort By Name
    blobFileItemList.sort((a,b) => (a.name > b.name) ? 1 : -1)

    // Sort By Type
    blobFileItemList.sort((a,b) => (a.type < b.type) ? 1 : -1)

    console.log(blobFileItemList)

    this.blobFileItemList = blobFileItemList
  }

}
