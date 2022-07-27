import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { ExploreComponent } from './explore/explore.component';
import { ProfileComponent } from './profile/profile.component';
import { ProfileSettingComponent } from './profile/profile-setting/profile-setting.component';
import { AboutUsComponent } from './about-us/about-us.component';
import { ContactUsComponent } from './contact-us/contact-us.component';

const routes: Routes = [];

@NgModule({
  imports: [
    RouterModule.forRoot([
      { path: 'home', component: HomeComponent },
      { path: '', redirectTo: '/home', pathMatch: 'full' },
      { path: "login", component: LoginComponent },
      { path: "aboutus", component: AboutUsComponent },
      { path: "contactus", component: ContactUsComponent },
      { path: "setting/profile", component: ProfileSettingComponent },
      { path: "register", component: RegisterComponent },
      { path: "explore", component: ExploreComponent },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'profile/:username', component: ProfileComponent },
      { path: 'project', loadChildren: () => import('./projects/projects.module').then(m => m.ProjectsModule) },
      { path: '**', component: HomeComponent }
      // todo: Add verify page routing and component
    ])],
  exports: [RouterModule]
})
export class AppRoutingModule { }
