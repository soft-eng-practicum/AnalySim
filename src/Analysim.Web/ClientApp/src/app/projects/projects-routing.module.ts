import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectCreateComponent } from './project-create/project-create.component';
import { ProjectEditComponent } from './project-edit/project-edit.component';
import { AuthGuardService } from '../guards/auth-guard.service';
import { ProjectComponent } from './project/project.component';
import { ProjectFileExplorerComponent } from './project-file-explorer/project-file-explorer.component';
import { ProjectPublicationComponent } from './project-overview/project-overview-view/project-publication/project-publication.component';
import { ProjectLogComponent } from './project-overview/project-overview-view/project-log/project-log.component';


const routes: Routes = [
  { path: 'create', component: ProjectCreateComponent, canActivate: [AuthGuardService] },
  { path: 'edit', component: ProjectEditComponent, canActivate: [AuthGuardService] },
  { path: ':owner/:projectname', component: ProjectComponent },
  {
    path: ':owner/:projectname',
    children: [
      {
      path: "**", component: ProjectComponent
      },
      {
        path: "file", component: ProjectFileExplorerComponent
      },
      {
        path: "notebook", component: ProjectComponent
      },
      {
        path: "comment", component: ProjectPublicationComponent
      },
      {
        path: "log", component: ProjectLogComponent
      },
      {
        path: "publications", component: ProjectPublicationComponent
      }

    ]
  },
  { path: '**', redirectTo: 'create' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule { }