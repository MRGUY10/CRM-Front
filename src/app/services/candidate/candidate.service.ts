import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Candidate} from "../../models/candidate";


@Injectable({
  providedIn: 'root'
})
export class CandidateService {

  private apiUrl = 'https://candidate-service.onrender.com/api/candidates';

  constructor(private http: HttpClient) { }

  getCandidates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

}
