import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { BlobFileItem } from 'src/app/interfaces/blob-file-item';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-file-explorer-item',
  templateUrl: './file-explorer-item.component.html',
  styleUrls: ['./file-explorer-item.component.css']
})
export class FileExplorerItemComponent implements OnInit {

  constructor(private route: ActivatedRoute, private router: Router) { }


  @Input() blobFileItem : BlobFileItem
  @Output() changeDirectory = new EventEmitter<String>();

  ngOnInit(): void {

  }

  navigate(){
    let currentRoute
    this.route.parent.url.subscribe(x => {
      currentRoute = x.join('/')
    })
    this.router.navigate(['project/' + currentRoute + '/' + this.blobFileItem.redirect])
    this.changeDirectory.emit(this.blobFileItem.redirect)
  }

}
