export enum ExposureLevel {
  E0 = 'E0', // No exposure
  E1 = 'E1', // Direct LLM
  E2 = 'E2', // App-based
  E3 = 'E3', // Multimodal
}

export enum SkillClass {
  S0 = 'S0', // Irrelevant
  S1 = 'S1', // AI-Relevant
  S2 = 'S2', // Complemented
  S3 = 'S3', // Substitutable
}

export enum AugmentationPotential {
  Low = 'Low',       // Automated or Manual (No synergy)
  Medium = 'Medium', // Oversight required
  High = 'High',     // Human-AI Synergy
}

export interface TaskAnalysis {
  description: string;
  exposureLevel: ExposureLevel;
  augmentationPotential: AugmentationPotential;
  rationale: string;
}

export interface ProcessedTask extends TaskAnalysis {
  x: number; // Automation Coordinate (0-100)
  y: number; // Augmentation Coordinate (0-100)
}

export interface SkillAnalysis {
  name: string;
  classification: SkillClass;
  rationale: string;
}

export interface StrategicRecs {
  roleRedesign: string[];
  reskillingPriorities: string[];
  techIntegration: string[];
}

export interface RawAnalysisResponse {
  jobTitle: string;
  tasks: TaskAnalysis[];
  skills: SkillAnalysis[];
  riskCategory: string;
  executiveSummary: string;
  recommendations: StrategicRecs;
}

export interface ComputedMetrics {
  automationScore: number;
  augmentationScore: number;
  transferabilityIndex: number;
  aiReadinessScore: number;
  quadrant: {
    x: number;
    y: number;
    label: string;
  };
}

export interface FullReport extends Omit<RawAnalysisResponse, 'tasks'>, ComputedMetrics {
  tasks: ProcessedTask[];
  analysisDate: string;
}