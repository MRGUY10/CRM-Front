// pipeline.component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { MatBadgeModule } from '@angular/material/badge';
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DropdownModule } from 'primeng/dropdown';
import { DragDropModule } from 'primeng/dragdrop';
import {Application, ApplicationStatus} from './Application';
import { MessageService } from 'primeng/api';
import { ToastModule } from 'primeng/toast';
import { CandidateServiceService } from '../../services/candidate/candidate-service.service';
import { CandidateFormDialogComponent } from '../candidate-form-dialog/candidate-form-dialog.component';
import { DomSanitizer } from '@angular/platform-browser';
import { RouterModule } from '@angular/router';
import { Router } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';


@Component({
  selector: 'app-pipeline',
  standalone: true,
  imports: [MatBadgeModule, MatProgressBarModule, MatIconModule, CommonModule, DropdownModule, DragDropModule,ToastModule, RouterModule],
  templateUrl: './pipeline.component.html',
  styleUrls: ['./pipeline.component.scss'],
  providers: [MessageService]
})
export class PipelineComponent implements OnInit {

  @ViewChild('confirmDialog') confirmDialog!: TemplateRef<any>;
  @ViewChild('confirmDeleteDialog') confirmDeleteDialog!: TemplateRef<any>;
  columns: { name: string, color: string, icon?: string, applications: Application[] }[] = [];
  draggedApplication: Application | null = null;
  columnIndex: number | null = null;
  dialogRef!: MatDialogRef<any>;
  candidateToDelete!: Application;
  progressValue: number = 0;
  private progressInterval: any;
  @ViewChild('loadingDialog') loadingDialog!: TemplateRef<any>;


  constructor(
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
    private dialog: MatDialog,
    private CandidateServiceService: CandidateServiceService,
    private messageService: MessageService,
    private router: Router
  ) {
    this.matIconRegistry.addSvgIcon(
    'edit',
    this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/edit-2-svgrepo-com.svg')
  );

  this.matIconRegistry.addSvgIcon(
    'delete',
    this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/trash-2-svgrepo-com.svg')
  );
}

  ngOnInit() {
    this.columns = [
      { name: 'Application', color: '#007bff', applications: [] },
      { name: 'APPLICATION_ACCEPTED', color: '#28a745', applications: [] },
      { name: 'APPLICATION_REJECTED', color: '#dc3545', applications: [] },
      { name: 'EXAM_REGISTERED', color: '#fd7e14', applications: [] },
      { name: 'ADMISSION_OFFERED', color: '#6f42c1', applications: [] },
      { name: 'ADMISSION_REJECTED', color: '#9a2e2b', applications: [] },
      { name: 'STUDENT', color: '#28a745', applications: [] }
    ];


    this.loadApplication();
  }

  loadApplication() {
    this.CandidateServiceService.getCandidates().subscribe(applications => {
      // Map statuses to column indices
      const statusToColumnIndex: { [key: string]: number } = {
        SUBMITTED: 0,
        APPLICATION_ACCEPTED: 1,
        APPLICATION_REJECTED: 2,
        EXAM_REGISTERED: 3,
        ADMISSION_OFFERED: 4,
        ADMISSION_REJECTED: 5,
        STUDENT: 6
      };

      applications.forEach(application => {
        const columnIndex = statusToColumnIndex[application.status];
        if (columnIndex !== undefined) {
          this.columns[columnIndex].applications.push(application);
        } else {
          console.warn(`Unknown status: ${application.status}`);
        }

// console.log('Candidate:', candidate);
// const educationDetailsArray = Object.values(candidate.educationDetails || {});
// const institutionName =educationDetailsArray[0]?.institutionName;
// const graduationYear = educationDetailsArray[0]?.graduationYear;

// console.log(institutionName, graduationYear);


        // Fetch and set profile photo for each candidate
        // if (application.id) {
        //   this.CandidateServiceService.getProfilePhoto(application.id).subscribe(photoBlob => {
        //     const reader = new FileReader();
        //     reader.onload = () => {
        //       candidate.profilePhoto = { id: candidate.id, photoData: reader.result as string };
        //     };
        //     reader.readAsDataURL(photoBlob);
        //   });
        // }
      });
    });
  }


  dragStart(application: Application, columnIndex: number) {
    console.log('Drag started', application, columnIndex);
    this.draggedApplication = { ...application, columnIndex };
  }

  drop(event: any, columnIndex: number) {
    console.log('Drop initiated', columnIndex);

    // Check if the dragged candidate is being dropped in the same column
    if (this.draggedApplication && this.draggedApplication.columnIndex === columnIndex) {
        console.log('Dropped in the same column, no action taken');
        return; // Exit the method if it's the same column
    } if (this.draggedApplication && this.draggedApplication.columnIndex === 6) {
      this.messageService.add({
        severity: 'warn',
        summary: 'Not Allowed',
        detail: 'Applications from the STUDENT column cannot be moved.'
      });
      return;
    // Exit the method if the dragged candidate is from the student column
    } else {
        // Handle the drop in a different column
        this.columnIndex = columnIndex;
        this.dialog.open(this.confirmDialog);
    }
}


