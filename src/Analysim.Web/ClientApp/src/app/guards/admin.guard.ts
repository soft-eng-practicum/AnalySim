import { Injectable } from '@angular/core';
import {
  CanActivate,
  Router,
} from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { take } from 'rxjs/operators';
import { AccountService } from '../services/account.service';
import { User } from '../interfaces/user';

@Injectable({ providedIn: 'root' })
export class AdminGuard implements CanActivate {
  constructor(
    private account: AccountService,
    private router: Router
  ) {}

  public async canActivate(): Promise<boolean> {
    const isLoggedIn = await firstValueFrom(
      this.account.isLoggedIn.pipe(take(1))
    );
    if (!isLoggedIn) {
      this.router.navigate(['/login']);
      return false;
    }
    const user$ = await this.account.currentUser;       
    const user: User = await firstValueFrom<User>(     
      user$.pipe(take(1))
    );
    if (!user) {
      this.router.navigate(['/login']);
      return false;
    }
    const isAdmin = await firstValueFrom(
      this.account.getIsAdmin(user.userName).pipe(take(1))
    );
    if (!isAdmin) {
      this.router.navigate(['/404']);
      return false;
    }

    return true;
  }
}
