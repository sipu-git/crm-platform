import type { Users } from "lucide-react";

export interface HomeFavorite {
  id: string;
  label: string;
  href: string;
  icon: typeof Users;
  tone: string;
}

export interface RecentRecord {
  key: string;
  label: string;
  subtitle: string;
  href: string;
  kind: "lead" | "deal" | "invoice";
}

