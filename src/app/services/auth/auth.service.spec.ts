import { TestBed } from '@angular/core/testing';
import { AuthService } from './auth.service';
import {
  HttpClientTestingModule,
  HttpTestingController
} from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  const baseUrl = 'http://localhost:8060/api/v1/auth/';
  const apiUrl = 'http://localhost:8060/api/v1/auth/authenticate';

  beforeEach(() => {
    const spy = jasmine.createSpyObj('Router', ['navigate']);
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: spy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    routerSpy = TestBed.inject(Router) as jasmine.SpyObj<Router>;
    localStorage.removeItem('jwtToken'); // Clear token before each test
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.removeItem('jwtToken'); // Clear token after each test
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should save token', () => {
    const token = '12345';
    service.saveToken(token);
    expect(localStorage.getItem('jwtToken')).toBe(token);
  });

  it('should get token', () => {
    const token = '12345';
    localStorage.setItem('jwtToken', token);
    expect(service.getToken()).toBe(token);
  });

  it('should return true if user is logged in', () => {
    localStorage.setItem('jwtToken', '12345');
    expect(service.isLoggedIn()).toBe(true);
  });

  it('should return false if user is not logged in', () => {
    localStorage.removeItem('jwtToken');
    expect(service.isLoggedIn()).toBe(false);
  });

  it('should logout user', () => {
    localStorage.setItem('jwtToken', '12345');
    service.logout();
    const req = httpMock.expectOne(`${service['baseUrl']}logout`);
    expect(req.request.method).toBe('POST');
    req.flush({});
    expect(localStorage.getItem('jwtToken')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle error in loginUser method', () => {
    const mockCredentials = { username: 'incorrect', password: 'wrongpassword' };
    const errorMessage = 'Invalid username or password.';

    service.loginUser(mockCredentials).subscribe(
      () => fail('expected an error, not data'),
      error => expect(error.error).toContain(errorMessage)
    );

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush({ error: errorMessage }, { status: 401, statusText: 'Unauthorized' });
  });

  it('should clear token on reload', () => {
    localStorage.setItem('jwtToken', '12345');
    service.clearTokenOnReload();
    const req = httpMock.expectOne(`${service['baseUrl']}logout`);
    expect(req.request.method).toBe('POST');
    req.flush('Logout successful.');
    expect(localStorage.getItem('jwtToken')).toBeNull();
  });

  it('should handle error during token clearance on reload', () => {
    localStorage.setItem('jwtToken', '12345');
    service.clearTokenOnReload();
    const req = httpMock.expectOne(`${service['baseUrl']}logout`);
    expect(req.request.method).toBe('POST');
    req.flush('Error during token clearance on reload', { status: 500, statusText: 'Internal Server Error' });
    expect(localStorage.getItem('jwtToken')).toBe('12345');
  });

  it('should handle forgot password', () => {
    const email = 'test@example.com';
    service.forgotPassword(email).subscribe(response => {
      expect(response).toBe('Password reset email sent successfully.');
    });

    const req = httpMock.expectOne(`${service['baseUrl']}forgot-password?email=${email}`);
    expect(req.request.method).toBe('POST');
    req.flush('Password reset email sent successfully.');
  });

  it('should handle verify token', () => {
    const token = 'valid-token';
    service.verifyToken(token).subscribe(response => {
      expect(response).toBe('Token is valid. Please proceed to set your new password.');
    });

    const req = httpMock.expectOne(`${service['baseUrl']}verify-token?token=${token}`);
    expect(req.request.method).toBe('POST');
    req.flush('Token is valid. Please proceed to set your new password.');
  });

  it('should handle reset password', () => {
    const token = 'valid-token';
    const newPassword = 'newPassword123';
    service.resetPassword(token, newPassword).subscribe(response => {
      expect(response).toBe('Password reset successfully.');
    });

    const req = httpMock.expectOne(`${service['baseUrl']}reset-password?token=${token}&newPassword=${newPassword}`);
    expect(req.request.method).toBe('POST');
    req.flush('Password reset successfully.');
  });
  it('should initiate password reset', () => {
    const testEmail = 'test@example.com';
    const encodedEmail = encodeURIComponent(testEmail);

    service.forgotPassword(testEmail).subscribe(response => {
      expect(response).toBe('Password reset link sent.');
    });

    const req = httpMock.expectOne(
      req => req.url === `${baseUrl}forgot-password` && req.params.get('email') === testEmail
    );
    expect(req.request.method).toBe('POST');
    req.flush('Password reset link sent.');
  });

  it('should verify token', () => {
    const testToken = 'test-token';

    service.verifyToken(testToken).subscribe(response => {
      expect(response).toBe('Token is valid.');
    });

    const req = httpMock.expectOne(
      `${baseUrl}verify-token?token=${encodeURIComponent(testToken)}`
    );
    expect(req.request.method).toBe('POST');
    req.flush('Token is valid.');
  });

  it('should reset password', () => {
    const testToken = 'test-token';
    const newPassword = 'new-password';

    service.resetPassword(testToken, newPassword).subscribe(response => {
      expect(response).toBe('Password reset successful.');
    });

    const req = httpMock.expectOne(
      `${baseUrl}reset-password?token=${encodeURIComponent(
        testToken
      )}&newPassword=${encodeURIComponent(newPassword)}`
    );
    expect(req.request.method).toBe('POST');
    req.flush('Password reset successful.');
  });

  it('should login user', () => {
    const mockCredentials = { username: 'test', password: 'password' };
    const mockResponse = { token: 'fake-jwt-token' };

    service.loginUser(mockCredentials).subscribe(response => {
      expect(response.token).toBe('fake-jwt-token');
    });

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockCredentials);
    req.flush(mockResponse);
  });

  it('should save and retrieve token from localStorage', () => {
    const testToken = 'fake-jwt-token';

    service.saveToken(testToken);
    expect(localStorage.getItem('jwtToken')).toBe(testToken);
    expect(service.getToken()).toBe(testToken);
  });

  it('should check if user is logged in', () => {
    expect(service.isLoggedIn()).toBeFalse();

    service.saveToken('fake-jwt-token');
    expect(service.isLoggedIn()).toBeTrue();
  });



  it('should navigate to login when token is null during logout', () => {
    service.logout();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    httpMock.expectNone(`${baseUrl}logout`);
  });

  it('should handle error in forgotPassword method', () => {
    const testEmail = 'nonexistent@example.com';
    const errorMessage = 'User with this email does not exist.';

    service.forgotPassword(testEmail).subscribe(
      () => fail('expected an error, not data'),
      error => expect(error).toContain(errorMessage)
    );

    const req = httpMock.expectOne(
      req => req.url === `${baseUrl}forgot-password` && req.params.get('email') === testEmail
    );
    req.flush('User with the given email not found.', {
      status: 404,
      statusText: 'Not Found'
    });
  });

  it('should handle error in verifyToken method', () => {
    const invalidToken = 'invalid-token';
    const errorMessage = 'Invalid or expired token.';

    service.verifyToken(invalidToken).subscribe(
      () => fail('expected an error, not data'),
      error => expect(error).toContain(errorMessage)
    );

    const req = httpMock.expectOne(
      `${baseUrl}verify-token?token=${encodeURIComponent(invalidToken)}`
    );
    req.flush('Invalid or expired token.', {
      status: 400,
      statusText: 'Bad Request'
    });
  });

  it('should handle error in resetPassword method', () => {
    const invalidToken = 'invalid-token';
    const newPassword = 'new-password';
    const errorMessage = 'Invalid or expired token.';

    service.resetPassword(invalidToken, newPassword).subscribe(
      () => fail('expected an error, not data'),
      error => expect(error.error).toContain(errorMessage)
    );

    const req = httpMock.expectOne(
      `${baseUrl}reset-password?token=${encodeURIComponent(invalidToken)}&newPassword=${encodeURIComponent(newPassword)}`
    );

  });

  it('should handle error in loginUser method', () => {
    const mockCredentials = { username: 'incorrect', password: 'wrongpassword' };
    const errorMessage = 'Invalid username or password.';

    service.loginUser(mockCredentials).subscribe(
      () => fail('expected an error, not data'),
      error => expect(error.error).toContain(errorMessage)
    );

    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    req.flush({ error: errorMessage }, {
      status: 401,
      statusText: 'Unauthorized'
    });
  });

  it('should handle error during token clearance on reload', () => {
    localStorage.setItem('jwtToken', '12345');
    service.clearTokenOnReload();
    const req = httpMock.expectOne(`${service['baseUrl']}logout`);
    expect(req.request.method).toBe('POST');
    req.flush('Error during token clearance on reload', { status: 500, statusText: 'Internal Server Error' });
    expect(localStorage.getItem('jwtToken')).toBe('12345');
  });

  it('should logout user', () => {
    localStorage.setItem('jwtToken', '12345');
    service.logout();
    const req = httpMock.expectOne(`${baseUrl}logout`);
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer 12345');
    req.flush({});
    expect(localStorage.getItem('jwtToken')).toBeNull();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
  });
});