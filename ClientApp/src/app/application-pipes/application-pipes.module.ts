import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TimeElapsedPipe, RoleFilterPipe, RoutePipe, ProfileImagePipe, ProjectMemberPipe } from './custom.pipe';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: [
    TimeElapsedPipe,
    RoleFilterPipe,
    RoutePipe,
    ProfileImagePipe,
    ProjectMemberPipe
  ],
  exports: [
    TimeElapsedPipe,
    RoleFilterPipe,
    RoutePipe,
    ProfileImagePipe,
    ProjectMemberPipe
  ]
})
export class ApplicationPipesModule { }
