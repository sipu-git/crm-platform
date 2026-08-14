// src/features/companies/company.validation-messages.ts
export const companyValidationMessages = {
  name: {
    required: "Company name is required",
    min: "Company name must be at least 2 characters",
    max: "Company name must be under 120 characters",
  },
  // owner_name: {
  //   required: "Company owner name is required",
  //   invalid: "Select a valid owner",
  // },
  legal_name: {
    max: "Legal name must be under 160 characters",
  },
  industry: {
    max: "Industry must be under 80 characters",
  },
  size: {
    invalid: "Select a valid company size",
  },
  annual_revenue: {
    invalid: "Enter a valid number",
    negative: "Annual revenue can't be negative",
    max: "Annual revenue is too large",
  },
  company_status: {
    invalid: "Select a valid status",
  },
  website: {
    invalid: "Enter a valid URL, e.g. https://example.com",
  },
  email: {
    invalid: "Enter a valid email address",
  },
  phone: {
    invalid: "Enter a valid phone number",
    min: "Phone number is too short",
  },
  address_line1: {
    max: "Address line 1 must be under 160 characters",
  },
  address_line2: {
    max: "Address line 2 must be under 160 characters",
  },
  city: {
    max: "City must be under 80 characters",
  },
  state: {
    max: "State must be under 80 characters",
  },
  country: {
    max: "Country must be under 80 characters",
  },
  postal_code: {
    invalid: "Enter a valid postal code",
  },
  source: {
    max: "Source must be under 80 characters",
  },
  tags: {
    max: "You can add up to 15 tags",
    itemMax: "Each tag must be under 30 characters",
  },
  form: {
    incomplete: "Some details are missing or invalid — please review the earlier steps",
    atLeastOneField: "At least one field must be provided",
  },
} as const;