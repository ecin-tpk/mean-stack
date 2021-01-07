import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { tap } from 'rxjs/operators';

import { User } from '../_models/user.model';

declare const FB: any;

const baseUrl = `${environment.apiUrl}/user`;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private loggedInUser: User;
  private userId: string;
  private tokenTimer: any;
  private isAuthenticated = false;
  private token: string;
  private userName: string;
  private authStatusListener = new Subject<boolean>();
  private userNameListener = new Subject<string>();

  private loggedInUserListener = new Subject<User>();

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getLoggedInUser() {
    return this.loggedInUser;
  }

  getUserName() {
    return this.userName;
  }

  getUserId() {
    return this.userId;
  }

  getLoggedInUserListener() {
    return this.loggedInUserListener.asObservable();
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getUserNameListener() {
    return this.userNameListener.asObservable();
  }

  createUser(name: string, email: string, password: string) {
    const body = { name, email, password };
    return this.http.post(`${baseUrl}/signup`, body);
  }

  emailLogin(email: string, password: string) {
    const body = { email, password };
    return this.http
      .post<{
        token: string;
        expiresIn: number;
        userId: string;
        name: string;
        email: string;
        type: string;
      }>(`${baseUrl}/login`, body)
      .pipe(
        tap((res) => {
          this.token = res.token;
          if (this.token) {
            const expiresIn = res.expiresIn;
            this.setAuthTimer(expiresIn);
            this.userId = res.userId;
            this.userName = res.name;
            this.isAuthenticated = true;

            this.loggedInUser = {
              id: res.userId,
              name: res.name,
              email: res.email,
              type: res.type,
            };
            this.loggedInUserListener.next(this.loggedInUser);

            this.authStatusListener.next(true);
            this.userNameListener.next(res.name);
            const expirationDate = new Date(
              new Date().getTime() + expiresIn * 1000
            );
            this.saveAuthData(
              res.token,
              expirationDate,
              res.userId,
              res.name,
              res.email,
              res.type
            );
          }
        })
      );
  }

  logout() {
    this.userId = null;
    this.token = null;
    this.isAuthenticated = false;
    this.authStatusListener.next(false);
    clearTimeout(this.tokenTimer);
    this.clearAuthData();
    this.router.navigate(['/']);
  }

  autoAuth() {
    const authInformation = this.getAuthData();
    if (!authInformation) {
      return;
    }
    const expiresIn =
      authInformation.expirationDate.getTime() - new Date().getTime();
    if (expiresIn > 0) {
      this.token = authInformation.token;
      this.userId = authInformation.userId;
      this.userName = authInformation.userName;
      this.isAuthenticated = true;
      this.setAuthTimer(expiresIn / 1000);
      this.authStatusListener.next(true);
      this.userNameListener.next(this.userName);

      this.loggedInUser = {
        id: authInformation.userId,
        name: authInformation.userName,
        email: authInformation.userEmail,
        type: authInformation.userType,
      };
      this.loggedInUserListener.next(this.loggedInUser);
    }
  }

  fbLogin() {
    return new Promise((resolve, reject) => {
      FB.login(
        (result) => {
          if (result.authResponse) {
            return this.http
              .post<{
                token: string;
                expiresIn: number;
                userId: string;
                name: string;
                email: string;
              }>(`${baseUrl}/auth/facebook`, {
                access_token: result.authResponse.accessToken,
              })
              .toPromise()
              .then((res) => {
                this.token = res.token;
                if (this.token) {
                  const expiresIn = res.expiresIn;
                  this.setAuthTimer(expiresIn);
                  this.userId = res.userId;
                  this.userName = res.name;
                  this.isAuthenticated = true;

                  this.loggedInUser = {
                    id: res.userId,
                    name: res.name,
                    email: res.email,
                  };
                  this.loggedInUserListener.next(this.loggedInUser);

                  this.authStatusListener.next(true);
                  this.userNameListener.next(res.name);
                  const expirationDate = new Date(
                    new Date().getTime() + expiresIn * 1000
                  );
                  this.saveAuthData(
                    res.token,
                    expirationDate,
                    res.userId,
                    res.name,
                    res.email
                  );
                }
                resolve(res);
              })
              .catch(() => reject());
          } else {
            reject();
          }
        },
        { scope: 'public_profile,email' }
      );
    });
  }

  googleLogin(id: string, name: string, email: string, idToken: string) {
    return this.http
      .post<{
        token: string;
        expiresIn: number;
        userId: string;
        name: string;
        email: string;
      }>(`${baseUrl}/auth/google`, { id, name, email, idToken })
      .pipe(
        tap((res) => {
          this.token = res.token;
          if (this.token) {
            const expiresIn = res.expiresIn;
            this.setAuthTimer(expiresIn);
            this.userId = res.userId;
            this.userName = res.name;
            this.isAuthenticated = true;

            this.loggedInUser = {
              id: res.userId,
              name: res.name,
              email: res.email,
            };
            this.loggedInUserListener.next(this.loggedInUser);

            this.authStatusListener.next(true);
            this.userNameListener.next(res.name);
            const expirationDate = new Date(
              new Date().getTime() + expiresIn * 1000
            );
            this.saveAuthData(
              res.token,
              expirationDate,
              res.userId,
              res.name,
              res.email
            );
          }
        })
      );
  }

  updateAccount(name: string) {
    const body = { name };
    return this.http.put(`${baseUrl}/update`, body).pipe(
      tap(() => {
        localStorage.setItem('userName', name);
        this.loggedInUser.name = name;
        this.userName = name;
        this.loggedInUserListener.next(this.loggedInUser);
        this.userNameListener.next(name);
      })
    );
  }

  changePassword(password: string, newPassword: string) {
    const body = { password, newPassword };
    return this.http.put(`${baseUrl}/change-password`, body);
  }

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
      this.router.navigate(['/'], { queryParams: { login: true } });
    }, duration * 1000);
  }

  private saveAuthData(
    token: string,
    expirationDate: Date,
    userId: string,
    userName: string,
    email: string,
    type?: string
  ) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
    localStorage.setItem('userName', userName);
    localStorage.setItem('userEmail', email);
    localStorage.setItem('userType', type);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userType');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    const userType = localStorage.getItem('userType');
    if (!token || !expirationDate) {
      return;
    }
    return {
      token,
      expirationDate: new Date(expirationDate),
      userId,
      userName,
      userEmail,
      userType,
    };
  }
}
