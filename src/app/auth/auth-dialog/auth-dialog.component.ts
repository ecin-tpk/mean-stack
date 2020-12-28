import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GoogleLoginProvider, SocialAuthService } from 'angularx-social-login';

@Component({
  selector: 'app-auth-dialog',
  templateUrl: './auth-dialog.component.html',
  styleUrls: ['./auth-dialog.component.css'],
})
export class AuthDialogComponent implements OnInit, OnDestroy {
  title: string;
  subtitle: string;
  emailRegistration = false;
  isLoading = false;
  mode: 'login' | 'signUp';

  constructor(
    private socialAuthService: SocialAuthService,
    private router: Router,
    private authService: AuthService,
    public dialogRef: MatDialogRef<AuthDialogComponent>,
    private snackBar: MatSnackBar,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'login' | 'signUp' }
  ) {
    this.mode = data.mode;
    if (data.mode === 'signUp') {
      this.title = 'Hey there!';
      this.subtitle =
        'Share anything you find interesting and discover what makes you laugh.';
    } else {
      this.title = 'Login';
      this.subtitle = 'Connect with social network';
    }
  }

  ngOnInit() {}

  onRegisterEmail() {
    this.emailRegistration = true;
  }

  onLoginOption() {
    this.mode = 'login';
    this.title = 'Login';
    this.subtitle = 'Connect with social network';
  }

  fbLogin() {
    this.authService.fbLogin().then(() => {
      this.router.navigate(['/']);
    });
    this.dialogRef.close();
  }

  googleLogin() {
    this.isLoading = true;
    this.socialAuthService.signIn(GoogleLoginProvider.PROVIDER_ID);
    this.socialAuthService.authState.subscribe((user) => {
      this.authService
        .googleLogin(user.id, user.name, user.email, user.idToken)
        .subscribe(
          () => {
            this.dialogRef.close();
            this.router.navigate(['/']);
          },
          () => {
            this.isLoading = false;
          }
        );
    });
  }

  onEmailLogin(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService
      .emailLogin(form.value.email, form.value.password)
      .subscribe(
        () => {
          this.dialogRef.close();
          this.router.navigate(['/']);
        },
        () => {
          this.isLoading = false;
        }
      );
  }

  onSignUp(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService
      .createUser(form.value.name, form.value.email, form.value.password)
      .subscribe(
        (res) => {
          this.dialogRef.close();
          this.router.navigate(['/']);
          this.snackBar.open('Registration successful', null, {
            duration: 3000,
            panelClass: ['snackbar-success'],
          });
        },
        (err) => {
          this.isLoading = false;
        }
      );
    // this.dialogRef.close();
  }

  ngOnDestroy() {}
}
