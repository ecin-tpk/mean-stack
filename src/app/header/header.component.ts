import { Component, OnDestroy, OnInit } from '@angular/core';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { AuthDialogComponent } from '../auth/auth-dialog/auth-dialog.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
})
export class HeaderComponent implements OnInit, OnDestroy {
  userIsAuthenticated = false;
  userName: string;
  private authListenerSub: Subscription;
  private userNameListenerSub: Subscription;

  constructor(private authService: AuthService, public dialog: MatDialog) {}

  ngOnInit() {
    this.userIsAuthenticated = this.authService.getIsAuth();
    this.userName = this.authService.getUserName();
    this.authListenerSub = this.authService
      .getAuthStatusListener()
      .subscribe((isAuthenticated) => {
        this.userIsAuthenticated = isAuthenticated;
      });
    this.userNameListenerSub = this.authService
      .getUserNameListener()
      .subscribe((name) => {
        this.userName = name;
      });
  }

  onLogout() {
    this.authService.logout();
  }

  openSignUpDialog(mode: 'login' | 'signUp') {
    const dialogConfig = new MatDialogConfig();

    dialogConfig.data = {
      mode,
    };
    dialogConfig.width = '500px';
    dialogConfig.autoFocus = false;

    this.dialog.open(AuthDialogComponent, dialogConfig);

    // const dialogRef = this.dialog.open(AuthDialogComponent, dialogConfig);
    //
    // dialogRef.afterClosed().subscribe((result) => {
    //   console.log(`Dialog result: ${result}`);
    // });
  }

  ngOnDestroy() {
    this.authListenerSub.unsubscribe();
    this.userNameListenerSub.unsubscribe();
  }
}
