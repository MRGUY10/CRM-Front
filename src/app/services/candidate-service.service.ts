import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { Candidate } from '../models/candidate';

@Injectable({
  providedIn: 'root'
})
export class CandidateService {

  private apiUrl = 'http://20.11.21.61:8087/api/v1/candidate';

  constructor(private http: HttpClient) {}

  getAllCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.apiUrl}/get-all-candidates`)
      .pipe(
        catchError((error) => {
          console.error('Error fetching candidates:', error);
          return throwError(() => new Error('Failed to fetch candidates. Please try again later.'));
        })
      );
  }
}
