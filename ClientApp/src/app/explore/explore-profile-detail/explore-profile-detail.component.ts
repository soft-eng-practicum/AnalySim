import { Component, OnInit, Input } from '@angular/core';
import { ApplicationUser } from 'src/app/interfaces/user';

@Component({
  selector: 'app-explore-profile-detail',
  templateUrl: './explore-profile-detail.component.html',
  styleUrls: ['./explore-profile-detail.component.css']
})
export class ExploreProfileDetailComponent implements OnInit {

  constructor() { }

  @Input() user : ApplicationUser;

  ngOnInit(): void {
  }

}
