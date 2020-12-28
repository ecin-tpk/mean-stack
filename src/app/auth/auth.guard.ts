import { Injectable } from '@angular/core';
import {
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  UrlTree,
  Router,
} from '@angular/router';
import { Observable } from 'rxjs';
import { AuthService } from './auth.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AuthDialogComponent } from './auth-dialog/auth-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ):
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    const isAuth = this.authService.getIsAuth();
    if (!isAuth) {
      const dialogConfig = new MatDialogConfig();

      dialogConfig.data = {
        mode: 'login',
      };
      dialogConfig.width = '500px';
      dialogConfig.autoFocus = false;

      this.router.navigate(['/']);
      this.dialog.open(AuthDialogComponent, dialogConfig);
    }
    return true;
  }
}
