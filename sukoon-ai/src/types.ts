import { LucideIcon } from "lucide-react";

export type ModuleId =
  | "dashboard"
  | "ai-companion"
  | "mood-tracker"
  | "journal"
  | "meditation"
  | "breathing"
  | "self-care"
  | "insights"
  | "community"
  | "settings";

export interface SidebarModule {
  id: ModuleId;
  label: string;
  icon: LucideIcon;
  placeholderText: string;
  description: string;
  isPlaceholderOnly?: boolean;
}

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatarUrl: string;
  joinedDate: string;
}