  onYesClick() {
    if (this.draggedApplication?.columnIndex !== undefined && this.columnIndex !== null) {
      const fromIndex = this.draggedApplication.columnIndex;
      const toIndex = this.columnIndex;

      if (fromIndex === toIndex) {
        this.messageService.add({
          severity: 'warn',
          summary: 'No Action',
          detail: 'The application is already in the selected column.'
        });
        return;
      }

      // Show loading dialog
      const loadingDialogRef = this.dialog.open(this.loadingDialog, {
        disableClose: true,
        panelClass: 'loading-dialog-container'
      });

      this.startProgressAnimation();
      this.moveApplication(this.draggedApplication, fromIndex, toIndex);

      const statusMapping: { [key: string]: ApplicationStatus } = {
        SUBMITTED: ApplicationStatus.DRAFT,
        APPLICATION_ACCEPTED: ApplicationStatus.APPLICATION_ACCEPTED,
        APPLICATION_REJECTED: ApplicationStatus.APPLICATION_REJECTED,
        EXAM_REGISTERED: ApplicationStatus.EXAM_REGISTERED,
        ADMISSION_OFFERED: ApplicationStatus.ADMISSION_OFFERED,
        ADMISSION_REJECTED: ApplicationStatus.ADMISSION_REJECTED,
        STUDENT: ApplicationStatus.STUDENT
      };

      let status = statusMapping[this.columns[toIndex]?.name.toUpperCase().trim()];

      this.CandidateServiceService.updateApplicationStatus(this.draggedApplication.id!, status).subscribe({
        next: () => {
          this.progressValue = 100;
          setTimeout(() => {
            loadingDialogRef.close();
            this.stopProgressAnimation();
            this.messageService.add({
              severity: 'success',
              summary: 'Confirmed',
              detail: 'Application moved successfully' +
                (status === ApplicationStatus.STUDENT ? ', An email is sent to the new student' : '')
            });
            this.dialog.closeAll();
          }, 500);
        },
        error: (err) => {
          this.moveApplication(this.draggedApplication!, toIndex, fromIndex);
          loadingDialogRef.close();
          this.stopProgressAnimation();
          this.messageService.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to update application status. Please try again.'
          });
        }
      });
    }
  }

// Add these new methods to the class
  private startProgressAnimation() {
    this.progressValue = 0;
    this.progressInterval = setInterval(() => {
      if (this.progressValue < 90) {
        this.progressValue += 10;
      }
    }, 300);
  }

  private stopProgressAnimation() {
    if (this.progressInterval) {
      clearInterval(this.progressInterval);
      this.progressValue = 0;
    }
  }

// Helper function to move applications between columns
  private moveApplication(draggedApplication: Application, fromIndex: number, toIndex: number) {
    const draggedApplicationIndex = this.columns[fromIndex]?.applications.findIndex(
      app => app.id === draggedApplication?.id
    );
    if (draggedApplicationIndex !== -1) {
      this.columns[fromIndex]?.applications.splice(draggedApplicationIndex, 1);
      this.columns[toIndex]?.applications.push(draggedApplication);
    }
  }



  onNoClick() {
    this.messageService.add({ severity: 'error', summary: 'Cancelled', detail: 'Drop cancelled' });
    this.draggedApplication = null;
    this.columnIndex = null;
    this.dialog.closeAll();
  }


  dragEnd() {
  //   // this.draggedCandidate = null;
 }

  openDialog() {
    const dialogRef = this.dialog.open(CandidateFormDialogComponent, {
      width: '400px',
      data: {}
    });
  }

  confirmDelete(event: Event, candidate: Application) {
    event.stopPropagation();
    this.candidateToDelete = candidate;
    this.dialogRef = this.dialog.open(this.confirmDeleteDialog);
}

ondelnoClick(): void {
    this.dialogRef.close();
}

onyesdelClick(): void {
    this.dialogRef.close();
    // this.deleteCandidate(this.candidateToDelete);
}

// deleteCandidate(candidate: Application) {
//     if (candidate.id) {
//         this.CandidateServiceService.deleteCandidate((candidate.id)).subscribe(() => {
//             // Remove candidate from the UI
//             this.columns.forEach(column => {
//                 const index = column.candidates.findIndex(c => c.id === candidate.id);
//                 if (index !== -1) {
//                     column.candidates.splice(index, 1);
//                 }
//             });
//             let message = 'Deleted successfully';
//             this.messageService.add({ severity: 'success', summary: 'Confirmed', detail: message });
//         });
//     }
// }
//
//
  viewCandidate(id: number): void {
    if (id) {
      this.router.navigate([`/candidate/${id}`]);
    } else {
      console.error('application marticule is undefined or empty');
    }
  }
//
//   updateCandidate(candidate: Application) {
//     if (candidate.id) {
//       this.CandidateServiceService.updateCandidateInformation(candidate.id, candidate).subscribe(updatedCandidate => {
//         // Handle the updated candidate data here
//         console.log('Candidate updated:', updatedCandidate);
//       }, error => {
//         console.error('Error updating candidate:', error);
//       });
//     }
//   }
//
//   editCandidate(id: string): void {
//     if (id) {
//       this.router.navigate([`/update-candidate/${id}`]);
//     } else {
//       console.error('Candidate ID is undefined or empty');
//     }
//   }
//
}
