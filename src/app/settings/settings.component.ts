import { Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl, FormGroup, NgForm, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Subscription } from 'rxjs';
import { User } from '../_models/user.model';
import {MatSnackBar} from '@angular/material/snack-bar';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css'],
})
export class SettingsComponent implements OnInit, OnDestroy {
  accountForm: FormGroup;
  isLoading = false;
  option: string;
  loggedInUser: User;
  private loggedInUserSub: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((paramMap) => {
      // this.isLoading = true;
      if (
        paramMap.get('option') === 'account' ||
        paramMap.get('option') === 'password'
      ) {
        this.option = paramMap.get('option');
      } else {
        this.router.navigate(['/settings/account']);
      }
    });

    this.accountForm = new FormGroup({
      name: new FormControl(null, {
        validators: [Validators.required, Validators.minLength(3)],
      }),
      email: new FormControl(null, {
        validators: [Validators.required],
      }),
    });

    this.loggedInUser = this.authService.getLoggedInUser();
    this.accountForm.setValue({
      name: this.loggedInUser.name,
      email: this.loggedInUser.email,
    });

    this.loggedInUserSub = this.authService
      .getLoggedInUserListener()
      .subscribe((userData) => {
        this.loggedInUser = userData;
        this.accountForm.setValue({
          name: this.loggedInUser.name,
          email: this.loggedInUser.email,
        });
      });
  }

  onUpdateAccount() {
    if (this.accountForm.invalid) {
      return;
    }
    this.isLoading = true;
    this.authService.updateAccount(this.accountForm.value.name).subscribe(
      () => {
        this.isLoading = false;
        this.snackBar.open('Updated account successfully', null, {
          duration: 3000,
          panelClass: ['snackbar-success'],
        });
      },
      () => {
        this.isLoading = false;
      }
    );
  }

  onChangePassword(form: NgForm) {}

  ngOnDestroy() {
    this.loggedInUserSub.unsubscribe();
  }
}
