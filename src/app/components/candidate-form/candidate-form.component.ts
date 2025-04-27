import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, ElementRef, QueryList, ViewChildren, AfterViewInit, ChangeDetectorRef, ViewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { ToastModule } from 'primeng/toast';
import { FileUploadModule } from 'primeng/fileupload';
import { MenuItem, MessageService } from 'primeng/api';
import { BreadcrumbModule } from 'primeng/breadcrumb';
import { CandidateServiceService } from '../../services/candidate/candidate-service.service';
import { CountryISO, NgxIntlTelInputModule } from 'ngx-intl-tel-input';
import { WarningComponent } from "../../modals/warning/warning.component";
import countries from "i18n-iso-countries";
import en from "i18n-iso-countries/langs/en.json";
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

countries.registerLocale(en);
@Component({
  selector: 'app-candidate-form',
  standalone: true,
  imports: [
    ButtonModule,
    ReactiveFormsModule,
    FileUploadModule,
    ToastModule,
    CommonModule,
    BreadcrumbModule,
    NgxIntlTelInputModule,
    WarningComponent,    
    MatIconModule, 
  ],
  templateUrl: './candidate-form.component.html',
  styleUrl: './candidate-form.component.scss'
})
export class CandidateFormComponent implements AfterViewInit{

  @ViewChildren('nextButton') nextButtons!: QueryList<ElementRef>;
  @ViewChildren('backButton') backButtons!: QueryList<ElementRef>;
  @ViewChildren('submitButton') submitButtons!: QueryList<ElementRef>;
  @ViewChildren('mainForm') mainForms!: QueryList<ElementRef>;
  @ViewChildren('stepList') stepListItems!: QueryList<ElementRef>;
  @ViewChildren('stepNumberContent') stepNumberContents!: QueryList<ElementRef>;
  @ViewChild('fileInput') fileInput!: ElementRef;

  CountryISO = CountryISO;
  countryList: { code: string; name: string }[] = [];
  selectedCountryISO: CountryISO = CountryISO.Cameroon;

  showWarning = false;
  myinputid: string = CountryISO.Cameroon;
  previewUrl: string | ArrayBuffer | null = null;

  formNumber: number = 0;
  username: string = '';
  shownName: string = '';
  mainFormGroup: FormGroup;
  uploadedFiles: any[] = [];
  file: any = null;
  candidateId: any = null;
  breadcrumbItems: MenuItem[] = [
    { label: 'Candidates', routerLink: '/candidates' },
    { label: `Create`, routerLink: `/candidates/new` }
  ];

  warningMessage = "We have detected multiple candidates. Are you trying to register all of them?"

  constructor(
    private http: HttpClient,
    private messageService: MessageService, 
    private candidateService: CandidateServiceService,
    private cdr: ChangeDetectorRef,
    private matIconRegistry: MatIconRegistry,
    private domSanitizer: DomSanitizer
  ) {
    this.matIconRegistry.addSvgIcon(
      'camera',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/camera-svgrepo-com.svg')
    );
    this.mainFormGroup = new FormGroup({
      // Personal Information Group
      personalInfo: new FormGroup({
        firstName: new FormControl('', Validators.required),
        lastName: new FormControl('', Validators.required),
        field: new FormControl('', Validators.required),
        phoneNumber: new FormControl(null, Validators.required),
        email: new FormControl('', [Validators.required, Validators.email]),
        applicationDate: new FormControl('', Validators.required),
        applicationSource: new FormControl('', Validators.required),
        country: new FormControl('', Validators.required),
        city: new FormControl('', Validators.required)
      }),
      // Education Group
      education: new FormGroup({
        institutionName: new FormControl('', Validators.required),
        highestEducation: new FormControl('', Validators.required),
        graduationYear: new FormControl('', Validators.required),
        fieldOfStudy: new FormControl('', Validators.required)
      }),
      // Work Experience Group
      workExperience: new FormGroup({
        companyName: new FormControl(''),
        responsibilities: new FormControl(''),
      }),
      // Parent Information Group
      parentInfo: new FormGroup({
        fullName: new FormControl('', Validators.required),
        email: new FormControl('', [Validators.required, Validators.email]),
        phoneNumber: new FormControl('', Validators.required),
        relationshipToCandidate: new FormControl('', Validators.required),
      })
    });
    const countryData = countries.getNames('en', { select: 'official' });

    this.countryList = Object.entries(countryData).map(([code, name]) => ({
      code: code.toUpperCase(),
      name
    }));

    console.log(this.mainFormGroup.get('personalInfo')?.valid)
  }

  ngAfterViewInit(): void {
    this.initializeNextClick();
    this.initializeBackClick();
    this.initializeSubmitClick();
    this.initializeHeartClick();
    this.initializeShareClick();
    this.submitMainForm();
    this.cdr.detectChanges();
  }

