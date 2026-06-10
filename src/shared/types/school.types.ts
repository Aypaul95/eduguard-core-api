export interface School {
  id: string;
  name: string;
  code: string; // unique school identifier
  isActive: boolean;
  subscriptionPlan?: "FREE" | "BASIC" | "PREMIUM";
  createdAt: Date;
  updatedAt: Date;
}

export interface SchoolContext {
  schoolId: string;
  schoolCode?: string;
}