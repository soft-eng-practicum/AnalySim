import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ProjectCreateComponent } from './project-create/project-create.component';
import { ProjectHomeComponent } from './project-home/project-home.component';
import { AuthGuardService } from '../guards/auth-guard.service';


const routes: Routes = [
    {path: '', component: ProjectCreateComponent},
    {path: 'create', component : ProjectCreateComponent, canActivate : [AuthGuardService]},
    {path: ':owner/:projectname', component : ProjectHomeComponent},
    {path: '**', redirectTo: ''}
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProjectsRoutingModule { }
