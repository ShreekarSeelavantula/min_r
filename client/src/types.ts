export interface UserInput {
  skills: string[];
  experience: string;
  location: string;
  education: string;
  businessType: 'goods' | 'service' | '';
  workEnvironment: 'solo' | 'team' | '';
}

export interface Resource {
  title: string;
  link: string;
  type: string;
  duration: string;
  level?: string;
}

export interface CaseStudy {
  name: string;
  location: string;
  story: string;
  achievement: string;
}

export interface WorkforcePlan {
  initialTeamSize: number;
  roles: string[];
  growthPlan: {
    month3: string;
    month6: string;
    month12: string;
  };
  soloTips?: string[];
}

export interface FinancialPlan {
  investment: string;
  profit_margin: string;
  break_even: string;
  monthly_income?: string;
  equipment_cost?: string;
  operational_expense?: string;
  initialSalesVolume: string;
  scalingStrategy: {
    month3: string;
    month6: string;
    month12: string;
  };
  toolsNeeded: string[];
}

export interface Mentor {
  id: string;
  name: string;
  profilePic: string;
  specialization: string[];
  businessType: 'goods' | 'service' | 'both';
  experience: string;
  rating: number;
  totalMentees: number;
  fees: {
    consultation: string;
    monthly: string;
    package: string;
  };
  contact: {
    email: string;
    phone: string;
    whatsapp?: string;
    linkedin?: string;
  };
  address: {
    city: string;
    state: string;
    area: string;
  };
  availability: {
    mode: 'online' | 'offline' | 'both';
    timings: string[];
    timezone: string;
  };
  languages: string[];
  bio: string;
  achievements: string[];
  testimonials: {
    name: string;
    business: string;
    feedback: string;
    rating: number;
  }[];
}

export interface AlgorithmInfo {
  model: string;
  features: string[];
  trainingData: string;
  accuracy: string;
}

export interface Recommendation {
  name: string;
  id: string;
  description: string;
  businessType: 'goods' | 'service' | 'both';
  confidenceScore: number;
  mlScore?: number;
  resources: Resource[];
  financials: FinancialPlan;
  caseStudies: CaseStudy[];
  workforcePlan: WorkforcePlan;
  dataSources: string[];
  mentors: Mentor[];
  algorithmInfo?: AlgorithmInfo;
}