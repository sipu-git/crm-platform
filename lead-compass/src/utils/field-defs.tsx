import { User, Briefcase, Mail, Phone, Building2, Layers, Tag } from "lucide-react";
import type { JSX } from "react";
import type { Contact } from "@/features/contacts/contact.types";
import type { Lead } from "@/features/leads/lead-m/lead.types";

export type FieldDef<T> = { key: keyof T & string; label: string; icon: JSX.Element; placeholder?: string };

export const CONTACT_FIELDS: FieldDef<Contact>[] = [
  { key: "first_name", label: "First name", icon: <User className="h-3.5 w-3.5" />, placeholder: "John" },
  { key: "last_name", label: "Last name", icon: <User className="h-3.5 w-3.5" />, placeholder: "Doe" },
  { key: "designation", label: "Designation", icon: <Briefcase className="h-3.5 w-3.5" />, placeholder: "CEO" },
  { key: "email", label: "Email", icon: <Mail className="h-3.5 w-3.5" />, placeholder: "john@example.com" },
  { key: "phone", label: "Phone", icon: <Phone className="h-3.5 w-3.5" />, placeholder: "+1 234 567 890" },
];

export const LEAD_FIELDS: FieldDef<Lead>[] = [
  { key: "company_name", label: "Company", icon: <Building2 className="h-3.5 w-3.5" />, placeholder: "Acme Inc" },
  { key: "project_name", label: "Project name", icon: <Layers className="h-3.5 w-3.5" />, placeholder: "Website redesign" },
  { key: "project_type", label: "Project type", icon: <Tag className="h-3.5 w-3.5" />, placeholder: "Web development" },
];