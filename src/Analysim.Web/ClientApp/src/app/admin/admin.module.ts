import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminRoutingModule } from './admin-routing.module';
import { AdminComponent } from './admin.component';
import { NotebooksComponent } from './components/notebooks/notebooks.component';
import { UsersComponent } from './components/users/users.component';
import { DatasetsComponent } from './components/datasets/datasets.component';
import { FormsModule } from '@angular/forms';
import { SaveConfirmationModalComponent } from './components/notebooks/save-confirmation-modal/save-confirmation-modal.component';
import { SaveNotebookModalComponent } from './components/notebooks/save-notebook-modal/save-notebook-modal.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { AdminNotebookItemComponent } from './components/notebooks/admin-notebook-item/admin-notebook-item.component';
import { AdminNotebookItemDisplayComponent } from './components/notebooks/admin-notebook-item/admin-notebook-item-display/admin-notebook-item-display/admin-notebook-item-display.component';
import { ProjectsModule } from '../projects/projects.module';
import { UserDisplayComponent } from './components/users/user-display/user-display.component';
import { ProjectDisplayComponent } from './components/projects/project-display/project-display.component';
import { DatasetActionsComponent } from './components/datasets/dataset-actions/dataset-actions.component';

@NgModule({
  declarations: [
    AdminComponent,
    NotebooksComponent,
    UsersComponent,
    SaveConfirmationModalComponent,
    SaveNotebookModalComponent,
    DatasetsComponent,
    ProjectsComponent,
    AdminNotebookItemComponent,
    AdminNotebookItemDisplayComponent,
    UserDisplayComponent,
    ProjectDisplayComponent,
    DatasetActionsComponent
  ],
  imports: [
    CommonModule,
    AdminRoutingModule,
    ProjectsModule,
    FormsModule
  ]
})
export class AdminModule { }
