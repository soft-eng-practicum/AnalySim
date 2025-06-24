import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { NotebooksComponent } from './components/notebooks/notebooks.component';
import { UsersComponent } from './components/users/users.component';
import { DatasetsComponent } from './components/datasets/datasets.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { AdminNotebookItemComponent } from './components/notebooks/admin-notebook-item/admin-notebook-item.component';

@NgModule({
  declarations: [
    AdminComponent,
    NotebooksComponent,
    UsersComponent,
    DatasetsComponent,
    ProjectsComponent,
    AdminNotebookItemComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule
  ]
})
export class AdminModule { }