  triggerFileInput() {
    this.fileInput.nativeElement.click();
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const file = input.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = () => {
          this.previewUrl = reader.result;
        };
        reader.readAsDataURL(file);
      }
    }
  }
    // When country is selected, update phone field with correct country code
    onCountryChange(event: any) {
      this.selectedCountryISO = event.target.value as CountryISO;
      this.myinputid = event.target.value;
    }

  // Handle "Next" button clicks
  private initializeNextClick(): void {
    this.nextButtons.forEach((nextButton) => {
      nextButton.nativeElement.addEventListener('click', () => {
        if (!this.validateForm()) {
          return;
        }
        this.formNumber++;
        this.updateForm();
        this.progressForward();
        this.contentChange();
      });
    });
  }

  // Handle "Back" button clicks
  private initializeBackClick(): void {
    this.backButtons.forEach((backButton) => {
      backButton.nativeElement.addEventListener('click', () => {
        this.formNumber--;
        this.updateForm();
        this.progressBackward();
        this.contentChange();
      });
    });
  }

  // Handle "Submit" button clicks
  private initializeSubmitClick(): void {
    this.submitButtons.forEach((submitButton) => {
      submitButton.nativeElement.addEventListener('click', () => {
        this.shownName = this.username;
        this.formNumber++;
        this.updateForm();
      });
    });
  }

  // Handle "Heart" icon toggle
  private initializeHeartClick(): void {
    const heart = document.querySelector('.fa-heart');
    if (heart) {
      heart.addEventListener('click', () => {
        heart.classList.toggle('heart');
      });
    }
  }

  // Handle "Share" icon toggle
  private initializeShareClick(): void {
    const share = document.querySelector('.fa-share-alt');
    if (share) {
      share.addEventListener('click', () => {
        share.classList.toggle('share');
      });
    }
  }

  // Update form to show/hide the current form step
  private updateForm(): void {
    this.mainForms.forEach((form, index) => {
      form.nativeElement.classList.toggle('active', index === this.formNumber);
    });
  }

  // Move the progress bar forward
  private progressForward(): void {
    const stepNumberElem = document.querySelector('.step-number') as HTMLElement;
    if (stepNumberElem) {
      stepNumberElem.innerHTML = (this.formNumber + 1).toString();
    }
    this.stepListItems.forEach((item, index) => {
      item.nativeElement.classList.toggle('active', index <= this.formNumber);
    });
  }

  // Move the progress bar backward
  private progressBackward(): void {
    const stepNumberElem = document.querySelector('.step-number') as HTMLElement;
    if (stepNumberElem) {
      stepNumberElem.innerHTML = this.formNumber.toString();
    }
    console.log(this.formNumber.toString())
    this.stepListItems.forEach((item, index) => {
      item.nativeElement.classList.toggle('active', index <= this.formNumber);
    });
  }

  // Change content based on the current step
  private contentChange(): void {
    this.stepNumberContents.forEach((content, index) => {
      content.nativeElement.classList.toggle('active', index === this.formNumber);
      content.nativeElement.classList.toggle('d-none', index !== this.formNumber);
    });
  }

  // Validate form fields in the current step
  private validateForm(): boolean {
    let isValid = true;
    const activeFormInputs = this.mainForms
      .toArray()[this.formNumber]
      .nativeElement.querySelectorAll('input') as NodeListOf<HTMLInputElement>;

    activeFormInputs.forEach((input) => {
      input.classList.remove('warning');
      if (input.hasAttribute('required') && !input.value) {
        isValid = false;
        input.classList.add('warning');
      }
    });

    return isValid;
  }

  onSelectingCSV(event: any) {
    const file: File = event.files[0]; // Get the selected file
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const content = e.target.result; // Get CSV content
        console.log("CSV File Content:\n", content); // Print CSV content
        // Split content by newline to count lines
        const lines = content.split("\n").filter((line: string) => line.trim() !== "");
        const candidate = lines[1].split(",");
        // Check if the number of lines is greater than 1
        if (lines.length > 2) {
          this.showWarning = true
        } else {
          this.mainFormGroup.get('personalInfo')?.get('firstName')?.setValue(candidate[0]);
          this.mainFormGroup.get('personalInfo')?.get('lastName')?.setValue(candidate[1]);
          this.mainFormGroup.get('personalInfo')?.get('country')?.setValue(candidate[2]);
          this.mainFormGroup.get('personalInfo')?.get('city')?.setValue(candidate[3]);
          this.mainFormGroup.get('personalInfo')?.get('email')?.setValue(candidate[4]);
          this.mainFormGroup.get('personalInfo')?.get('phoneNumber')?.setValue(candidate[5]);
          this.mainFormGroup.get('personalInfo')?.get('applicationDate')?.setValue(candidate[6]);
          this.mainFormGroup.get('personalInfo')?.get('applicationSource')?.setValue(candidate[7]);
          this.mainFormGroup.get('personalInfo')?.get('field')?.setValue(candidate[8]);
          this.mainFormGroup.get('parentInfo')?.get('fullName')?.setValue(candidate[9]);
          this.mainFormGroup.get('parentInfo')?.get('email')?.setValue(candidate[10]);
          this.mainFormGroup.get('parentInfo')?.get('phoneNumber')?.setValue(candidate[11]);
          this.mainFormGroup.get('parentInfo')?.get('relationshipToCandidate')?.setValue(candidate[12]);
          this.mainFormGroup.get('education')?.get('highestEducation')?.setValue(candidate[13]);
          this.mainFormGroup.get('education')?.get('institutionName')?.setValue(candidate[14]);
          this.mainFormGroup.get('education')?.get('graduationYear')?.setValue(candidate[15]);
          this.mainFormGroup.get('education')?.get('fieldOfStudy')?.setValue(candidate[16]);
          this.mainFormGroup.get('workExperience')?.get('companyName')?.setValue(candidate[17]);
          this.mainFormGroup.get('workExperience')?.get('responsibilities')?.setValue(candidate[18]);
        }
      };
      reader.readAsText(file); // Read file as text
    }
  }
  multipleSelectActive(event: any){
    this.showWarning = false;
  }

  submitMainForm() {
    const submitbtn = document.querySelector('.submit') as HTMLElement;
    submitbtn.addEventListener('click', () =>{
      let form:any = {}
      form.firstName = this.mainFormGroup.get('personalInfo')?.get('firstName')?.value;
      form.lastName = this.mainFormGroup.get('personalInfo')?.get('lastName')?.value;
      form.country = this.mainFormGroup.get('personalInfo')?.get('country')?.value;
      form.city = this.mainFormGroup.get('personalInfo')?.get('city')?.value;
      form.email = this.mainFormGroup.get('personalInfo')?.get('email')?.value;
      form.phoneNumber = this.mainFormGroup.get('personalInfo')?.get('phoneNumber')?.value;
      form.applicationDate = this.mainFormGroup.get('personalInfo')?.get('applicationDate')?.value;
      form.applicationSource = this.mainFormGroup.get('personalInfo')?.get('applicationSource')?.value;
      form.field = this.mainFormGroup.get('personalInfo')?.get('field')?.value;

      // Parent Information
      form.parentDetail = {
        fullName: this.mainFormGroup.get('parentInfo')?.get('fullName')?.value,
        email: this.mainFormGroup.get('parentInfo')?.get('email')?.value,
        phoneNumber: this.mainFormGroup.get('parentInfo')?.get('phoneNumber')?.value,
        relationshipToCandidate: this.mainFormGroup.get('parentInfo')?.get('relationshipToCandidate')?.value,
      };


      // Education Details
      form.educationDetail =
        {
          highestEducation: this.mainFormGroup.get('education')?.get('highestEducation')?.value,
          institutionName: this.mainFormGroup.get('education')?.get('institutionName')?.value,
          graduationYear: this.mainFormGroup.get('education')?.get('graduationYear')?.value,
          fieldOfStudy: this.mainFormGroup.get('education')?.get('fieldOfStudy')?.value
        };

      // Employment Details
      form.employmentDetail = {
        companyName: this.mainFormGroup.get('workExperience')?.get('companyName')?.value,
        responsibilities: this.mainFormGroup.get('workExperience')?.get('responsibilities')?.value
      };

      console.log(form);

      this.candidateService.createCandidateWithoutheader(form).subscribe({
        next: (response) => {
          console.log('Candidate created successfully');
          this.candidateId = response.id;
          alert(response);
        },
        error: (error) => {
          console.error('Error creating candidate:', error);
          alert('Failed to create candidate. Please try again.');
        }
      });
    })
  }

  onUpload(event: { files: File[] }): void  {
    this.file = event.files[0];
    const uploadUrl = "http://localhost:8060/api/candidates/upload";
    const f = event.files[0]; // Assuming a single file
    const formData = new FormData();
    formData.append('file', f, f.name);
    console.log(formData);

    this.http.post(uploadUrl, formData).subscribe({
        next: (response) => {
          console.log('Upload successful', response)
          this.messageService.add({
            severity: 'info',
            summary: 'File Uploaded',
            detail: 'Files have been uploaded successfully!'
          });
        },
        error: (err) => {
          console.error('Upload failed', err)
          this.messageService.add({
            severity: 'error',
            summary: 'Error uploading',
            detail: "Failed to upload files. Please try again."
          });
        },
    });
  }

  uploadingDocuments(event: { files: File[] }): void  {
    this.uploadedFiles.push(...event.files);

    if(this.candidateId){
      const uploadUrl = `http://localhost:8060/api/candidates/${this.candidateId}/documents`;

      this.uploadedFiles.forEach(element => {
        const formData = new FormData();
        formData.append('file', element, element.name);
        formData.append('documentType', 'document');
        console.log(formData.get('file'));
        this.http.post(uploadUrl, formData).subscribe({
          next: (response) => {
            console.log('Upload successful', response)
            this.messageService.add({
              severity: 'info',
              summary: 'Documents Upload',
              detail: 'Files have been uploaded successfully!'
            });
          },
          error: (err) => {
            console.error('Upload failed', err)
            this.messageService.add({
              severity: 'error',
              summary: 'Error uploading',
              detail: "Failed to upload files. Please try again."
            });
          },
        });
      });
    } else {
      this.messageService.add({
        severity: 'error',
        summary: 'Error uploading',
        detail: "Please first create the candidate"
      });
    }
    return;
  }
}
