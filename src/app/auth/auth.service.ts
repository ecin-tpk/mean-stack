import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';

declare const FB: any;

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private userId: string;
  private tokenTimer: any;
  private isAuthenticated = false;
  private token: string;
  private userName: string;
  private authStatusListener = new Subject<boolean>();
  private userNameListener = new Subject<string>();

  constructor(private http: HttpClient, private router: Router) {}

  getToken() {
    return this.token;
  }

  getIsAuth() {
    return this.isAuthenticated;
  }

  getUserName() {
    return this.userName;
  }

  getUserId() {
    return this.userId;
  }

  getAuthStatusListener() {
    return this.authStatusListener.asObservable();
  }

  getUserNameListener() {
    return this.userNameListener.asObservable();
  }

  createUser(name: string, email: string, password: string) {
    const body = { email, password };
    this.http
      .post('http://localhost:3000/api/user/signup', body)
      .subscribe((res) => {
        console.log(res);
        this.router.navigate(['/']);
      });
  }

  emailLogin(email: string, password: string) {
    const body = { email, password };
    this.http
      .post<{ token: string; expiresIn: number; userId: string; name: string }>(
        'http://localhost:3000/api/user/login',
        body
      )
      .subscribe((res) => {
        this.token = res.token;
        if (this.token) {
          const expiresIn = res.expiresIn;
          this.setAuthTimer(expiresIn);
          this.userId = res.userId;
          this.userName = res.name;
          this.isAuthenticated = true;
          this.authStatusListener.next(true);
          this.userNameListener.next(res.name);
          const expirationDate = new Date(
            new Date().getTime() + expiresIn * 1000
          );
          this.saveAuthData(res.token, expirationDate, res.userId, res.name);
          this.router.navigate(['/']);
        }
      });
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
              }>(`http://localhost:3000/api/user/auth/facebook`, {
                access_token: result.authResponse.accessToken,
              })
              .toPromise()
              .then((res) => {
                console.log(res);
                this.token = res.token;
                if (this.token) {
                  const expiresIn = res.expiresIn;
                  this.setAuthTimer(expiresIn);
                  this.userId = res.userId;
                  this.userName = res.name;
                  this.isAuthenticated = true;
                  this.authStatusListener.next(true);
                  this.userNameListener.next(res.name);
                  const expirationDate = new Date(
                    new Date().getTime() + expiresIn * 1000
                  );
                  this.saveAuthData(
                    res.token,
                    expirationDate,
                    res.userId,
                    res.name
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

  private setAuthTimer(duration: number) {
    this.tokenTimer = setTimeout(() => {
      this.logout();
    }, duration * 1000);
  }

  private saveAuthData(
    token: string,
    expirationDate: Date,
    userId: string,
    userName: string
  ) {
    localStorage.setItem('token', token);
    localStorage.setItem('expiration', expirationDate.toISOString());
    localStorage.setItem('userId', userId);
    localStorage.setItem('userName', userName);
  }

  private clearAuthData() {
    localStorage.removeItem('token');
    localStorage.removeItem('expiration');
    localStorage.removeItem('userId');
  }

  private getAuthData() {
    const token = localStorage.getItem('token');
    const expirationDate = localStorage.getItem('expiration');
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    if (!token || !expirationDate) {
      return;
    }
    return {
      token,
      expirationDate: new Date(expirationDate),
      userId,
      userName,
    };
  }
}
