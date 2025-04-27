import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
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
import { MessageService } from 'primeng/api';
import { MenuItem } from 'primeng/api';

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
    CalendarModule
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

  selectedFiles: File[] = [];
  programs: string[] = ['ENGINEERING', 'MANAGEMENT', 'LICENSE'];
  nationalities: string[] = ['Cameroonian', 'Nigerian', 'Ghanaian', 'Ivorian', 'Other'];
  regions: string[] = ['Centre', 'Littoral', 'Nord', 'Sud', 'Est', 'Ouest', 'Nord-Ouest', 'Sud-Ouest', 'Adamaoua', 'Extreme-Nord'];

  constructor(private http: HttpClient, private messageService: MessageService) {}

  onFilesSelected(event: any) {
    this.selectedFiles = event.target.files;
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
    const formData = new FormData();
    formData.append('application', JSON.stringify(this.application));

    for (let i = 0; i < this.selectedFiles.length; i++) {
      formData.append('documents', this.selectedFiles[i], this.selectedFiles[i].name);
    }

    this.http.post('http://localhost:8082/applications/complete', formData)
      .subscribe(
        (response) => {
          this.messageService.add({
            severity: 'success',
            summary: 'Success',
            detail: 'Application submitted successfully!'
          });
          this.activeIndex = 0; // Reset to first step
        },
        (error) => {
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'There was an error submitting your application!'
          });
        }
      );
  }
}
