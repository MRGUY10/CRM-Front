export interface Application {
  id: number;
  matricule: string;
  firstName: string;
  lastName: string;
  nationality: string;
  regionOfOrigin: string;
  address: string;
  whatsappNumber: string;
  email: string;
  dateOfBirth: string;  // ISO format date string
  phoneNumber: string;
  program: Program;
  status: ApplicationStatus;
  submissionDate: string;
  applicationDate: string;
  columnIndex: number;
  educationDetails: EducationDetails;
  familyDetails: FamilyDetails;
  documents: Document[];
}

export enum Program {
  ENGINEERING = 'ENGINEERING',
  MANAGEMENT = 'MANAGEMENT',
  LICENSE = 'LICENSE'
}


export enum ApplicationStatus {
  DRAFT = 'DRAFT',
  SUBMITTED = 'SUBMITTED',
  APPLICATION_REJECTED = 'APPLICATION_REJECTED',
  APPLICATION_ACCEPTED = 'APPLICATION_ACCEPTED',
  EXAM_REGISTERED= 'EXAM_REGISTERED',
  ADMISSION_OFFERED = 'ADMISSION_OFFERED',
  ADMISSION_REJECTED = 'ADMISSION_REJECTED',
  STUDENT = 'STUDENT'
}

export interface PersonalDetails {
  id: number;
  matricule: string;
  nationality: string;
  regionOfOrigin: string;
  address: string;
  whatsappNumber: string;
  firstName: string;
  lastName: string;
  email: string;
  dateOfBirth: string;  // ISO format date string
  phoneNumber: string;
  application: Application;  // Relationship to Application
}


export interface EducationDetails {
  id: number;
  hasAL: boolean;
  upperSixthSeries: string;
  totalNumberInClass: number;
  town: string;
  school: string;
  repeatedClass: boolean;
  alGrades: string;
  olGrades: string;
  termPositions: string;
  chosenWritingCenter: string;
  chosenField: string;
  application: Application;  // Relationship to Application
}

export interface FamilyDetails {
  id: number;
  fatherName: string;
  fatherProfession: string;
  fatherPhone: string;
  motherName: string;
  motherProfession: string;
  motherPhone: string;
  application: Application;  // Relationship to Application
}
export interface Document {
  id: number;
  documentType: string;  // Type of document (e.g., "ID Card", "Transcript")
  documentContent: string;  // Base64 encoded string (for simplicity in Angular)
  application: Application;  // Relationship to Application
}
