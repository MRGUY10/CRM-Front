import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import {Candidate} from "../../models/candidate";


@Injectable({
  providedIn: 'root'
})
export class CandidateService {

  private apiUrl = 'http://20.11.21.61:8087/api/candidates';

  constructor(private http: HttpClient) { }

  getCandidates(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}`);
  }

}
