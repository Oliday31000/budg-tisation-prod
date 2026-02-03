
export interface FinancialItem {
  id: string;
  designation: string;
  category: string;
  produit: string;
  coutUnitaire: number;
  prixVenteJournalier: number;
  jours: number;
  assignedEmail?: string;
  providerPassword?: string;
  lastProviderUpdate?: string;
  order?: number; 
  responderEmail?: string;
  // New identification fields
  firstName?: string;
  lastName?: string;
  companyName?: string;
}

export interface SummaryStats {
  totalCA: number;
  totalCouts: number;
  profitTotal: number;
  margeMoyenne: number;
  totalJours: number;
}

export interface HistoryItem {
  id: string;
  name: string;
  date: string;
  data: FinancialItem[];
  stats: SummaryStats;
  invitedTeam: InvitedMember[];
  brief: string;
}

export interface InvitedMember {
  email: string;
  code: string;
}

export type UserRole = 'admin' | 'provider';

export interface UserSession {
  role: UserRole;
  email?: string;
  isAuthenticated: boolean;
}

export type ProjectType = 'UnityVR' | 'WebGL' | 'Video360' | 'Hybrid';

export interface PlanningTask {
  id: string;
  name: string;
  role: string;
  phase: 'Cadrage' | 'Préproduction' | 'Production' | 'Stabilisation' | 'Livraison';
  startDay: number;
  duration: number;
  dependencies: string[];
  deliverable: string;
  color?: string;
}
