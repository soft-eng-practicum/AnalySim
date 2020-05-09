import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http'; 
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { ToastrModule } from 'ngx-toastr';
import { ModalModule } from 'ngx-bootstrap/modal';

import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { RegisterComponent } from './register/register.component';
import { FooterComponent } from './footer/footer.component';
import { HeaderComponent } from './header/header.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { QuickstartComponent } from './dashboard/quickstart/quickstart.component';
import { FavoritesComponent } from './dashboard/favorites/favorites.component';
import { FileService } from './services/file.service';
import { SidebarComponent } from './sidebar/sidebar.component';
import { NotFoundComponent } from './errors/not-found/not-found.component';
import { ExploreComponent } from './explore/explore.component';
import { ExploreProjectDetailComponent } from './explore/explore-project-detail/explore-project-detail.component';
import { FileExplorerComponent } from './file-explorer/file-explorer.component';
import { timeElapsedPipe, RoleFilterPipe, RoutePipe } from './custom.pipe';
import { ExploreProfileDetailComponent } from './explore/explore-profile-detail/explore-profile-detail.component';



@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    RegisterComponent,
    FooterComponent,
    HeaderComponent,
    DashboardComponent,
    QuickstartComponent,
    FavoritesComponent,
    SidebarComponent,
    NotFoundComponent,
    ExploreComponent,
    ExploreProjectDetailComponent,
    FileExplorerComponent,
    RoleFilterPipe,
    timeElapsedPipe,
    RoutePipe,
    ExploreProfileDetailComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    ModalModule.forRoot(),
    ToastrModule.forRoot()
  ],
  providers: [
    FileService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
