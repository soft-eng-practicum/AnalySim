import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ProjectsModule } from './projects/projects.module';

const routes: Routes = [];

@NgModule({
  imports: [
    RouterModule.forRoot([
      {path: 'home', component: HomeComponent},
      {path: '', component: HomeComponent, pathMatch: 'full'},  
      {path: "login", component: LoginComponent},
      {path: "register", component: RegisterComponent},
      
      {path: 'projects', loadChildren: () => import('./projects/projects.module').then(m => m.ProjectsModule)},
      {path: 'dashboard', component: DashboardComponent},
      {path: '**', redirectTo: '/home'}
    ])],
  exports: [RouterModule]
})
export class AppRoutingModule { }