import { LeadStatus, Source } from "../../../generated/prisma/enums";

export const LeadStatusOrder: LeadStatus[] = [
    "NEW", "CONTRACTED", "QUALIFIED", "CONVERTED", "DISQUALIFIED"
]

export interface PaginationParams {
    page?: number;
    limit?: number;
}