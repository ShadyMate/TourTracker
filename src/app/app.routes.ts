import { Routes } from '@angular/router';
import { HomeComponent } from '../pages/home/home.component';
import { LoginComponent } from '../pages/login/login.component';
import { RegisterComponent } from '../pages/register/register.component';
import { SettingsComponent } from '../pages/settings/settings.component';
import { TourDetailsComponent } from '../pages/tour-details/tour-details.component';

export const routes: Routes = [
  { path: '', component: HomeComponent, pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'settings', component: SettingsComponent },
  { path: 'tour/:id', component: TourDetailsComponent },
  { path: '**', redirectTo: '' }
];