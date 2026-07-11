export type ActivityType = "note" | "call" | "email" | "meeting" | "task" | "status_change";

export interface Activity {
  id: string;
  type: ActivityType;
  subjectType: "contact" | "deal" | "lead" | "invoice";
  subjectId: string;
  message: string;
  authorId?: string;
  createdAt: string;
}
