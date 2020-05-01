import { Component, OnInit } from '@angular/core';
import { ProjectService } from '../services/project.service';
import { Project } from '../interfaces/project';

@Component({
  selector: 'app-explore',
  templateUrl: './explore.component.html',
  styleUrls: ['./explore.component.css']
})
export class ExploreComponent implements OnInit {

  constructor(private projectService : ProjectService) { }

  projects : Project[]

  ngOnInit(): void {
    this.projectService.ReadProjectList().subscribe(
      result =>{
        this.projects = result
      }, error =>{
        console.log("Error");      
      });
  }

}
