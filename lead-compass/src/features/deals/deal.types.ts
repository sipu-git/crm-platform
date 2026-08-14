import type { Contact } from "@/features/contacts/contact.types";
import { Lead } from "../leads/service1/lead.types";

export interface PipelineStage {
    id: string;
    tenant_id: string;
    name: string;
    sort_order: number;
    probability?: number | null;
    is_won: boolean;
    is_lost: boolean;
}

export interface Deal {
    id: string;
    tenant_id: string;
    title: string;
    amount: number;
    contact_id: string;
    lead_id?: string | null;
    stage_id: string;
    owner_id: string;
    expected_close_date: string;
    created_at?: string;
    updated_at?: string;
    
    contact?: Pick<Contact, "id" | "first_name" | "last_name" | "designation" | "email" | "phone"> | null;
    pipeline?: PipelineStage | null;
    owner?: { id: string; full_name: string } | null;
    leads?: Lead | null;
}

export interface UpdateDealInput {
    title?: string;
    amount?: number;
    owner_id?: string;
    expected_close_date?: string;
}

export interface MoveDealStageInput {
    stageId: string;
}

export interface DealFilters {
    stageId?: string;
    ownerId?: string;
}

export interface DealBoardColumn extends PipelineStage {
    deals: Deal[];
}

export interface DealState {
    deals: Deal[];
    board: DealBoardColumn[];
    dealDetail: Deal | null;
    loading: boolean;
    error: string | null;
    success: boolean;
}