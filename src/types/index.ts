export interface CompanyAnalysis {
  overview: string;
  brandPositionAndPerception: string;
  compensationAndBenefits: string;
  growthAndDevelopment: string;
  peopleAndCulture: string;
  innovationAndProducts: string;
}

export interface SubcategoryScores {
  // Interpersonal Fit subcategories
  diversityAndInclusion: number; // 0-5 points
  leadershipEffectiveness: number; // 0-5 points
  employeeAdvocacy: number; // 0-5 points
  workplaceCulture: number; // 0-5 points
  
  // Thriving at Work subcategories
  employerValueProposition: number; // 0-5 points
  careerDevelopment: number; // 0-5 points
  innovationAdvancement: number; // 0-5 points
  workLifeBalance: number; // 0-5 points
  
  // Experience and Competency subcategories
  employeeExperience: number; // 0-5 points
  competencyUtilization: number; // 0-5 points
  professionalGrowth: number; // 0-5 points
  resourceAccess: number; // 0-5 points
  
  // Recognition and Compensation subcategories
  compensationCompetitiveness: number; // 0-5 points
  talentRetention: number; // 0-5 points
  performanceRecognition: number; // 0-5 points
  compensationTransparency: number; // 0-5 points
  
  // Purpose and Involvement subcategories
  socialResponsibility: number; // 0-5 points
  sustainabilityInitiatives: number; // 0-5 points
  employeeEngagement: number; // 0-5 points
  meaningfulWork: number; // 0-5 points
}

export interface CompanyData {
  brandPositionAndPerception: number;
  compensationAndBenefits: number;
  growthAndDevelopment: number;
  peopleAndCulture: number;
  innovationAndProducts: number;
  glassdoorScore: number;
  numEmployees: number;
  linkedinFollowers: number;
  headquarters: string;
  stockTicker?: string; // Optional since not all companies are publicly traded
  stockPrice?: number;  // Optional since not all companies are publicly traded
  primaryColor?: string; // Optional for backward compatibility
  top3Words: string[]; // Top 3 words associated with the employer brand
  evpStatement: string; // Employer Value Proposition statement
  evpScore?: number; // Score for the Employer Value Proposition (0-5)
  analysis: CompanyAnalysis;
  subcategories: SubcategoryScores;
  companyName?: string; // The name of the company (added for reference)
}

export interface FormData {
  companyName: string;
  email: string;
  competitorName: string;
}

export interface StoredCompanyData extends CompanyData {
  email?: string;
  timestamp?: string;
}

export type Category = 
  | 'brandPositionAndPerception'
  | 'compensationAndBenefits'
  | 'growthAndDevelopment'
  | 'peopleAndCulture'
  | 'innovationAndProducts';

export const categoryLabels: Record<Category, string> = {
  brandPositionAndPerception: 'Brand Position & Perception',
  compensationAndBenefits: 'Compensation & Benefits',
  growthAndDevelopment: 'Growth & Development',
  peopleAndCulture: 'People & Culture',
  innovationAndProducts: 'Innovation & Products'
};

// Mapping of categories to their subcategories
export const subcategoryLabels: Record<string, string> = {
  // Interpersonal Fit subcategories
  diversityAndInclusion: 'Diversity, Equity, Inclusion, and Belonging',
  leadershipEffectiveness: 'Leadership Effectiveness and Alignment',
  employeeAdvocacy: 'Employee Advocacy and Brand Ambassadorship',
  workplaceCulture: 'Workplace Culture and Relationships',
  
  // Thriving at Work subcategories
  employerValueProposition: 'Employer Value Proposition Strength',
  careerDevelopment: 'Career Development and Learning Opportunities',
  innovationAdvancement: 'Innovation and Technological Advancement',
  workLifeBalance: 'Work-life Balance and Flexibility',
  
  // Experience and Competency subcategories
  employeeExperience: 'Employee Experience Consistency',
  competencyUtilization: 'Feeling of Competency and Skill Utilization',
  professionalGrowth: 'Professional Growth and Advancement Opportunities',
  resourceAccess: 'Access to Necessary Resources and Tools',
  
  // Recognition and Compensation subcategories
  compensationCompetitiveness: 'Compensation and Benefits Competitiveness',
  talentRetention: 'Talent Attraction and Retention Rates',
  performanceRecognition: 'Performance Recognition and Appreciation',
  compensationTransparency: 'Transparency in Compensation Structure',
  
  // Purpose and Involvement subcategories
  socialResponsibility: 'Social Responsibility and Community Impact',
  sustainabilityInitiatives: 'Corporate Sustainability Initiatives',
  employeeEngagement: 'Employee Engagement in Company Goals',
  meaningfulWork: 'Opportunities for Meaningful Work'
};

// Mapping of categories to their subcategory keys
export const categoryToSubcategories: Record<Category, string[]> = {
  brandPositionAndPerception: ['diversityAndInclusion', 'leadershipEffectiveness', 'employeeAdvocacy', 'workplaceCulture'],
  compensationAndBenefits: ['compensationCompetitiveness', 'talentRetention', 'performanceRecognition', 'compensationTransparency'],
  growthAndDevelopment: ['employerValueProposition', 'careerDevelopment', 'professionalGrowth', 'resourceAccess'],
  peopleAndCulture: ['employeeExperience', 'competencyUtilization', 'workLifeBalance', 'meaningfulWork'],
  innovationAndProducts: ['innovationAdvancement', 'socialResponsibility', 'sustainabilityInitiatives', 'employeeEngagement']
};

export interface ComparisonResult {
  userCompany: CompanyData;
  competitor: CompanyData;
  competitorName: string;
} 