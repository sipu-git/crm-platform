import { ProjectStatus, ProjectType, Source } from "../../../generated/prisma/enums";

export interface CreateProjectData {
    tenantId: string;
    companyId?: string;
    contactId?: string;
    ownerId?: string;
    leadId?: string;
    enquiryId?: string;
    creatorId: string;
    contactInput?: {
        first_name?: string;
        last_name?: string;
        email?: string;
        phone?: string;
        designation?: string;
    };
    data: {
        company_name: string;
        project_name: string | null;
        project_type: ProjectType | null;
        source: Source;
        description?: string;
        timeline?: string;
        budget?: string;
        status?: ProjectStatus;
    };
}