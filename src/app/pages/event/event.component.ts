import { Component, OnInit, TemplateRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EventService } from '../../services/event/event.service';
import { VenueService } from '../../services/venue/venue.service';
import { TypeService } from '../../services/type/type.service';
import { ContactService } from '../../services/contact/contact.service';
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { DropdownModule } from "primeng/dropdown";
import { MatIcon } from "@angular/material/icon";
import { MatCheckbox } from "@angular/material/checkbox";
import { FieldFilterPipe } from "../../pipes/fieldFilter/field-filter.pipe";
import { MatIconModule, MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';
import { ToastModule } from 'primeng/toast';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { DatePipe } from '@angular/common';



@Component({
  selector: 'app-event',
  templateUrl: './event.component.html',
  standalone: true,
  imports: [
    CommonModule,
    DropdownModule,
    ReactiveFormsModule,
    MatIcon,
    MatCheckbox,
    FieldFilterPipe,
    ToastModule,
    MatIconModule
  ],
  providers: [DatePipe],
  styleUrls: ['./event.component.scss']
})
export class EventComponent implements OnInit {
  @ViewChild('confirmDeleteDialog') confirmDeleteDialog!: TemplateRef<any>;
  events: any[] = [];
  editEvent: any = null;
  id!: number;
  myForm: FormGroup;
  loading: boolean = false;
  filter = new FormControl<string | null>('');
  filters: { name: string }[] | undefined;
  showForm: boolean = false;
  dialogRef!: MatDialogRef<any>;
  eventToDelete: any

  // New variables for dropdowns
  types: any[] = [];
  venues: any[] = [];
  contacts: any[] = [];
  isViewMode: boolean = false; // flag to determine if the form is in view mode
  constructor(
    private eventService: EventService,
    private venueService: VenueService,
    private typeService: TypeService,
    private contactService: ContactService,
    private fb: FormBuilder,
    private router: Router,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private dialog: MatDialog,
    private domSanitizer: DomSanitizer,
    private matIconRegistry: MatIconRegistry,
    private datePipe: DatePipe,
  ) {
    this.myForm = this.fb.group({
      name: ['', Validators.required],
      start: ['', Validators.required],
      end: ['', Validators.required],
      start_time: ['', Validators.required],
      end_time: ['', Validators.required],
      expected_person: ['', Validators.required],
      budget: ['', Validators.required],
      description: ['', Validators.required],
      type: ['', Validators.required],
      venue: ['', Validators.required]
      //contacts: [[], Validators.required],
    });

    this.matIconRegistry.addSvgIcon(
      'edit',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/edit-2-svgrepo-com.svg')
    );

    this.matIconRegistry.addSvgIcon(
      'delete',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/trash-2-svgrepo-com.svg')
    );
    this.matIconRegistry.addSvgIcon(
      'view',
      this.domSanitizer.bypassSecurityTrustResourceUrl('/assets/icons/eye-open-svgrepo-com.svg')
    );
  }

  ngOnInit(): void {
    this.getEvents();
    this.getTypes();
    this.getVenues();
    this.getContacts();
  }

  showEdit(event: any | null): void {
    this.showForm = true;
    if (event) {
      this.id = event.id;
      this.editEvent = { ...event };
      this.myForm.patchValue({
        name: event.name,
        start: event.startDate,   // Use startDate field
        end: event.endDate,       // Use endDate field
        start_time: event.startTime,  // Use startTime field
        end_time: event.endTime,      // Use endTime field
        expected_person: event.expectedPerson,  // Ensure control names match your formGroup
        budget: event.budget,
        description: event.description,
        // Pre-fill the dropdown for event type and venue; use a fallback if missing.
        type: event.eventType ? event.eventType.id : null,
        venue: event.venue ? event.venue.id : null
      });
    } else {
      this.editEvent = null;
      this.myForm.reset();
    }
  }

 // Method to open the event details in a read-only view:
 viewEvent(event: any): void {
  this.isViewMode = true;
  this.showForm = true;
  // Patch the form with event data
  this.myForm.patchValue({
    name: event.name,
    start: event.startDate,
    end: event.endDate,
    start_time: event.startTime,
    end_time: event.endTime,
    expected_person: event.expectedPerson,
    budget: event.budget,
    description: event.description,
    type: event.eventType ? event.eventType.id : null,
    venue: event.venue ? event.venue.id : null
  });
  // Disable the form for read-only view
  this.myForm.disable();
}

// When closing the form, re-enable it for the next edit if needed.
closeForm(): void {
  this.showForm = false;
  // If coming out of view mode, re-enable the form for next use.
  if (this.isViewMode) {
    this.myForm.enable();
  }
  this.editEvent = null;
}




  createEvent(): void {
    this.loading = true;
    const formValues = this.myForm.value;

    // Format dates - if you're already using ISO format with your date input, this may be as simple as:
    const startDate = formValues.start; // e.g., "2023-12-01"
    const endDate = formValues.end;     // e.g., "2023-12-01"

    // Format times: if your time input only supplies HH:mm, append ':00' to match "HH:mm:ss"
    const startTime = this.ensureTimeFormat(formValues.start_time); // e.g., "18:00" -> "18:00:00"
    const endTime = this.ensureTimeFormat(formValues.end_time);       // e.g., "23:00" -> "23:00:00"

    // Build the payload so it uses the correct property names and structure
    const payload = {
      name: formValues.name,
      startDate: startDate,
      endDate: endDate,
      startTime: startTime,
      endTime: endTime,
      expectedPerson: formValues.expected_person, // Make sure your form control name matches
      budget: formValues.budget,
      description: formValues.description,
      // Wrap the selected type (from dropdown) into an object with property 'id'
      eventType: { id: formValues.type },
      // Do the same with venue if necessary:
      venue: { id: formValues.venue }
    };

    console.log('Final payload to send:', payload);

    this.eventService.createEvent(payload).subscribe({
      next: () => {
        console.log('Event created successfully');
        this.getEvents();   // Refresh the event list if needed.
        this.loading = false;
        this.closeForm();
        this.messageService.add({
          severity: 'info',
          summary: 'Success',
          detail: 'Event created successfully'
        });
      },
      error: (err) => {
        console.error('Error creating event', err);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not create event'
        });
      }
    });
  }

  // Helper method to ensure a time string is in "HH:mm:ss" format
  ensureTimeFormat(timeStr: string): string {
    const parts = timeStr.split(':');
    if (parts.length === 2) {
      // If the input is like "18:00", append ":00"
      return timeStr + ':00';
    }
    return timeStr;
  }


  updateEvent(): void {
    this.loading = true;
    const formValues = this.myForm.value;

    // Build a payload that matches the backend model:
    const payload = {
      name: formValues.name,
      // Convert the date fields using your helper; form fields "start" and "end" become "startDate" and "endDate"
      startDate: this.formatDate(formValues.start),
      endDate: this.formatDate(formValues.end),
      // Ensure time strings are in "HH:mm:ss"
      startTime: this.ensureTimeFormat(formValues.start_time),
      endTime: this.ensureTimeFormat(formValues.end_time),
      expectedPerson: formValues.expected_person,
      budget: formValues.budget,
      description: formValues.description,
      // Wrap the dropdown values into objects
      eventType: { id: formValues.type },
      venue: { id: formValues.venue }
    };

    // Check if the eventType id is properly provided:
    if (!payload.eventType.id) {
      console.error("Event type is missing in the update payload.");
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Event type is required.'
      });
      this.loading = false;
      return;
    }

    console.log('Payload for update:', payload);

    this.eventService.updateEvent(payload, this.id).subscribe({
      next: () => {
        // Optionally, patch your form with the payload (or the returned data, if available)
        this.myForm.patchValue({
          name: payload.name,
          start: payload.startDate,
          end: payload.endDate,
          start_time: payload.startTime,
          end_time: payload.endTime,
          expected_person: payload.expectedPerson,
          budget: payload.budget,
          description: payload.description,
          type: payload.eventType.id, // Should not be null now.
          venue: payload.venue.id
        });

        this.getEvents(); // Refresh the list if needed.
        this.loading = false;
        this.closeForm();
        this.messageService.add({
          severity: 'info',
          summary: 'Success',
          detail: 'Event updated successfully'
        });
      },
      error: (err) => {
        console.error('Error updating event', err);
        this.loading = false;
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Could not update event'
        });
      }
    });
  }








  getEvents(): void {
    this.eventService.getAllEvents().subscribe({
      next: (response) => {
        console.log('Events:', response);
        this.events = response;
      },
      error: (err) => {
        console.error('Error getting events', err);
      }
    });
  }

  getTypes(): void {
    this.typeService.getAllTypes().subscribe({
      next: (response) => {
        this.types = response;
      },
      error: (err) => {
        console.error('Error getting types', err);
      }
    });
  }

  getVenues(): void {
    this.venueService.getAllVenues().subscribe({
      next: (response) => {
        this.venues = response;
      },
      error: (err) => {
        console.error('Error getting venues', err);
      }
    });
  }

  getContacts(): void {
    this.contactService.getAllContacts().subscribe({
      next: (response) => {
        console.log('Contacts:', response);
        this.contacts = response;
      },
      error: (err) => {
        console.error('Error getting contacts', err);
      }
    });
  }

  deleteType(id: number) {
    this.loading = true; this.eventService.deleteEvent(id).subscribe({
      next: () => {
        this.events = this.events.filter(t => t.id !== id);
        this.messageService.add({ severity: 'success', summary: 'Deleted', detail: 'Type deleted successfully' });
        this.loading = false;
      }, error: (err) => {
        this.messageService.add({ severity: 'error', summary: 'Error', detail: 'Failed to delete type' });
        this.loading = false;
      }
    });
  }

  confirmDelete(event: Event, type: any) {
    event.stopPropagation(); this.eventToDelete = type;
    this.dialogRef = this.dialog.open(this.confirmDeleteDialog);
  }
  ondelnoClick(): void { this.dialogRef.close(); }
  onyesdelClick(): void { this.dialogRef.close(); this.deleteType(this.eventToDelete); }


  // viewEvent(eventId: number): void {
  //   this.router.navigate(['/events', eventId]);
  // }

  formatDate(date: string): string {
    return this.datePipe.transform(date, 'yyyy-MM-dd') || '';
  }
  onDateChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.myForm.controls['start'].setValue(this.formatDate(input.value));
  }

}
