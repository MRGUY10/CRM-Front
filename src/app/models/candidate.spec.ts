import { Candidate } from './candidate';

describe('Candidate Interface', () => {
  it('should create a candidate object that conforms to the Candidate interface', () => {
    const candidate: Candidate = {
      id: 1,
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      phoneNumber: '1234567890',
      applicationDate: '2023-10-01',
      applicationSource: 'LinkedIn',
      status: 'Applied',
      imagePath: 'path/to/image.jpg' // Optional field
    };

    expect(candidate).toBeTruthy();
    expect(candidate.firstName).toBe('John');
    expect(candidate.lastName).toBe('Doe');
    expect(candidate.email).toBe('john.doe@example.com');
    expect(candidate.phoneNumber).toBe('1234567890');
    expect(candidate.applicationDate).toBe('2023-10-01');
    expect(candidate.applicationSource).toBe('LinkedIn');
    expect(candidate.status).toBe('Applied');
    expect(candidate.imagePath).toBe('path/to/image.jpg');
  });
});
