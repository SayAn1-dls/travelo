export interface Participant {
  id: string;
  name: string;
  contribution: number;
  amountOwed: number;
  amountPaid: number;
  status: 'settled' | 'owing' | 'owed';
}

export interface Transaction {
  id: string;
  paidBy: string;
  paidByName: string;
  amount: number;
  description: string;
  timestamp: Date;
  splitAmong: string[];
  settled: boolean;
}

export interface Notification {
  id: string;
  type: 'debt_reminder' | 'settlement_complete' | 'payment_received' | 'trip_update';
  message: string;
  targetParticipantId?: string;
  read: boolean;
  timestamp: Date;
}

export interface TripData {
  id: string;
  destination: string;
  departDate: string;
  arriveDate: string;
  budget: number;
  participants: Participant[];
  transactions: Transaction[];
  notifications: Notification[];
  status: 'planning' | 'active' | 'completed';
}

export interface DebtEdge {
  from: string;
  to: string;
  amount: number;
}
