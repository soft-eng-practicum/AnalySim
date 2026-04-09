import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AuthGuardService } from '../guards/auth-guard.service';
import { AdminGuard } from '../guards/admin.guard';
import { NotebooksComponent } from './components/notebooks/notebooks.component';
import { UsersComponent } from './components/users/users.component';
import { DatasetsComponent } from './components/datasets/datasets.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { CommentsComponent } from './components/comments/comments.component';

const routes: Routes = [
  {
    path: '',
    component: AdminComponent,
    canActivate: [AuthGuardService, AdminGuard],
    children: [
      { path: 'notebooks/:notebookRoute', component: NotebooksComponent },
      { path: 'notebooks', component: NotebooksComponent },
      { path: 'users', component: UsersComponent },
      { path: 'datasets', component: DatasetsComponent },
      { path: 'projects', component: ProjectsComponent },
      { path: 'comments', component: CommentsComponent },
      { path: '', redirectTo: 'notebooks', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
