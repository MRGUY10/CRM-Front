import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { catchError, Observable, throwError } from 'rxjs';
import { Candidate } from '../../pages/pipeline/candidate';
import {Application} from "../../pages/pipeline/Application";

@Injectable({
  providedIn: 'root'
})
export class CandidateServiceService {
  private apiUrl = 'http://20.11.21.61:8082/applications';

  constructor(private http: HttpClient) {}

  getCandidates(): Observable<Application[]> {
    return this.http.get<Application[]>(`${this.apiUrl}/all`);
  }

  updateApplicationStatus(id: number, status: string): Observable<Application> {
    return this.http.put<Application>(`${this.apiUrl}/${id}/status/${status}`, null);
  }


  updateCandidateInformation(id: string, updatedCandidate: Candidate): Observable<Candidate> {
    return this.http.put<Candidate>(`${this.apiUrl}/${id}`, updatedCandidate);
  }

  deleteCandidate(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getProfilePhoto(candidateId: string): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${candidateId}/profile-photo`, { responseType: 'blob' });
  }

  getApplicationByMatricule(matricule: string): Observable<Candidate> {
    return this.http.get<Candidate>(`${this.apiUrl}/applications/matricule/${matricule}`).pipe(
      catchError((error) => {
        console.error('Error occurred:', error);
        return throwError(() => new Error('Failed to fetch application'));
      })
    );
  }

  getApplicationById(applicationId: number): Observable<Application> {
    return this.http.get<Application>(`${this.apiUrl}/${applicationId}`);
  }

  getCandidate(id: string): Observable<Candidate> { return this.http.get<Candidate>(`${this.apiUrl}/${id}`); }
  /**
   * Create a new candidate
   * @param candidate - The candidate object to be created
   * @returns Observable with the response
   */
  createCandidate(candidate: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.apiUrl}/`, candidate, { headers });
  }

  createCandidateWithoutheader(candidate: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post<any>(`${this.apiUrl}/`, candidate);
  }

  uploadDocument(candidateId: any, file: File, documentType: string): Observable<any> {
    const formData = new FormData();
    formData.append('file', file, file.name); // Append file
    formData.append('documentType', documentType); // Append document type

    const url = `${this.apiUrl}/${candidateId}/documents`;

    return this.http.post<any>(url, formData);
  }

  uploadProfilePhoto(candidateId: number, file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);

    const headers = new HttpHeaders({
      // 'Content-Type': 'multipart/form-data'  // Don't set this, Angular handles it automatically with FormData.
    });

    return this.http.post<string>(`${this.apiUrl}/${candidateId}/upload`, formData, { headers })
      .pipe(
        catchError(this.handleError)
      );
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let errorMessage = 'An unknown error occurred!';
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.error}`;
    }
    return throwError(() => new Error(errorMessage));
  }
  previewDocument(applicationId: number, documentId: number): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/${applicationId}/documents/${documentId}/preview`, { responseType: 'blob' });
  }
}
