import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { CandidateServiceService } from './candidate-service.service';
import { Candidate } from '../../pages/pipeline/candidate';

describe('CandidateServiceService', () => {
  let service: CandidateServiceService;
  let httpMock: HttpTestingController;

  const apiUrl = 'http://localhost:8060/api/candidates';

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [CandidateServiceService]
    });

    service = TestBed.inject(CandidateServiceService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should get all candidates', () => {
    const mockCandidates: Candidate[] = [
      { id: '1', firstName: 'Candidate 1' },
      { id: '2', firstName: 'Candidate 2' }
    ];

    service.getCandidates().subscribe(candidates => {
      expect(candidates.length).toBe(2);
      expect(candidates).toEqual(mockCandidates);
    });

    const req = httpMock.expectOne(`${apiUrl}/`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCandidates);
  });

  it('should update candidate status', () => {
    const candidateId = '1';
    const status = 'interviewed';
    const mockCandidate: Candidate = { id: '1', firstName: 'Candidate 1', status: 'interviewed' };

    service.updateCandidateStatus(candidateId, status).subscribe(candidate => {
      expect(candidate).toEqual(mockCandidate);
    });

    const req = httpMock.expectOne(`${apiUrl}/${candidateId}/status`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ status });
    req.flush(mockCandidate);
  });

  it('should update candidate information', () => {
    const candidateId = '1';
    const updatedCandidate: Candidate = { id: '1', firstName: 'Updated Candidate' };

    service.updateCandidateInformation(candidateId, updatedCandidate).subscribe(candidate => {
      expect(candidate).toEqual(updatedCandidate);
    });

    const req = httpMock.expectOne(`${apiUrl}/${candidateId}`);
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual(updatedCandidate);
    req.flush(updatedCandidate);
  });


  it('should get profile photo by candidate ID', () => {
    const candidateId = '1';
    const mockBlob = new Blob(['photo content'], { type: 'image/jpeg' });

    service.getProfilePhoto(candidateId).subscribe(photo => {
      expect(photo).toEqual(mockBlob);
    });

    const req = httpMock.expectOne(`${apiUrl}/${candidateId}/profile-photo`);
    expect(req.request.method).toBe('GET');
    req.flush(mockBlob);
  });

  it('should get a candidate by ID', () => {
    const candidateId = '1';
    const mockCandidate: Candidate = { id: '1', firstName: 'Candidate 1' };

    service.getCandidate(candidateId).subscribe(candidate => {
      expect(candidate).toEqual(mockCandidate);
    });

    const req = httpMock.expectOne(`${apiUrl}/${candidateId}`);
    expect(req.request.method).toBe('GET');
    req.flush(mockCandidate);
  });

  it('should create a new candidate', () => {
    const newCandidate: Candidate = { firstName: 'New Candidate' };
    const mockResponse: Candidate = { id: '1', firstName: 'New Candidate' };

    service.createCandidate(newCandidate).subscribe(candidate => {
      expect(candidate).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newCandidate);
    req.flush(mockResponse);
  });

  it('should create a new candidate without header', () => {
    const newCandidate: Candidate = { firstName: 'New Candidate' };
    const mockResponse: Candidate = { id: '1', firstName: 'New Candidate' };

    service.createCandidateWithoutheader(newCandidate).subscribe(candidate => {
      expect(candidate).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(newCandidate);
    req.flush(mockResponse);
  });

  it('should upload a document', () => {
    const candidateId = '1';
    const mockFile = new File(['document content'], 'document.pdf', { type: 'application/pdf' });
    const documentType = 'resume';
    const mockResponse = { message: 'Document uploaded successfully' };

    service.uploadDocument(candidateId, mockFile, documentType).subscribe(response => {
      expect(response).toEqual(mockResponse);
    });

    const req = httpMock.expectOne(`${apiUrl}/${candidateId}/documents`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body instanceof FormData).toBeTrue();
    req.flush(mockResponse);
  });
});