import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AdminLoginComponent }  from './components/admin-login/admin-login.component';
import { AdminAuthGuard }       from './guards/admin-auth.guard';
import { NotebooksComponent } from './components/notebooks/notebooks.component';
import { UsersComponent } from './components/users/users.component';
import { DatasetsComponent } from './components/datasets/datasets.component';
import { ProjectsComponent } from './components/projects/projects.component';

const routes: Routes = [
  { path: 'login', component: AdminLoginComponent },

  {
    path: '',
    component: AdminComponent,
    canActivate: [AdminAuthGuard],
    children: [
      { path: 'notebooks/:notebookRoute', component: NotebooksComponent },
      { path: 'notebooks', component: NotebooksComponent },
      { path: 'users', component: UsersComponent },
      { path: 'datasets', component: DatasetsComponent },
      { path: 'projects', component: ProjectsComponent },
      { path: '', redirectTo: 'notebooks', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class AdminRoutingModule { }
