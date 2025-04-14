import OpenAI from 'openai';
import { CompanyData } from '@/types';

// Initialize OpenAI client
let openai: OpenAI;

try {
  // Use the environment variable for the API key
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: false // Set to false for production
  });
  console.log('OpenAI client initialized successfully');
} catch (error) {
  console.error('Error initializing OpenAI client:', error);
  // Fallback initialization with minimal options
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });
}

// Function to limit the total score to a maximum of 85 points
// while maintaining the proportional relationship between categories
function limitTotalScore(data: CompanyData): CompanyData {
  // Calculate the current total score (maximum would be 100)
  const categories = [
    'brandPositionAndPerception', 
    'compensationAndBenefits', 
    'growthAndDevelopment', 
    'peopleAndCulture', 
    'innovationAndProducts'
  ];
  
  // For backwards compatibility
  const oldCategories = [
    'interpersonalFit',
    'thrivingAtWork',
    'experienceAndCompetency',
    'recognitionAndCompensation',
    'purposeAndInvolvement'
  ];
  
  // Calculate total using new category names if available
  let totalScore = 0;
  let usingNewCategories = true;
  
  for (const category of categories) {
    if (typeof data[category as keyof CompanyData] === 'number') {
      totalScore += data[category as keyof CompanyData] as number;
    } else {
      usingNewCategories = false;
      break;
    }
  }
  
  // If new categories weren't found, try old categories
  if (!usingNewCategories) {
    totalScore = 0;
    for (const category of oldCategories) {
      if (typeof data[category as keyof CompanyData] === 'number') {
        totalScore += data[category as keyof CompanyData] as number;
      }
    }
  }
  
  // If the total score exceeds 85, scale down all categories proportionally
  if (totalScore > 85) {
    const scalingFactor = 85 / totalScore;
    
    console.log(`Limiting total score from ${totalScore} to 85 (scaling factor: ${scalingFactor.toFixed(2)})`);
    
    // Scale down the scores
    if (usingNewCategories) {
      for (const category of categories) {
        const currentScore = data[category as keyof CompanyData] as number;
        // Round to nearest integer to ensure whole numbers
        const newScore = Math.round(currentScore * scalingFactor);
        (data as any)[category] = newScore;
      }
    } else {
      for (const category of oldCategories) {
        const currentScore = data[category as keyof CompanyData] as number;
        // Round to nearest integer to ensure whole numbers
        const newScore = Math.round(currentScore * scalingFactor);
        (data as any)[category] = newScore;
      }
    }
    
    // Adjust subcategories to match the new main category scores
    if (data.subcategories) {
      // Scale down subcategory scores proportionally
      for (const key in data.subcategories) {
        if (data.subcategories.hasOwnProperty(key)) {
          const currentSubScore = data.subcategories[key as keyof typeof data.subcategories];
          // Cap subcategory scores at 4 (out of 5) to ensure they're not too high
          const newSubScore = Math.min(4, Math.round(currentSubScore * scalingFactor));
          data.subcategories[key as keyof typeof data.subcategories] = newSubScore;
        }
      }
    }
  }
  
  return data;
}

