import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'; 
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { ModalModule } from 'ngx-bootstrap/modal';

import { AppComponent } from './app.component';
import { NavbarComponent } from './navbar/navbar.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { FooterComponent } from './footer/footer.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FavoritesComponent } from './dashboard/favorites/favorites.component';
import { ExploreComponent } from './explore/explore.component';
import { FileExplorerComponent } from './file-explorer/file-explorer.component';
import { ProfileComponent } from './profile/profile.component';
import { ProjectCardComponent } from './shared/project-card/project-card.component';
import { ProfileCardComponent } from './shared/profile-card/profile-card.component';
import { ProfileSettingComponent } from './profile/profile-setting/profile-setting.component';
import { ApplicationPipesModule } from './application-pipes/application-pipes.module';
import { DashboardSocialComponent } from './dashboard/dashboard-social/dashboard-social.component';
import { DashboardFollowingComponent } from './dashboard/dashboard-following/dashboard-following.component';
import { DashboardQuickstartComponent } from './dashboard/dashboard-quickstart/dashboard-quickstart.component';

import { FileService } from './services/file.service';
import { NotFoundComponent } from './error/not-found/not-found.component';


@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    FooterComponent,
    DashboardComponent,
    FavoritesComponent,
    ExploreComponent,
    FileExplorerComponent,
    ProfileComponent,
    ProjectCardComponent,
    ProfileCardComponent,
    ProfileSettingComponent,
    DashboardSocialComponent,
    DashboardFollowingComponent,
    DashboardQuickstartComponent,
    NavbarComponent,
    NotFoundComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ApplicationPipesModule,
    ModalModule.forRoot(),
    ToastrModule.forRoot()
  ],
  providers: [
    FileService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
