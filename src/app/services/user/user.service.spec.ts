import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { UserService } from './user.service';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:8060/api/v1/auth';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [UserService]
    });

    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all users', () => {
    const mockUsers = [{ id: 1, name: 'User 1' }, { id: 2, name: 'User 2' }];

    service.getAllUsers().subscribe(users => {
      expect(users.length).toBe(2);
      expect(users).toEqual(mockUsers);
    });

    const req = httpMock.expectOne(`${baseUrl}/all-users`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUsers);
  });

  it('should delete a user by ID', () => {
    const userId = 1;

    service.deleteUser(userId).subscribe(response => {
      expect(response.status).toBe(200);
    });

    const req = httpMock.expectOne(`${baseUrl}/delete-user/${userId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({}, { status: 200, statusText: 'OK' });
  });

  it('should update a user by ID', () => {
    const userId = 1;
    const updatedUser = { name: 'Updated User' };

    service.updateUser(updatedUser, userId).subscribe(response => {
      expect(response.status).toBe(200);
    });

    const req = httpMock.expectOne(`${baseUrl}/update-user/${userId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedUser);
    req.flush({}, { status: 200, statusText: 'OK' });
  });

  it('should get user info', () => {
    const mockUserInfo = { id: 1, name: 'User 1' };

    service.getUserInfo().subscribe(userInfo => {
      expect(userInfo).toEqual(mockUserInfo);
    });

    const req = httpMock.expectOne(`${baseUrl}/user-info`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUserInfo);
  });

  it('should get image by ID', () => {
    const userId = 1;
    const mockImageBlob = new Blob(['image content'], { type: 'image/png' });

    service.getImage(userId).subscribe(image => {
      expect(image).toEqual(mockImageBlob);
    });

    const req = httpMock.expectOne(`${baseUrl}/${userId}/profile-photo`);
    expect(req.request.method).toBe('GET');
    req.flush(mockImageBlob);
  });

  it('should upload image', () => {
    const userId = 1;
    const mockFile = new File(['image content'], 'image.png', { type: 'image/png' });
    const mockResponse = 'Image uploaded successfully';

    service.uploadImage(mockFile, userId).subscribe(response => {
      expect(response).toBe(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/${userId}/upload`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush(mockResponse);
  });

  it('should create a new user', () => {
    const newUser = { name: 'New User' };
    const mockResponse = { id: 1, name: 'New User' };

    service.createUser(newUser).subscribe(user => {
      expect(user).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/register`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newUser);
    req.flush(mockResponse);
  });

  it('should get user by email', () => {
    const email = 'test@example.com';
    const mockUser = { id: 1, name: 'User 1', email: 'test@example.com' };

    service.getUserByEmail(email).subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${baseUrl}/email/${email}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should get role by name', () => {
    const role = 'admin';
    const mockRole = { id: 1, name: 'admin' };

    service.getRole(role).subscribe(role => {
      expect(role).toEqual(mockRole);
    });

    const req = httpMock.expectOne(`${baseUrl}/roles/${role}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockRole);
  });

  it('should get user by ID', () => {
    const userId = '1';
    const mockUser = { id: 1, name: 'User 1' };

    service.getUserById(userId).subscribe(user => {
      expect(user).toEqual(mockUser);
    });

    const req = httpMock.expectOne(`${baseUrl}/user/${userId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockUser);
  });

  it('should trigger user created event', () => {
    let eventTriggered = false;
    service.userCreated$.subscribe(() => {
      eventTriggered = true;
    });

    service.triggerUserCreated();
    expect(eventTriggered).toBeTrue();
  });
});