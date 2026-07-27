export type ActivePage = 'home' | 'house-watch' | 'pet-care' | 'request' | 'admin' | 'client-portal' | 'associate-portal';

export interface Associate {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: 'Pending Review' | 'Active Reserve';
  backgroundChecked: boolean;
  joinedAt: string;
  availableDates: string[]; // YYYY-MM-DD strings
}

export interface ServiceRequest {
  id: string;
  createdAt: string;
  name: string;
  phone: string;
  email: string;
  serviceNeeded: 'House Watch Only' | 'Pet Care Only' | 'Both House Watch And Pet Care' | 'Not Sure Yet';
  travelDates: string;
  frequencyNeeded: string;
  neighborhood: string;
  clientType: 'New Client' | 'Returning Client';
  petsInvolved: 'Yes' | 'No';
  petsDescription?: string;
  specialHomeInstructions?: string;
  specialPetInstructions?: string;
  emergencyContact: string;
  preferredUpdateMethod: 'Text Message' | 'Email' | 'Phone Call';
  additionalNotes?: string;
  status: 'Received' | 'Confirmed' | 'Pending Discussion' | 'Cancellation Pending';
}

export interface Testimonial {
  id: string;
  name: string;
  quote: string;
  neighborhood: string;
  relationship: string;
  category: 'Home Details' | 'Pet Routines' | 'Follow-Through' | string;
  approved: boolean;
  avatarUrl?: string; // base64 or object URL of client/pet photo
  photoCaption?: string;
  socialHandle?: string;
  includeSocial?: boolean;
}
