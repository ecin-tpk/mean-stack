import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { NgForm } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-auth-dialog',
  templateUrl: './auth-dialog.component.html',
  styleUrls: ['./auth-dialog.component.css'],
})
export class AuthDialogComponent implements OnInit {
  title: string;
  subtitle: string;
  emailRegistration = false;
  mode: 'login' | 'signUp';
  isLoading = false;

  constructor(
    private router: Router,
    private authService: AuthService,
    public dialogRef: MatDialogRef<AuthDialogComponent>,
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

  onEmailLogin(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.emailLogin(form.value.email, form.value.password);
    this.dialogRef.close();
  }

  onSignUp(form: NgForm) {
    if (form.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.createUser(form.value.name, form.value.email, form.value.password );
    this.dialogRef.close();
  }
}
