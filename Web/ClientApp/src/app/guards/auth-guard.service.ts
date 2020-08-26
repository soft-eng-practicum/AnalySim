import { Injectable } from '@angular/core';
import { CanActivate, RouterStateSnapshot, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AccountService } from '../services/account.service';
import { take, map } from 'rxjs/operators';
import { Route } from '@angular/compiler/src/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuardService implements CanActivate {

  constructor(private acct : AccountService, private router: Router) { }

  canActivate(route : ActivatedRouteSnapshot, state : RouterStateSnapshot) : Observable<boolean> {
    return this.acct.isLoggedIn.pipe(take(1), map((loginStatus : boolean) =>
    {
      const destination : string = state.url

      if(!loginStatus){
        this.router.navigate(['/login'], {queryParams: {returnUrl : state.url}})
        return false
      }

      return true

    }))
  }
}
