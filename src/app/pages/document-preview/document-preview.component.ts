import { Component } from '@angular/core';
import { CandidateServiceService} from '../../services/candidate/candidate-service.service';

@Component({
  selector: 'app-document-preview',
  templateUrl: './document-preview.component.html',
  standalone: true,
  styleUrls: ['./document-preview.component.scss']
})
export class DocumentPreviewComponent {
  constructor(private documentService: CandidateServiceService) {}

  previewDocument(applicationId: number, documentId: number): void {
    this.documentService.previewDocument(applicationId, documentId).subscribe({
      next: (blob) => {
        const fileURL = URL.createObjectURL(blob);
        window.open(fileURL); // Open document in a new tab for preview
      },
      error: (error) => {
        console.error('Error fetching document for preview:', error);
      }
    });
  }
}
