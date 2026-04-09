import { Case, CaseDocument } from '../interfaces/case.interface';

// Mock Cases Database for OeP (Ported from Python backend)
const MOCK_CASES: Case[] = [
  {
    caseId: "BN-2026-OEP-12",
    partyId: "vilda-vovven-789",
    flowInstanceId: "101",
    title: "Ansökan om parkeringstillstånd",
    status: "Inkommet",
    externalStatus: "Under behandling",
    system: "OeP",
    created: new Date(2026, 0, 15, 10, 0),
    updated: new Date(2026, 1, 10, 14, 30),
    documents: [
      {
        id: "doc-1",
        filename: "Ansökan_parkeringskort.pdf",
        type: "Ansökan",
        created: new Date(2026, 0, 15, 10, 0),
        linked_to: "Ärende"
      },
      {
        id: "doc-2",
        filename: "Läkarintyg.pdf",
        type: "Bilaga",
        created: new Date(2026, 0, 15, 10, 5),
        linked_to: "Ärende"
      }
    ],
    messages: [
      {
        id: "msg-1",
        sender: "Maria Svensson",
        sender_role: "Handläggare",
        content: "Hej! Vi har tagit emot din ansökan och börjat titta på den.",
        created: new Date(2026, 0, 16, 9, 0)
      }
    ]
  },
  {
    caseId: "BN-2025-OEP-45",
    partyId: "vilda-vovven-789",
    flowInstanceId: "202",
    title: "Bygglov för altan",
    status: "Avslutad",
    externalStatus: "Beviljad",
    system: "OeP",
    created: new Date(2025, 10, 20, 9, 0),
    updated: new Date(2026, 1, 1, 16, 0),
    documents: [
      {
        id: "doc-3",
        filename: "Ansökan_bygglov.pdf",
        type: "Ansökan",
        created: new Date(2025, 10, 20, 9, 0),
        linked_to: "Ärende"
      },
      {
        id: "doc-4",
        filename: "Fasadritning.pdf",
        type: "Bilaga",
        created: new Date(2025, 10, 20, 9, 10),
        linked_to: "Ärende"
      },
      {
        id: "doc-5",
        filename: "Beslut_bygglov_beviljat.pdf",
        type: "Beslut",
        created: new Date(2026, 1, 1, 16, 0),
        linked_to: "Beslut"
      }
    ],
    messages: [
      {
        id: "msg-2",
        sender: "Anna Pettersson",
        sender_role: "Handläggare",
        content: "Hej, vi behöver kompletterande ritningar för att kunna fortsätta handläggningen av din ansökan. Vänligen skicka in fasadritningar och sektionsritning.",
        created: new Date(2026, 1, 10, 11, 0)
      }
    ]
  }
];

const GENERIC_CASES: Case[] = [
  {
    caseId: "BN-2026-OEP-99",
    flowInstanceId: "999",
    title: "Ansökan om försörjningsstöd",
    status: "Inkommet",
    externalStatus: "Under utredning",
    system: "OeP",
    created: new Date(2026, 1, 20, 11, 0),
    updated: new Date(2026, 1, 25, 15, 0),
    documents: [
      {
        id: "doc-99",
        filename: "Inkomstuppgifter.pdf",
        type: "Bilaga",
        created: new Date(2026, 1, 20, 11, 0),
        linked_to: "Ärende"
      }
    ],
    messages: []
  }
];

export class OepService {
  /**
   * Fetches cases for a specific partyId.
   * If no specific cases exist, returns generic ones for demo purposes.
   */
  public async getCasesForParty(partyId: string): Promise<Case[]> {
    let userCases = MOCK_CASES.filter(c => c.partyId === partyId);

    if (userCases.length === 0 && partyId !== "vilda-vovven-789") {
      userCases = GENERIC_CASES.map(c => ({
        ...c,
        partyId: partyId
      }));
    }

    return userCases;
  }

  /**
   * Fetches all documents across all cases for the user.
   */
  public async getAllDocumentsForParty(partyId: string): Promise<CaseDocument[]> {
    const cases = await this.getCasesForParty(partyId);
    const allDocs: CaseDocument[] = [];

    cases.forEach(c => {
      c.documents.forEach(doc => {
        allDocs.push({
          ...doc,
          linked_to: `${c.title} (${c.caseId})`
        });
      });
    });

    return allDocs.sort((a, b) => b.created.getTime() - a.created.getTime());
  }
}

export const oepService = new OepService();
