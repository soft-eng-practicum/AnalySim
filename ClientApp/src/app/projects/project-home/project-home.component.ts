import { Component, OnInit } from '@angular/core';
import { ProjectService } from 'src/app/services/project.service';
import { Project } from 'src/app/interfaces/project';
import { Observable } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-project-home',
  templateUrl: './project-home.component.html',
  styleUrls: ['./project-home.component.css']
})
export class ProjectHomeComponent implements OnInit {

  projectData : Project

  constructor(
    private router : Router,
    private route : ActivatedRoute, 
    private projectService: ProjectService
  ) { }

  ngOnInit(): void {
    let owner = this.route.snapshot.params['owner']
    let projectname = this.route.snapshot.params['projectname']

    console.log(owner)
    console.log(projectname)

    this.projectService.ReadProject(owner, projectname).subscribe(
      result =>{
        this.projectData = result;
      },error =>{
        console.log(error)
        this.router.navigateByUrl('/errors/404NotFound');
        
      }
    )

    
  }

  

}
