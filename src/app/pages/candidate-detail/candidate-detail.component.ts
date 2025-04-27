import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CandidateServiceService } from '../../services/candidate/candidate-service.service';
import { Application } from '../pipeline/Application';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule } from '@angular/forms'; // Import FormsModule
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common'
import jsPDF from 'jspdf';
 import html2canvas from 'html2canvas';

@Component({
  selector: 'app-candidate-detail',
  standalone: true,
  templateUrl: './candidate-detail.component.html',
  styleUrl: './candidate-detail.component.scss',
  imports: [CommonModule, FormsModule, ReactiveFormsModule] // Add FormsModule to imports array
})
export class CandidateDetailComponent implements OnInit {
  application!: Application;
  loading: boolean = true;
  errorMessage: string = '';

  constructor(
    private applicationService: CandidateServiceService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id'); // Get application ID from route
    if (id) {
      this.applicationService.getApplicationById(+id).subscribe({
        next: (data) => {
          this.application = data;
          this.loading = false;
        },
        error: (error) => {
          this.errorMessage = 'Failed to load application details.';
          this.loading = false;
        }
      });
    } else {
      this.errorMessage = 'Invalid application ID.';
      this.loading = false;
    }
  }

  viewDocument(applicationId: number, documentId: number): void {
    this.applicationService.previewDocument(applicationId, documentId).subscribe({
      next: (blob) => {
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL); // Open the document in a new tab for preview
      },
      error: (error) => {
        console.error('Error fetching document:', error);
      }
    });
  }
}
