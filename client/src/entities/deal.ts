export type DealStage =
  | "new"
  | "qualified"
  | "proposal"
  | "negotiation"
  | "won"
  | "lost";

export interface Deal {
  id: string;
  title: string;
  contactId?: string;
  value: number;
  currency?: string;
  stage: DealStage;
  probability?: number;
  expectedCloseDate?: string;
  ownerId?: string;
  createdAt: string;
  updatedAt: string;
}

export type DealInput = Omit<Deal, "id" | "createdAt" | "updatedAt">;
