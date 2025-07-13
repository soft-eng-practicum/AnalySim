// src/app/admin/guards/admin-auth.guard.ts
import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree } from '@angular/router';

@Injectable({ providedIn: 'root' })
export class AdminAuthGuard implements CanActivate {
  constructor(private router: Router) {}

  canActivate(): boolean | UrlTree {
    const ok = localStorage.getItem('adminLoggedIn') === 'true';
    if (!ok) return this.router.parseUrl('/admin/login');
    return true;
  }
}
