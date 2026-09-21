export interface TeamInviteInput {
  email: string;
  role: 'ADMIN' | 'MANAGER' | 'SALES_REP' | 'USER';
}

export interface SignupFormData {
  // Step 1: Account
  full_name: string;
  email: string;
  password: string;
  confirm_password: string;
  terms_accepted: boolean;

  // Step 2: OTP Verification
  otp: string;
  is_email_verified: boolean;
  verification_token: string;

  // Step 3: Company & Workspace Slug
  tenant_name: string;
  tenant_slug: string;
  industry: string;
  company_size: string;
  location: string;
  website: string;

  // Step 4: CRM Setup
  crm_goals: string[];

  // Step 5: Departments
  departments: string[];

  // Step 6: Team Invites
  team_invites: TeamInviteInput[];
}

export interface CompleteSignupPayload {
  verificationToken: string;
  full_name: string;
  email: string;
  password: string;
  tenant_name: string;
  tenant_slug: string;
  industry?: string;
  company_size?: string;
  website?: string;
  location?: string;
  crm_goals?: string[];
  departments?: string[];
  team_invites?: TeamInviteInput[];
}

export interface CompleteSignupResponse {
  accessToken: string;
  refreshToken: string;
  tenantSlug: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    tenantId: string;
    companyId?: string;
    tenantSlug: string;
  };
  permissions: string[];
}

