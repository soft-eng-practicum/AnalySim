import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BlobFileItem } from 'src/app/interfaces/blob-file-item';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';

@Component({
  selector: 'app-project-file-explorer-item',
  templateUrl: './project-file-explorer-item.component.html',
  styleUrls: ['./project-file-explorer-item.component.scss']
})
export class ProjectFileExplorerItemComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router, private projectService : ProjectService) { }

  @Input() isSelected : boolean
  @Input() currentDirectory : string
  @Input() blobFileItem : BlobFileItem
  @Output() changeDirectory = new EventEmitter<string>();
  @Output() selectedItem = new EventEmitter<number>();

  open: boolean = false;
  dismissible : boolean = true;



  ngOnInit(): void {
    console.log(this.blobFileItem);
    if (this.blobFileItem.type === "file") {

    }
  }

  selectItem(){
    if(!this.isSelected && this.blobFileItem.type != "none")
      this.selectedItem.emit(this.blobFileItem.order)
    else if(this.selectItem && this.blobFileItem.type != "none")
      this.selectedItem.emit(null)

  }

  navigate(){
    if( this.blobFileItem.redirect != null){
      this.router.navigate([this.blobFileItem.defaultroute + this.blobFileItem.redirect])
      this.changeDirectory.emit(this.blobFileItem.redirect)
      this.selectedItem.emit(null)
    }
  }

  get timeSince() : string{
    var timeThen = new Date(this.blobFileItem.file.dateCreated)
    var timeNow = new Date()

    var elapsed = Math.floor(timeNow.getTime() - timeThen.getTime())
    var secs = Math.floor(elapsed/1000)
    var mins =  Math.floor(secs/60)
    var hours =  Math.floor(mins/60)
    var days =  Math.floor(hours/24)
    var months =  Math.floor(days/31)
    var years =  Math.floor(months/12)

    if(years > 12){
      return years + " year ago"
    }
    else if(months > 0){
      return months + " month ago"
    }
    else if(days > 0){
      return days + " day ago"
    }
    else if(hours > 0){
      return hours + " hour ago"
    }
    else if(mins > 0){
      return mins + " minute ago"
    }
    else if(secs > 0){
      return secs + " second ago"
    }
    else{
      return ""
    }
  }

  displayShareableLink(){
    this.open = true;
    alert(this.blobFileItem.file.uri);

  }

  onCloseAlert(){
    this.open = false;
 }

}
