import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Candidate } from '../models/candidate';

@Injectable({
  providedIn: 'root'  // This makes the service available application-wide
})
export class CandidateService {

  private apiUrl = 'http://localhost:8087/api/v1/candidate'; // Replace with your actual backend URL

  constructor(private http: HttpClient) {}

  getAllCandidates(): Observable<Candidate[]> {
    return this.http.get<Candidate[]>(`${this.apiUrl}/get-all-candidates`); // Corrected URL string
  }
}