export async function analyzeCompany(companyName: string): Promise<CompanyData | null> {
  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: `You are an expert in workplace culture and employer branding analysis. You will analyze a company based on its name and provide a detailed assessment of its Workbrand score across five main categories, with each category broken down into four subcategories.

Each main category is worth 20 points total (with each subcategory worth 0-5 points):
1. Interpersonal Fit (20 points)
   - Diversity, Equity, Inclusion, and Belonging initiatives (0-5 points)
   - Leadership effectiveness and alignment (0-5 points)
   - Employee advocacy and brand ambassadorship (0-5 points)
   - Workplace culture and relationships (0-5 points)

2. Thriving at Work (20 points)
   - Employer Value Proposition (EVP) strength (0-5 points)
   - Career development and learning opportunities (0-5 points)
   - Innovation and technological advancement (0-5 points)
   - Work-life balance and flexibility (0-5 points)

3. Experience and Competency (20 points)
   - Employee experience consistency (0-5 points)
   - Feeling of competency and skill utilization (0-5 points)
   - Professional growth and advancement opportunities (0-5 points)
   - Access to necessary resources and tools (0-5 points)

4. Recognition and Compensation (20 points)
   - Compensation and benefits competitiveness (0-5 points)
   - Talent attraction and retention rates (0-5 points)
   - Performance recognition and appreciation (0-5 points)
   - Transparency in compensation structure (0-5 points)

5. Purpose and Involvement (20 points)
   - Social responsibility and community impact (0-5 points)
   - Corporate sustainability initiatives (0-5 points)
   - Employee engagement in company goals (0-5 points)
   - Opportunities for meaningful work (0-5 points)

Also include:
- The company's Average Employee Rating (if available)
- Approximate number of employees
- Approximate number of LinkedIn followers
- Headquarters location (city, state/province, country)
- Stock ticker symbol and current stock price (if the company is publicly traded)
- A primary brand color (hex code)
- Top 3 words that best describe the company's employer brand, consisting of 1 negative keyword (representing an area for improvement) and 2 positive keywords (representing strengths)
- A brief analysis paragraph for each category
- An overview paragraph summarizing the company's workbrand strengths and areas for improvement
- An employer value proposition (EVP) statement that captures the company's mission and what they offer to employees (1-2 sentences). Write this in third-person (e.g., "Company X provides..." rather than "At Company X, we provide...")

Your response should be in JSON format with the following structure:
{
  "interpersonalFit": number,
  "thrivingAtWork": number,
  "experienceAndCompetency": number,
  "recognitionAndCompensation": number,
  "purposeAndInvolvement": number,
  "glassdoorScore": number,
  "numEmployees": number,
  "linkedinFollowers": number,
  "headquarters": string,
  "stockTicker": string (or null if not applicable),
  "stockPrice": number (or null if not applicable),
  "primaryColor": string,
  "top3Words": string[],
  "evpStatement": string,
  "subcategories": {
    "diversityAndInclusion": number,
    "leadershipEffectiveness": number,
    "employeeAdvocacy": number,
    "workplaceCulture": number,
    "employerValueProposition": number,
    "careerDevelopment": number,
    "innovationAdvancement": number,
    "workLifeBalance": number,
    "employeeExperience": number,
    "competencyUtilization": number,
    "professionalGrowth": number,
    "resourceAccess": number,
    "compensationCompetitiveness": number,
    "talentRetention": number,
    "performanceRecognition": number,
    "compensationTransparency": number,
    "socialResponsibility": number,
    "sustainabilityInitiatives": number,
    "employeeEngagement": number,
    "meaningfulWork": number
  },
  "analysis": {
    "overview": string,
    "interpersonalFit": string,
    "thrivingAtWork": string,
    "experienceAndCompetency": string,
    "recognitionAndCompensation": string,
    "purposeAndInvolvement": string
  }
}`
        },
        {
          role: "user",
          content: `Analyze the workbrand score for ${companyName}. Make sure the main category scores are the sum of their respective subcategory scores.`
        }
      ],
      temperature: 0.7,
      max_tokens: 2000,
      response_format: { type: "json_object" }
    });

    // Check if we have a content response
    if (!response.choices[0].message.content) {
      console.error('OpenAI returned empty content');
      return null;
    }

    try {
      // Try to parse the JSON response
      const result = JSON.parse(response.choices[0].message.content);
      
      // Store the company name in the result for reference
      result.companyName = companyName;
      
      // Ensure critical fields have at least default values
      if (!result.evpStatement) {
        console.log(`Adding default evpStatement for ${companyName}`);
        result.evpStatement = `${companyName} is committed to creating a positive and supportive work environment that enables employees to grow professionally while making meaningful contributions.`;
      }
      
      if (!result.top3Words || !Array.isArray(result.top3Words) || result.top3Words.length === 0) {
        console.log(`Adding default top3Words for ${companyName}`);
        result.top3Words = ["Professional", "Innovative", "Dedicated"];
      }
      
      if (!result.subcategories) {
        console.log(`Creating default subcategories for ${companyName}`);
        result.subcategories = {};
        
        // Add default values for all subcategory scores (3 out of 5 for everything)
        for (const subcategory of [
          "diversityAndInclusion", "leadershipEffectiveness", "employeeAdvocacy", "workplaceCulture",
          "employerValueProposition", "careerDevelopment", "innovationAdvancement", "workLifeBalance",
          "employeeExperience", "competencyUtilization", "professionalGrowth", "resourceAccess",
          "compensationCompetitiveness", "talentRetention", "performanceRecognition", "compensationTransparency",
          "socialResponsibility", "sustainabilityInitiatives", "employeeEngagement", "meaningfulWork"
        ]) {
          result.subcategories[subcategory] = 3;
        }
      }
      
      if (!result.analysis) {
        console.log(`Creating default analysis for ${companyName}`);
        result.analysis = {
          overview: `${companyName} demonstrates a balanced approach to employer branding across key categories.`,
          interpersonalFit: `${companyName} promotes a collaborative work environment with opportunities for growth.`,
          thrivingAtWork: `${companyName} provides resources for employee development and well-being.`,
          experienceAndCompetency: `${companyName} offers a professional environment where skills can be utilized effectively.`,
          recognitionAndCompensation: `${companyName} has a compensation structure designed to attract and retain talent.`,
          purposeAndInvolvement: `${companyName} encourages employees to contribute to meaningful initiatives and projects.`
        };
      }
      
      // Apply score limiting to ensure total score doesn't exceed 85
      const limitedResult = limitTotalScore(result as CompanyData);
      
      return limitedResult;
    } catch (parseError) {
      // Log the parse error and the content that couldn't be parsed
      console.error('Error parsing OpenAI response:', parseError);
      console.error('OpenAI response content:', response.choices[0].message.content);
      
      // Return null to indicate failure
      return null;
    }
  } catch (error) {
    console.error('Error analyzing company:', error);
    return null;
  }
} 