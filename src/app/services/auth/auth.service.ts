import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root',

})
export class AuthService {

  private baseUrl = 'http://localhost:8080/api/v1/auth/'; // Corrected backend URL


  constructor(private http: HttpClient,private router: Router) {}

// Method to handle errors
private handleError(error: any) {
  let errorMessage = 'Something bad happened; please try again later.';
  if (error.error instanceof ErrorEvent) {
    // A client-side or network error occurred.
    errorMessage = `Error: ${error.error.message}`;
  } else {
    // The backend returned an unsuccessful response code.
    if (error.status === 404 && error.error === 'User with the given email not found.') {
      errorMessage = 'User with this email does not exist.';
    } else if (error.status === 400 && error.error === 'Invalid or expired token.') {
      errorMessage = 'Invalid or expired token.';
    } else if (error.status === 401 && error.error === 'Invalid username or password.') {
      errorMessage = 'Invalid username or password.';
    } else {
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
    }
  }
  return throwError(errorMessage); // Return an observable with a user-facing error message
}


  // Method to initiate password reset
  forgotPassword(email: string): Observable<any> {
    const params = new HttpParams().set('email', email);
    return this.http.post(`${this.baseUrl}forgot-password`, null, { params, responseType: 'text' }) // Specify response type as 'text'
      .pipe(
        catchError(this.handleError)
      );
  }



  // Method to verify the token
  verifyToken(token: string): Observable<any> {
    const params = new HttpParams().set('token', token);
    return this.http.post(`${this.baseUrl}verify-token`, null, { params, responseType: 'text' }) // Use responseType 'text'
      .pipe(
        catchError(this.handleError)
      );
  }


  resetPassword(token: string, newPassword: string): Observable<any> {
    const params = new HttpParams()
      .set('token', token)
      .set('newPassword', newPassword);
    return this.http.post(`${this.baseUrl}reset-password`, null, { params, responseType: 'text' }).pipe(
      catchError((error) => {
        let errorMessage = 'Something bad happened; please try again later.';
        if (error.error instanceof ErrorEvent) {
          // A client-side or network error occurred.
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // The backend returned an unsuccessful response code.
          if (error.status === 404 && error.error === 'User with the given email not found.') {
            errorMessage = 'User with this email does not exist.';
          } else if (error.status === 400 && error.error === 'Invalid or expired token.') {
            errorMessage = 'Invalid or expired token.';
          } else if (error.status === 401 && error.error === 'Invalid username or password.') {
            errorMessage = 'Invalid username or password.';
          } else {
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
          }
        }
        return throwError({ error: errorMessage }); // Return an observable with the backend error message
      })
    );
  }


  private apiUrl = 'http://localhost:8080/api/v1/auth/authenticate';

  loginUser(credentials: any): Observable<any> {
    return this.http.post(this.apiUrl, credentials).pipe(
      catchError((error) => {
        let errorMessage = 'Something bad happened; please try again later.';
        if (error.error instanceof ErrorEvent) {
          // A client-side or network error occurred.
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // The backend returned an unsuccessful response code.
          if (error.status === 404 && error.error === 'User with the given email not found.') {
            errorMessage = 'User with this email does not exist.';
          } else if (error.status === 400 && error.error === 'Invalid or expired token.') {
            errorMessage = 'Invalid or expired token.';
          } else if (error.status === 401 && error.error === 'Invalid username or password.') {
            errorMessage = 'Invalid username or password.';
          } else {
            errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
          }
        }
        return throwError(error.error); // Return an observable with the backend error message
      })
    );
  }

  saveToken(token: string): void {
    localStorage.setItem('jwtToken', token);
  }

  getToken(): string | null {
    return localStorage.getItem('jwtToken');
  }
  isLoggedIn(): boolean {
    const token = localStorage.getItem('jwtToken');
    // You might also want to check if the token is valid and not expired
    return token !== null;
  }

  logout2(): void {
          localStorage.removeItem('jwtToken');
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.baseUrl}logout`, { token }).subscribe(
        () => {
          localStorage.removeItem('jwtToken');
          this.router.navigate(['/login']);
        },
        (error) => {
          console.error('Error during logout:', error);
        }
      );
    } else {
      this.router.navigate(['/login']);
    }
  }

  logout(): void {
    const token = this.getToken();
    if (token) {
      const headers = { Authorization: `Bearer ${token}` };
      this.http.post(`${this.baseUrl}logout`, {}, { headers }).subscribe(
        () => {
          localStorage.removeItem('jwtToken');
          this.router.navigate(['/login']);
        },
        (error) => {
          console.error('Error during logout:', error);
        }
      );
    } else {
      this.router.navigate(['/login']);
    }
  }

  clearTokenOnReload(): void {
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.baseUrl}logout`, { token }, { responseType: 'text' }).subscribe(
        (response) => {
          console.log(response); // Should log "Logout successful."
          localStorage.removeItem('jwtToken');
        },
        (error) => {
          console.error('Error during token clearance on reload:', error);
        }
      );
    }
  }


}



