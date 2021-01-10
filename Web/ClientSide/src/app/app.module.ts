import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module'

import { CoreModule } from '@core/core.module';
import { DataModule } from '@data/data.module';
import { SharedModule } from '@shared/shared.module';

import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout/auth-layout.component';
import { ContentLayoutComponent } from './layout/content-layout/content-layout.component';

@NgModule({
  declarations: [
    AppComponent,
    AuthLayoutComponent,
    ContentLayoutComponent,
  ],
  imports: [
    // Angular
    BrowserModule,

    // Architecture
    CoreModule,
    SharedModule,
    DataModule,

    // App
    AppRoutingModule,
    BrowserAnimationsModule,

  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
