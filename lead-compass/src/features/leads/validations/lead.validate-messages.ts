// features/leads/lead.validation-messages.ts

export const leadValidationMessages = {
  first_name: {
    required: "First name is required",
  },
  last_name: {
    required: "Last name is required",
  },
  designation: {
    required: "Designation is required",
  },
  company_name: {
    required: "Company name is required",
  },
  project_name:{
required:"Project name is required",
  },
  // owner_name: {
  //   required: "Owner name is required",
  // },
  email: {
    required: "Email is required",
    invalid: "Enter a valid email address",
  },
  phone: {
    required: "Phone number is required",
    invalid: "Enter a valid phone number",
  },
  source: {
    invalid: "Select a valid lead source",
  },
  form: {
    incomplete: "Some details are missing or invalid — please review the form",
    atLeastOneField: "At least one field must be provided",
  },
} as const;