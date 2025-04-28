import { Component } from '@angular/core';
import { HttpClient, HttpEventType } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ButtonModule } from "primeng/button";
import { FileUploadModule } from "primeng/fileupload";
import { ToastModule } from "primeng/toast";
import { CommonModule } from "@angular/common";
import { BreadcrumbModule } from "primeng/breadcrumb";
import { CheckboxModule } from "primeng/checkbox";
import { StepsModule } from 'primeng/steps';
import { CardModule } from 'primeng/card';
import { InputTextModule } from 'primeng/inputtext';
import { InputNumberModule } from 'primeng/inputnumber';
import { DropdownModule } from 'primeng/dropdown';
import { CalendarModule } from 'primeng/calendar';
import { ProgressBarModule } from 'primeng/progressbar';
import { MessageService } from 'primeng/api';
import { MenuItem } from 'primeng/api';
import {TableModule} from "primeng/table";

interface DocumentUpload {
  file: File | null;
  type: string;
  required: boolean;
  description: string;
}

@Component({
  selector: 'app-self-creationn',
  standalone: true,
  imports: [
    ButtonModule,
    ReactiveFormsModule,
    FileUploadModule,
    ToastModule,
    CommonModule,
    BreadcrumbModule,
    CheckboxModule,
    FormsModule,
    StepsModule,
    CardModule,
    InputTextModule,
    InputNumberModule,
    DropdownModule,
    CalendarModule,
    ProgressBarModule,
    TableModule
  ],
  templateUrl: './self-creationn.component.html',
  styleUrls: ['./self-creationn.component.scss'],
  providers: [MessageService]
})
export class SelfCreationnComponent {
  activeIndex: number = 0;
  items: MenuItem[] = [
    { label: 'Personal Information' },
    { label: 'Family Details' },
    { label: 'Education Details' },
    { label: 'Documents Upload' },
    { label: 'Review & Submit' }
  ];

  application = {
    matricule: '',
    firstName: '',
    lastName: '',
    nationality: '',
    regionOfOrigin: '',
    address: '',
    whatsappNumber: '',
    email: '',
    dateOfBirth: '',
    phoneNumber: '',
    program: '',
    familyDetails: {
      fatherName: '',
      fatherProfession: '',
      fatherPhone: '',
      motherName: '',
      motherProfession: '',
      motherPhone: ''
    },
    educationDetails: {
      hasAL: false,
      upperSixthSeries: '',
      totalNumberInClass: 0,
      town: '',
      school: '',
      repeatedClass: false,
      alGrades: '',
      olGrades: '',
      termPositions: '',
      chosenWritingCenter: '',
      chosenField: ''
    }
  };

  programs: string[] = ['ENGINEERING', 'MANAGEMENT', 'LICENSE'];
  nationalities: string[] = ['Cameroonian', 'Nigerian', 'Ghanaian', 'Ivorian', 'Other'];
  regions: string[] = ['Centre', 'Littoral', 'Nord', 'Sud', 'Est', 'Ouest', 'Nord-Ouest', 'Sud-Ouest', 'Adamaoua', 'Extreme-Nord'];

  // Document upload configuration
  documentUploads: DocumentUpload[] = [
    {
      type: 'ID_CARD',
      required: true,
      file: null,
      description: 'A copy of the ID card (or receipt)'
    },
    {
      type: 'BIRTH_CERTIFICATE',
      required: true,
      file: null,
      description: 'A copy of birth certificate'
    },
    {
      type: 'SCHOOL_ATTENDANCE',
      required: true,
      file: null,
      description: 'A School attendance certificate'
    },
    {
      type: 'AL_SLIP',
      required: true,
      file: null,
      description: 'A copy of the A/L slip'
    },
    {
      type: 'OL_SLIP',
      required: true,
      file: null,
      description: 'A copy of the O/L slip'
    },
    {
      type: 'REPORT_BOOKLETS',
      required: true,
      file: null,
      description: 'A copy of the report booklets (Form 5 to Upper Sixth)'
    }
  ];

  allowedFileTypes = ['.pdf', '.jpg', '.jpeg', '.png'];
  maxFileSize = 2 * 1024 * 1024; // 2MB
  uploading = false;
  uploadProgress = 0;

  constructor(private http: HttpClient, private messageService: MessageService) {}

  onFileSelect(event: any, index: number) {
    if (event.files && event.files.length > 0) {
      const file = event.files[0];

      if (!this.validateFileType(file)) {
        this.messageService.add({
          severity: 'error',
          summary: 'Invalid File Type',
          detail: `Only ${this.allowedFileTypes.join(', ')} files are allowed`
        });
        return;
      }

      if (file.size > this.maxFileSize) {
        this.messageService.add({
          severity: 'error',
          summary: 'File Too Large',
          detail: `File exceeds ${this.maxFileSize / (1024 * 1024)}MB limit`
        });
        return;
      }

      this.documentUploads[index].file = file;
    }
  }

  onFileRemove(index: number) {
    this.documentUploads[index].file = null;
  }

  validateFileType(file: File): boolean {
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    return this.allowedFileTypes.includes(fileExtension);
  }

  validateDocuments(): boolean {
    const missingDocuments = this.documentUploads
      .filter(doc => doc.required && !doc.file)
      .map(doc => doc.description);

    if (missingDocuments.length > 0) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Missing Documents',
        detail: `Please upload: ${missingDocuments.join(', ')}`
      });
      return false;
    }
    return true;
  }

  nextStep() {
    if (this.activeIndex < this.items.length - 1) {
      this.activeIndex++;
    }
  }

  prevStep() {
    if (this.activeIndex > 0) {
      this.activeIndex--;
    }
  }

  onSubmit() {
    if (!this.validateDocuments()) {
      return;
    }

    this.uploading = true;
    this.uploadProgress = 0;

    const formData = new FormData();
    formData.append('application', new Blob([JSON.stringify(this.application)], {
      type: 'application/json'
    }));

    this.documentUploads.forEach(doc => {
      if (doc.file) {
        formData.append('documents', doc.file, `${doc.type}_${doc.file.name}`);
      }
    });

    this.http.post('http://localhost:8082/applications/complete', formData, {
      reportProgress: true,
      observe: 'events'
    }).subscribe({
      next: (event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.uploadProgress = Math.round(100 * event.loaded / event.total);
        } else if (event.type === HttpEventType.Response) {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Application submitted successfully!'
          });
          this.activeIndex = 0;
          this.resetForm();
        }
      },
      error: (error) => {
        this.uploading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: error.message || 'There was an error submitting your application!'
        });
      },
      complete: () => {
        this.uploading = false;
      }
    });
  }

  resetForm() {
    this.documentUploads = this.documentUploads.map(doc => ({
      ...doc,
      file: null
    }));
    this.uploadProgress = 0;
  }

  getUploadedFilesCount(): number {
    return this.documentUploads.filter(doc => doc.file !== null).length;
  }

  getTotalRequiredDocuments(): number {
    return this.documentUploads.filter(doc => doc.required).length;
  }

  isCurrentStepValid(): boolean {
    switch (this.activeIndex) {
      case 0:
        // Validate the first step (Personal Information)
        return !!this.application.firstName && !!this.application.lastName && !!this.application.email;
      case 1:
        // Validate Family Details
        return !!this.application.familyDetails.fatherName && !!this.application.familyDetails.motherName;
      case 2:
        // Validate Education Details
        return !!this.application.educationDetails.hasAL && !!this.application.educationDetails.upperSixthSeries;
      case 3:
        // Check if required documents are uploaded
        return this.validateDocuments();
      default:
        return true;
    }
  }

}
