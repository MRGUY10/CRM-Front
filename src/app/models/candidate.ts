export interface Candidate {
  id: number;
  matricule: string;
  firstname: string;
  lastname: string;
  dateOfBirth: string;  // Use string because JSON date format is usually ISO string
  email: string;
  phone: string;
}
