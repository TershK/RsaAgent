
export interface Coordinates {
  lat: number;
  lng: number;
}

export enum LocationType {
  POLICE = 'POLICE',
  HOSPITAL = 'HOSPITAL',
  SAFE_HUB = 'SAFE_HUB',
  DANGER_ZONE = 'DANGER_ZONE'
}

export interface UserProfile {
  fullName: string;
  phone: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  bloodType?: string;
  medicalConditions?: string;
}

export interface LibraryImage {
  id: string;
  url: string;
  timestamp: string;
  analysis?: string;
}

export interface SafetyLocation {
  id: string;
  name: string;
  type: LocationType;
  coords: Coordinates;
  address?: string;
  riskLevel?: number; // 1-10 for Danger Zones
  safetyScore?: number; // 0-100 score
  description?: string;
}

export type AppView = 'DASHBOARD' | 'MAP' | 'SOS' | 'PROFILE' | 'LIBRARY';
export type AuthView = 'LOGIN' | 'SIGNUP' | 'LANDING';

export enum IncidentType {
  SOS = 'SOS',
  CRIME = 'CRIME',
  MEDICAL = 'MEDICAL',
  FIRE = 'FIRE',
  DANGER = 'DANGER'
}

export enum IncidentSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export enum IncidentStatus {
  REPORTED = 'REPORTED',
  RESPONDING = 'RESPONDING',
  RESOLVED = 'RESOLVED'
}

export interface Incident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  status: IncidentStatus;
  location: Coordinates;
  timestamp: string;
  description: string;
  confidence: number;
  unlockCode?: string;
}

export interface ResponderUnit {
  name: string;
  uri: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  image?: string;
  audio?: boolean;
}
