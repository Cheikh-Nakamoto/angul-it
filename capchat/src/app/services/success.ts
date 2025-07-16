import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, GuardResult, MaybeAsync, Router, RouterStateSnapshot, UrlTree } from '@angular/router';
import { DataService } from './data-service';

@Injectable({
  providedIn: 'root'
})

export class Success implements CanActivate{

  constructor(
    private router : Router,
    private dataService : DataService
  ) { }
  canActivate(): boolean|UrlTree {
    if (this.dataService.IsValidate()){
      return true;
    }
    return this.router.createUrlTree(['']);
  }

}
