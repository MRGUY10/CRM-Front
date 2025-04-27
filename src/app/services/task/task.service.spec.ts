import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { TaskService } from './task.service';

describe('TaskService', () => {
  let service: TaskService;
  let httpMock: HttpTestingController;

  const baseUrl = 'http://localhost:8084/events/tasks';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [TaskService]
    });

    service = TestBed.inject(TaskService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all tasks', () => {
    const mockTasks = [{ id: 1, name: 'Task 1' }, { id: 2, name: 'Task 2' }];

    service.getAllTasks().subscribe(tasks => {
      expect(tasks.length).toBe(2);
      expect(tasks).toEqual(mockTasks);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('GET');
    req.flush(mockTasks);
  });

  it('should get tasks by candidate ID', () => {
    const candidateId = '123';
    const mockTasks = [{ id: 1, name: 'Task 1' }];

    service.getTasksByCandidateId(candidateId).subscribe(tasks => {
      expect(tasks.length).toBe(1);
      expect(tasks).toEqual(mockTasks);
    });

    const req = httpMock.expectOne(`${baseUrl}/${candidateId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTasks);
  });

  it('should get tasks by status', () => {
    const status = 'completed';
    const mockTasks = [{ id: 1, name: 'Task 1' }];

    service.getTasksByStatus(status).subscribe(tasks => {
      expect(tasks.length).toBe(1);
      expect(tasks).toEqual(mockTasks);
    });

    const req = httpMock.expectOne(`${baseUrl}/status/${status}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTasks);
  });

  it('should create a new task', () => {
    const newTask = { name: 'New Task' };
    const mockResponse = { id: 1, name: 'New Task' };

    service.createTask(newTask).subscribe(task => {
      expect(task).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(baseUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newTask);
    req.flush(mockResponse);
  });

  it('should update an existing task', () => {
    const taskId = 1;
    const updatedTask = { name: 'Updated Task' };

    service.updateTask(taskId, updatedTask).subscribe(response => {
      expect(response).toEqual(updatedTask);
    });

    const req = httpMock.expectOne(`${baseUrl}/${taskId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedTask);
    req.flush(updatedTask);
  });

  it('should delete a task', () => {
    const taskId = 1;

    service.deleteTask(taskId).subscribe(response => {
      expect(response.status).toBe(200);
    });

    const req = httpMock.expectOne(`${baseUrl}/${taskId}`);
    expect(req.request.method).toBe('DELETE');
    req.flush({}, { status: 200, statusText: 'OK' });
  });

  it('should mark a task as completed', () => {
    const taskId = 1;
    const mockResponse = { id: 1, name: 'Task 1', completed: true };

    service.markTaskAsCompleted(taskId).subscribe(task => {
      expect(task).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${baseUrl}/${taskId}/complete`);
    expect(req.request.method).toBe('PATCH');
    req.flush(mockResponse);
  });

  it('should get a task by ID', () => {
    const taskId = 1;
    const mockTask = { id: 1, name: 'Task 1' };

    service.getTaskById(taskId).subscribe(task => {
      expect(task).toEqual(mockTask);
    });

    const req = httpMock.expectOne(`${baseUrl}/${taskId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockTask);
  });
});