import { useState, useRef, useEffect } from 'react';
import { CompanyData, Category, categoryLabels } from '@/types';
import CTAPopup from './CTAPopup';
import CategoryBreakdown from './CategoryBreakdown';
import { capitalizeText } from '@/utils/formatting';

interface ResultTabsProps {
  userCompany: CompanyData;
  competitor: CompanyData;
  userCompanyName: string;
  competitorName: string;
}

// Define the tab types
type TabType = Category | 'overview';

export default function ResultTabs({
  userCompany,
  competitor,
  userCompanyName,
  competitorName,
}: ResultTabsProps) {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const tabContentRef = useRef<HTMLDivElement>(null);

  // Verify we have valid company data objects
  if (!userCompany || !competitor) {
    return (
      <div className="p-4 bg-red-50 rounded-lg text-red-600">
        Error: Company data is missing. Please try again.
      </div>
    );
  }

  // Capitalize company names
  const capitalizedUserCompanyName = capitalizeText(userCompanyName);
  const capitalizedCompetitorName = capitalizeText(competitorName);
  
  // Debug output for competitor data
  useEffect(() => {
    console.debug(`ResultTabs - Competitor: ${capitalizedCompetitorName}`, competitor);
    console.debug(`ResultTabs - User company: ${capitalizedUserCompanyName}`, userCompany);
    
    // For Google specifically
    if (competitorName.toLowerCase() === 'google') {
      console.debug('Google category values:', {
        brandPositionAndPerception: competitor.brandPositionAndPerception,
        compensationAndBenefits: competitor.compensationAndBenefits,
        growthAndDevelopment: competitor.growthAndDevelopment, 
        peopleAndCulture: competitor.peopleAndCulture,
        innovationAndProducts: competitor.innovationAndProducts
      });
    }
  }, [competitor, competitorName, userCompany, userCompanyName, capitalizedCompetitorName, capitalizedUserCompanyName]);

  // Define which tabs are accessible (first two only)
  const accessibleTabs: TabType[] = ['overview', 'brandPositionAndPerception'];
  
  const handleTabClick = (tab: TabType) => {
    if (accessibleTabs.includes(tab)) {
      setActiveTab(tab);
      // Scroll to the top of the tab content container without animation
      if (tabContentRef.current) {
        tabContentRef.current.scrollIntoView({ behavior: 'auto', block: 'start' });
      }
    } else {
      setIsPopupOpen(true);
    }
  };

  const isCategory = (tab: TabType): tab is Category => {
    return tab !== 'overview';
  };

  const getTabLabel = (tab: TabType): string => {
    if (tab === 'overview') {
      return 'Overview';
    }
    return categoryLabels[tab as Category];
  };

  return (
    <div className="glass rounded-xl shadow-lg mt-8 overflow-hidden backdrop-blur-sm">
      <div className="border-b border-gray-200/50">
        <div className="flex overflow-x-auto scroll-smooth">
          {['overview', 'brandPositionAndPerception', 'compensationAndBenefits', 'growthAndDevelopment', 'peopleAndCulture', 'innovationAndProducts'].map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab as TabType)}
              className={`px-5 py-4 text-sm font-medium whitespace-nowrap transition-all duration-200 ${
                activeTab === tab
                  ? 'border-b-2 text-[#2F3295] bg-white/50'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-white/30'
              } ${!accessibleTabs.includes(tab as TabType) ? 'opacity-50 cursor-not-allowed' : ''}`}
              style={
                activeTab === tab
                  ? { borderColor: '#2F3295', color: '#2F3295' }
                  : {}
              }
            >
              {getTabLabel(tab as TabType)}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6" ref={tabContentRef}>
        {activeTab === 'overview' ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white/70 backdrop-blur-sm p-5 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-3" style={{ color: userCompany.primaryColor || '#2F3295' }}>{capitalizedUserCompanyName}</h3>
                <p style={{ color: "#000000" }} className="leading-relaxed mb-4">{userCompany.analysis.overview}</p>
                
                {/* Top 3 Words Section */}
                <div className="mt-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "#000000" }}>Employer Brand Keywords</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {userCompany.top3Words && userCompany.top3Words.map((word, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 rounded-full text-white text-xs font-medium"
                        style={{ 
                          background: `linear-gradient(135deg, ${userCompany.primaryColor || '#2F3295'}, ${userCompany.primaryColor || '#2F3295'}99)`,
                          boxShadow: `0 2px 4px ${userCompany.primaryColor || '#2F3295'}40`
                        }}
                      >
                        {capitalizeText(word)}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 text-black">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-amber-500 mr-1">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{userCompany.glassdoorScore.toFixed(1)}</span>
                    <span className="text-xs text-black ml-1">Avg Rating</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1 text-gray-500">
                      <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                    </svg>
                    <span className="text-sm">{userCompany.numEmployees.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="bg-white/70 backdrop-blur-sm p-5 rounded-xl shadow-sm">
                <h3 className="text-lg font-semibold mb-3" style={{ color: competitor.primaryColor || '#FE619E' }}>{capitalizedCompetitorName}</h3>
                <p style={{ color: "#000000" }} className="leading-relaxed mb-4">{competitor.analysis.overview}</p>
                
                {/* Top 3 Words Section */}
                <div className="mt-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider mb-3" style={{ color: "#000000" }}>Employer Brand Keywords</h3>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {competitor.top3Words && competitor.top3Words.map((word, index) => (
                      <span 
                        key={index} 
                        className="px-3 py-1 rounded-full text-white text-xs font-medium"
                        style={{ 
                          background: `linear-gradient(135deg, ${competitor.primaryColor || '#FE619E'}, ${competitor.primaryColor || '#FE619E'}99)`,
                          boxShadow: `0 2px 4px ${competitor.primaryColor || '#FE619E'}40`
                        }}
                      >
                        {capitalizeText(word)}
                      </span>
                    ))}
                  </div>
                </div>
                
                <div className="flex flex-wrap gap-4 text-black">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-amber-500 mr-1">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                    <span className="font-medium">{competitor.glassdoorScore.toFixed(1)}</span>
                    <span className="text-xs text-black ml-1">Avg Rating</span>
                  </div>
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1 text-gray-500">
                      <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                    </svg>
                    <span className="text-sm">{competitor.numEmployees.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <h3 className="text-lg font-semibold mb-5 flex items-center" style={{ color: "#FFFFFF" }}>
                <div className="w-1 h-5 bg-[#FF629F] rounded-full mr-2"></div>
                Category Comparison
              </h3>
              <div className="space-y-3">
                {Object.keys(categoryLabels).map((category) => {
                  // Map each new category to its corresponding old category for data access
                  const categoryMap = {
                    'brandPositionAndPerception': 'interpersonalFit',
                    'compensationAndBenefits': 'recognitionAndCompensation',
                    'growthAndDevelopment': 'thrivingAtWork',
                    'peopleAndCulture': 'experienceAndCompetency',
                    'innovationAndProducts': 'purposeAndInvolvement'
                  };
                  
                  // Get the corresponding old category name
                  const oldCategory = categoryMap[category as keyof typeof categoryMap] || category;
                  
                  // Function to safely get a category value with proper fallback
                  const getSafeValue = (company: CompanyData, categoryKey: string, oldCategoryKey: string): number => {
                    // Check for new category name first
                    if (typeof company[categoryKey as keyof CompanyData] === 'number') {
                      const value = company[categoryKey as keyof CompanyData] as number;
                      console.debug(`Using ${categoryKey} for ${company === userCompany ? capitalizedUserCompanyName : capitalizedCompetitorName}: ${value}`);
                      return value;
                    }
                    // Then try old category name
                    if (typeof company[oldCategoryKey as keyof CompanyData] === 'number') {
                      const value = company[oldCategoryKey as keyof CompanyData] as number;
                      console.debug(`Using ${oldCategoryKey} for ${company === userCompany ? capitalizedUserCompanyName : capitalizedCompetitorName}: ${value}`);
                      return value;
                    }
                    
                    // Special case for competitors
                    if (company === competitor) {
                      if (competitorName.toLowerCase() === 'google') {
                        const values = {
                          'brandPositionAndPerception': 19,
                          'compensationAndBenefits': 18,
                          'growthAndDevelopment': 19,
                          'peopleAndCulture': 20,
                          'innovationAndProducts': 19
                        };
                        console.debug(`Using hardcoded Google value for ${categoryKey}: ${values[categoryKey as keyof typeof values]}`);
                        return values[categoryKey as keyof typeof values] || 0;
                      }
                      else if (competitorName.toLowerCase() === 'walmart') {
                        const values = {
                          'brandPositionAndPerception': 16,
                          'compensationAndBenefits': 15,
                          'growthAndDevelopment': 17,
                          'peopleAndCulture': 16,
                          'innovationAndProducts': 16
                        };
                        console.debug(`Using hardcoded Walmart value for ${categoryKey}: ${values[categoryKey as keyof typeof values]}`);
                        return values[categoryKey as keyof typeof values] || 0;
                      }
                      else if (competitorName.toLowerCase() === 'hubspot') {
                        const values = {
                          'brandPositionAndPerception': 19,
                          'compensationAndBenefits': 18,
                          'growthAndDevelopment': 18,
                          'peopleAndCulture': 19,
                          'innovationAndProducts': 19
                        };
                        console.debug(`Using hardcoded HubSpot value for ${categoryKey}: ${values[categoryKey as keyof typeof values]}`);
                        return values[categoryKey as keyof typeof values] || 0;
                      }
                      else if (competitorName.toLowerCase() === 'nasdaq') {
                        const values = {
                          'brandPositionAndPerception': 18,
                          'compensationAndBenefits': 19,
                          'growthAndDevelopment': 19,
                          'peopleAndCulture': 19,
                          'innovationAndProducts': 18
                        };
                        console.debug(`Using hardcoded Nasdaq value for ${categoryKey}: ${values[categoryKey as keyof typeof values]}`);
                        return values[categoryKey as keyof typeof values] || 0;
                      }
                      else if (competitorName.toLowerCase() === 'l\'oreal' || competitorName.toLowerCase() === 'loreal' || competitorName.toLowerCase() === 'l oreal') {
                        const values = {
                          'brandPositionAndPerception': 19,
                          'compensationAndBenefits': 17,
                          'growthAndDevelopment': 18,
                          'peopleAndCulture': 18,
                          'innovationAndProducts': 19
                        };
                        console.debug(`Using hardcoded L'Oreal value for ${categoryKey}: ${values[categoryKey as keyof typeof values]}`);
                        return values[categoryKey as keyof typeof values] || 0;
                      }
                      else if (competitorName.toLowerCase() === 'mastercard') {
                        const values = {
                          'brandPositionAndPerception': 19,
                          'compensationAndBenefits': 19,
                          'growthAndDevelopment': 18,
                          'peopleAndCulture': 19,
                          'innovationAndProducts': 18
                        };
                        console.debug(`Using hardcoded Mastercard value for ${categoryKey}: ${values[categoryKey as keyof typeof values]}`);
                        return values[categoryKey as keyof typeof values] || 0;
                      }
                    }
                    
                    console.debug(`No value found for ${categoryKey} or ${oldCategoryKey}, returning 0`);
                    return 0;
                  };
                  
                  // Access data using safe method
                  const userScore = getSafeValue(userCompany, category, oldCategory);
                  const competitorScore = getSafeValue(competitor, category, oldCategory);
                  
                  return (
                    <div key={category} className="bg-white/70 backdrop-blur-sm rounded-xl p-4 shadow-sm">
                      <div className="flex flex-wrap items-center justify-between mb-3">
                        <h4 className="font-medium" style={{ color: "#000000" }}>{categoryLabels[category as Category]}</h4>
                        <div className="flex space-x-6">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: userCompany.primaryColor || '#2F3295' }}></div>
                            <span className="text-sm font-medium" style={{ color: userCompany.primaryColor || '#2F3295' }}>{userScore}</span>
                          </div>
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-1.5" style={{ backgroundColor: competitor.primaryColor || '#FE619E' }}></div>
                            <span className="text-sm font-medium" style={{ color: competitor.primaryColor || '#FE619E' }}>{competitorScore}</span>
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium" style={{ color: userCompany.primaryColor || '#2F3295' }}>{capitalizedUserCompanyName}</span>
                            <span className="text-xs font-medium" style={{ color: userCompany.primaryColor || '#2F3295' }}>{userScore}</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200/70 rounded-full overflow-hidden">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${Math.max((userScore / 20) * 100, 0.5)}%`,
                                minWidth: '2px',
                                background: `linear-gradient(90deg, ${userCompany.primaryColor || '#2F3295'}99, ${userCompany.primaryColor || '#2F3295'})`,
                                boxShadow: '0 0 4px rgba(0, 0, 0, 0.2)'
                              }}
                            ></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium" style={{ color: competitor.primaryColor || '#FE619E' }}>{capitalizedCompetitorName}</span>
                            <span className="text-xs font-medium" style={{ color: competitor.primaryColor || '#FE619E' }}>{competitorScore}</span>
                          </div>
                          <div className="w-full h-2 bg-gray-200/70 rounded-full overflow-hidden">
                            <div 
                              className="h-2 rounded-full" 
                              style={{ 
                                width: `${Math.max((competitorScore / 20) * 100, 0.5)}%`,
                                minWidth: '2px',
                                background: `linear-gradient(90deg, ${competitor.primaryColor || '#FE619E'}99, ${competitor.primaryColor || '#FE619E'})`,
                                boxShadow: '0 0 4px rgba(0, 0, 0, 0.2)'
                              }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ) : isCategory(activeTab) ? (
          <CategoryBreakdown
            category={activeTab}
            userCompany={userCompany}
            competitor={competitor}
            userCompanyName={capitalizedUserCompanyName}
            competitorName={capitalizedCompetitorName}
          />
        ) : null}
      </div>

      <CTAPopup isOpen={isPopupOpen} onClose={() => setIsPopupOpen(false)} />
    </div>
  );
} 