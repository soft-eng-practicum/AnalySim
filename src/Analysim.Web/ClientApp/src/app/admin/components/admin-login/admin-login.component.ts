import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin-login',
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.scss']
})
export class AdminLoginComponent {
  username = '';
  password = '';
  error: string | null = null;

  constructor(private router: Router) {}

  login() {
    if (this.username === 'ADMIN' && this.password === 'ADMIN') {
      localStorage.setItem('adminLoggedIn', 'true');
      this.router.navigateByUrl('/admin');
    } else {
      this.error = 'Invalid credentials';
    }
  }
}
