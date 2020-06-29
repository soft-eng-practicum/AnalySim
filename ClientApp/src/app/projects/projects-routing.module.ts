import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectCreateComponent } from './project-create/project-create.component';
import { AuthGuardService } from '../guards/auth-guard.service';
import { ProjectComponent } from './project/project.component';
import { ProjectFileExplorerComponent } from './project-file-explorer/project-file-explorer.component';


const routes: Routes = [
    {path: 'create', component : ProjectCreateComponent, canActivate : [AuthGuardService]},
    {path: ':owner/:projectname', component : ProjectComponent},
    { path: ':owner/:projectname/files', 
      children : [{
        path: "**", component: ProjectFileExplorerComponent
      }
    ]},
    {path: '**', redirectTo: 'files'}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule { }
