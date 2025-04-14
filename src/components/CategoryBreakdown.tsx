import React from 'react';
import { CompanyData, Category, categoryToSubcategories, subcategoryLabels } from '@/types';
import { capitalizeText } from '@/utils/formatting';

interface CategoryBreakdownProps {
  category: Category;
  userCompany: CompanyData;
  competitor: CompanyData;
  userCompanyName: string;
  competitorName: string;
}

export default function CategoryBreakdown({
  category,
  userCompany,
  competitor,
  userCompanyName,
  competitorName,
}: CategoryBreakdownProps) {
  // Verify we have valid company data objects
  if (!userCompany || !competitor) {
    return (
      <div className="p-4 bg-red-50 rounded-lg text-red-600">
        Error: Company data is missing. Please try again.
      </div>
    );
  }
  
  // Get the subcategories for this category
  const subcategories = categoryToSubcategories[category];
  
  // Get the colors for each company
  const userCompanyColor = userCompany.primaryColor || '#2F3295';
  const competitorColor = competitor.primaryColor || '#FE619E';

  // Map new categories to old categories for analysis access
  const categoryAnalysisMap = {
    'brandPositionAndPerception': 'interpersonalFit',
    'compensationAndBenefits': 'recognitionAndCompensation',
    'growthAndDevelopment': 'thrivingAtWork',
    'peopleAndCulture': 'experienceAndCompetency',
    'innovationAndProducts': 'purposeAndInvolvement'
  };
  
  // Get the corresponding old category name for analysis access
  const analysisCategory = categoryAnalysisMap[category as keyof typeof categoryAnalysisMap] || category;
  
  // Helper function to safely access subcategory scores
  const getSubcategoryScore = (company: CompanyData, subcategory: string): number => {
    if (!company.subcategories) return 0;
    return (company.subcategories[subcategory as keyof typeof company.subcategories] as number) || 0;
  }
  
  // Helper function to safely access analysis text
  const getAnalysisText = (company: CompanyData, category: string): string => {
    if (!company.analysis) return "No analysis available.";
    const text = company.analysis[category as keyof typeof company.analysis];
    return typeof text === 'string' ? text : "No analysis available for this category.";
  }

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl shadow-lg p-6 backdrop-blur-sm">
        <div className="flex items-center mb-5">
          <div className="w-1.5 h-6 rounded-full mr-3" style={{ backgroundColor: "#FF629F" }}></div>
          <h3 className="text-xl font-semibold" style={{ color: "#FFFFFF" }}>Category Comparison</h3>
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {subcategories.map((subcategory, index) => {
            // Determine which company has the higher score
            const userScore = getSubcategoryScore(userCompany, subcategory);
            const competitorScore = getSubcategoryScore(competitor, subcategory);
            const userHasHigherScore = userScore > competitorScore;
            const competitorHasHigherScore = competitorScore > userScore;
            
            return (
              <div key={subcategory} className="bg-white/70 backdrop-blur-sm rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                  <h4 className="font-medium text-sm" style={{ color: "#000000" }}>
                    {subcategoryLabels[subcategory]}
                  </h4>
                  <div className="flex items-center space-x-1">
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${competitorHasHigherScore ? 'opacity-40' : 'opacity-100'}`}
                      style={{ 
                        backgroundColor: `${userCompanyColor}20`, 
                        color: userCompanyColor
                      }}>
                      {userScore}
                    </span>
                    <span className="text-xs mx-1 font-medium" style={{ 
                      background: `-webkit-linear-gradient(left, ${userCompanyColor}, ${competitorColor})`,
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent'
                    }}>vs</span>
                    <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-medium ${userHasHigherScore ? 'opacity-40' : 'opacity-100'}`} 
                      style={{ 
                        backgroundColor: `${competitorColor}20`, 
                        color: competitorColor
                      }}>
                      {competitorScore}
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className={competitorHasHigherScore ? 'opacity-50' : 'opacity-100'}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: userCompanyColor }}>{userCompanyName}</span>
                        <span className="text-xs font-medium" style={{ color: userCompanyColor }}>{userScore}/5</span>
                      </div>
                      <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                          <div className="h-0.5 w-full bg-gray-200"></div>
                        </div>
                        <div className="relative flex justify-between">
                          {[1, 2, 3, 4, 5].map((point) => (
                            <div key={point} className={`w-3 h-3 rounded-full flex items-center justify-center ${
                              point <= userScore
                                ? 'bg-white' : 'bg-gray-200'
                            }`}>
                              <div 
                                className={`w-2 h-2 rounded-full ${
                                  point <= userScore
                                    ? '' : 'hidden'
                                }`}
                                style={{ 
                                  backgroundColor: userCompanyColor,
                                  boxShadow: `0 0 4px ${userCompanyColor}` 
                                }}
                              ></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <div className={userHasHigherScore ? 'opacity-50' : 'opacity-100'}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium" style={{ color: competitorColor }}>{competitorName}</span>
                        <span className="text-xs font-medium" style={{ color: competitorColor }}>{competitorScore}/5</span>
                      </div>
                      <div className="relative w-full">
                        <div className="absolute inset-0 flex items-center">
                          <div className="h-0.5 w-full bg-gray-200"></div>
                        </div>
                        <div className="relative flex justify-between">
                          {[1, 2, 3, 4, 5].map((point) => (
                            <div key={point} className={`w-3 h-3 rounded-full flex items-center justify-center ${
                              point <= competitorScore
                                ? 'bg-white' : 'bg-gray-200'
                            }`}>
                              <div 
                                className={`w-2 h-2 rounded-full ${
                                  point <= competitorScore
                                    ? '' : 'hidden'
                                }`}
                                style={{ 
                                  backgroundColor: competitorColor,
                                  boxShadow: `0 0 4px ${competitorColor}` 
                                }}
                              ></div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
} 