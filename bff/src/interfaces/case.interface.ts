export interface CaseDocument {
  id: string;
  filename: string;
  type: string;
  created: Date;
  linked_to: string;
}

export interface CaseMessage {
  id: string;
  sender: string;
  sender_role: string;
  content: string;
  created: Date;
}

export interface Case {
  caseId: string;
  partyId?: string;
  flowInstanceId: string;
  title: string;
  status: string;
  externalStatus: string;
  system: string;
  created: Date;
  updated: Date;
  documents: CaseDocument[];
  messages: CaseMessage[];
}
