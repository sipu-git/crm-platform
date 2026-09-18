export type EnquiryStatus = "PENDING" | "IN_REVIEW" | "APPROVED" | "REJECTED";
export type EnquirySource = "WEBSITE" | "SOCIAL" | "REFERRAL" | "COLD_CALL" | "EVENT" | "PARTNER";
export type ProjectType = "Web_Application" | "Mobile_Application" | "Desktop_Application" | "SaaS_Platform" | "AI_ML_Application" | "Automation_System" | "IoT_Application"

export interface Enquiry {
  id: string;
  company_name?: string;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  designation?: string;
  project_name: string;
  project_type?: ProjectType;
  enquiryStatus: EnquiryStatus;
  timeline?: string;
  budget?: string;
  description?: string;
  isApproved: boolean;
  source: EnquirySource;
  created_at: string;
  updated_at?: string;
  approvedBy?: string;
  assignedTo?: string;
  tenantId?: string;
}

export interface CreateEnquiryInput {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  companyName?: string;
  source: EnquirySource;
  message: string;
}

export interface UpdateEnquiryInput extends Partial<CreateEnquiryInput> {
  status?: EnquiryStatus;
}

export interface EnquiryApprovalInput {
  status: "APPROVED" | "REJECTED";
  approvedBy?: string;
}
