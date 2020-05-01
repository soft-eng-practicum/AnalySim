import { Component, OnInit } from '@angular/core';
import { ProjectService } from 'src/app/services/project.service';
import { Project } from 'src/app/interfaces/project';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-explore-project-list',
  templateUrl: './explore-project-list.component.html',
  styleUrls: ['./explore-project-list.component.css']
})
export class ExploreProjectListComponent implements OnInit {

  constructor(private projectService : ProjectService) { }

  projects : Project[]

  ngOnInit(): void {
    this.projectService.ReadProjectList().subscribe(
      result =>{
        this.projects = result;
      }, error =>{
        console.log(error)
      }
    );    
  }

}
