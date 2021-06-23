import { Component, OnInit } from '@angular/core';
import { Project } from 'src/app/interfaces/project';
import { Input } from '@angular/core';
import { ProjectService } from 'src/app/services/project.service';


@Component({
  selector: 'app-member-list',
  templateUrl: './member-list.component.html',
  styleUrls: ['./member-list.component.css']
})
export class MemberListComponent implements OnInit {
    
  constructor(
    private projectService : ProjectService) { }

    @Input() project : Project

    async ngOnInit() {
      }
}