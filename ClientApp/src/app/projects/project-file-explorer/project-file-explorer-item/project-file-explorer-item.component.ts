import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BlobFileItem } from 'src/app/interfaces/blob-file-item';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-project-file-explorer-item',
  templateUrl: './project-file-explorer-item.component.html',
  styleUrls: ['./project-file-explorer-item.component.css']
})
export class ProjectFileExplorerItemComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router) { }

  @Input() isSelected : boolean
  @Input() blobFileItem : BlobFileItem
  @Output() changeDirectory = new EventEmitter<String>();
  @Output() selectedItem = new EventEmitter<number>();

  ngOnInit(): void {
  }

  selectItem(){
    if(!this.isSelected && this.blobFileItem.type != "none")
      this.selectedItem.emit(this.blobFileItem.order)
    else if(this.selectItem && this.blobFileItem.type != "none")
      this.selectedItem.emit(null)
  }

  navigate(){
    let currentRoute
    this.route.parent.url.subscribe(x => {
      currentRoute = x.join('/')
    })
    this.router.navigate(['project/' + currentRoute + '/' + this.blobFileItem.redirect])
    this.changeDirectory.emit(this.blobFileItem.redirect)
    this.selectedItem.emit(null)
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

    console.log(this.blobFileItem.file)
    console.log(timeThen)
    console.log(timeNow)

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

}
