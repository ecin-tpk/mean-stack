import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpInterceptor,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  constructor(private snackBar: MatSnackBar) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<any> {
    return next.handle(request).pipe(
      catchError((err) => {
        let errorMessage = 'An unknown error occurred';
        if (err.error.message) {
          errorMessage = err.error.message;
        }
        this.snackBar.open(errorMessage, null, {
          duration: 3000,
          panelClass: ['snackbar-error'],
        });
        return throwError(err);
      })
    );
  }
}
