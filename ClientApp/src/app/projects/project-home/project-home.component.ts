import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { ProjectService } from 'src/app/services/project.service';
import { Project } from 'src/app/interfaces/project';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-project-home',
  templateUrl: './project-home.component.html',
  styleUrls: ['./project-home.component.css']
})
export class ProjectHomeComponent implements OnInit {

  projectData : Project

  constructor(
    private route: ActivatedRoute, 
    private projectService: ProjectService
  ) { }

  ngOnInit(): void {
    let id = + this.route.snapshot.params['id'];

    
  }

  

}
