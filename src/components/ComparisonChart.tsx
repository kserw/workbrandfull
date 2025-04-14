import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { CompanyData, categoryLabels, Category } from '@/types';
import { useEffect } from 'react';
import { capitalizeText } from '@/utils/formatting';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface ComparisonChartProps {
  userCompany: CompanyData;
  competitor: CompanyData;
  userCompanyName: string;
  competitorName: string;
}

// Function to calculate total score and letter grade
const calculateTotalScore = (company: CompanyData, isUserCompany: boolean = false, userName: string = '', compName: string = ''): { score: number; grade: string; gradeColor: string } => {
  // Define mappings between new and old categories
  const categoryMap = {
    'brandPositionAndPerception': 'interpersonalFit',
    'compensationAndBenefits': 'recognitionAndCompensation',
    'growthAndDevelopment': 'thrivingAtWork',
    'peopleAndCulture': 'experienceAndCompetency',
    'innovationAndProducts': 'purposeAndInvolvement'
  };
  
  // Use new categories as primary
  const newCategories = Object.keys(categoryMap);
  const totalPossible = newCategories.length * 20; // 5 categories * 20 points each
  
  // Function to safely get a category value from either old or new name
  const getCategoryValue = (newCategoryName: string): number => {
    const oldCategoryName = categoryMap[newCategoryName as keyof typeof categoryMap];
    
    // Try to get the value using the new category name first
    if (typeof company[newCategoryName as keyof CompanyData] === 'number') {
      return company[newCategoryName as keyof CompanyData] as number;
    }
    // Fall back to the old category name
    if (typeof company[oldCategoryName as keyof CompanyData] === 'number') {
      return company[oldCategoryName as keyof CompanyData] as number;
    }
    // Default to 0 if neither exists
    console.log(`Missing category value for ${newCategoryName}/${oldCategoryName} in company`, isUserCompany ? userName : compName);
    return 0;
  };
  
  const categoryValues = newCategories.map(category => {
    const value = getCategoryValue(category);
    return isNaN(value) ? 0 : value; // Ensure we don't add NaN values
  });
  
  console.log(`Category values for ${isUserCompany ? capitalizeText(userName) : capitalizeText(compName) || 'Unknown company'}:`, categoryValues);
  
  const totalScore = categoryValues.reduce((sum, value) => sum + value, 0);
  
  // Safety check to ensure we don't divide by zero
  const percentage = totalPossible > 0 ? (totalScore / totalPossible) * 100 : 0;
  
  // Determine letter grade based on percentage
  let grade = '';
  let gradeColor = '';
  
  if (percentage >= 90) {
    grade = 'A';
    gradeColor = '#22c55e'; // Green
  } else if (percentage >= 80) {
    grade = 'B';
    gradeColor = '#84cc16'; // Light green
  } else if (percentage >= 70) {
    grade = 'C';
    gradeColor = '#eab308'; // Yellow
  } else if (percentage >= 60) {
    grade = 'D';
    gradeColor = '#f97316'; // Orange
  } else {
    grade = 'F';
    gradeColor = '#ef4444'; // Red
  }
  
  // Log the final score calculation
  console.log(`Score for ${isUserCompany ? capitalizeText(userName) : capitalizeText(compName) || 'Unknown company'}: ${totalScore}/${totalPossible} = ${percentage.toFixed(2)}% (Grade: ${grade})`);
  
  return { score: totalScore, grade, gradeColor };
};

// Function to format headquarters by removing country
const formatHeadquarters = (headquarters: string | undefined | null): string => {
  if (!headquarters) return 'N/A';
  
  // Split by comma and take all but the last part (which is typically the country)
  const parts = headquarters.split(',');
  if (parts.length <= 1) return headquarters;
  
  return parts.slice(0, parts.length - 1).join(',').trim();
};

export default function ComparisonChart({
  userCompany,
  competitor,
  userCompanyName,
  competitorName,
}: ComparisonChartProps) {
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
  
  // Add debug logging
  console.log('Competitor data:', capitalizedCompetitorName, competitor);
  
  // Get old category values for a company
  const getDataForCategories = (company: CompanyData): number[] => {
    console.log(`Getting data for company: ${company === userCompany ? capitalizedUserCompanyName : capitalizedCompetitorName || 'Unknown company'}`);
    
    // If this is Google, handle specifically 
    if (competitorName.toLowerCase() === 'google' && company === competitor) {
      console.log('Special handling for Google data');
      
      // Check if Google data has new category names
      if (typeof competitor.brandPositionAndPerception === 'number') {
        console.log('Google data has new category names, using them directly');
        return [
          competitor.brandPositionAndPerception,
          competitor.compensationAndBenefits,
          competitor.growthAndDevelopment,
          competitor.peopleAndCulture,
          competitor.innovationAndProducts
        ];
      } else {
        // If not, return hardcoded values
        console.log('Google data missing new categories, using hardcoded values');
        return [19, 18, 19, 20, 19]; // Google's scores from googleData
      }
    }
    
    // Special handling for competitors to ensure we have valid data
    if (competitorName.toLowerCase() === 'walmart' || competitorName.toLowerCase() === 'hubspot' || 
        competitorName.toLowerCase() === 'google' || competitorName.toLowerCase() === 'nasdaq' || 
        competitorName.toLowerCase() === 'l\'oreal' || competitorName.toLowerCase() === 'loreal' || 
        competitorName.toLowerCase() === 'l oreal' || competitorName.toLowerCase() === 'mastercard') {
      
      console.log(`${capitalizedCompetitorName} company data keys:`, Object.keys(company));
      
      // If company data is missing new categories, log a warning and use hardcoded values
      if (!Object.keys(company).includes('brandPositionAndPerception')) {
        console.warn(`${capitalizedCompetitorName} data missing new category names - falling back to defined values`);
        
        // Return defined values directly if needed for known competitors
        if (company === competitor) {
          if (competitorName.toLowerCase() === 'walmart') {
            return [16, 15, 17, 16, 16]; // Values from walmartData
          } else if (competitorName.toLowerCase() === 'hubspot') {
            return [19, 18, 18, 19, 19]; // Values from hubspotData
          } else if (competitorName.toLowerCase() === 'google') {
            return [19, 18, 19, 20, 19]; // Values from googleData
          } else if (competitorName.toLowerCase() === 'nasdaq') {
            return [18, 19, 19, 19, 18]; // Values from nasdaqData
          } else if (competitorName.toLowerCase() === 'l\'oreal' || competitorName.toLowerCase() === 'loreal' || competitorName.toLowerCase() === 'l oreal') {
            return [19, 17, 18, 18, 19]; // Values from lorealData
          } else if (competitorName.toLowerCase() === 'mastercard') {
            return [19, 19, 18, 19, 18]; // Values from mastercardData
          }
        }
      }
      
      // Print current value of each category to help debug
      for (const key of Object.keys(company)) {
        console.log(`${capitalizedCompetitorName} ${key}:`, (company as any)[key]);
      }
    }
    
    // Map between new and old category names
    const categoryMap = {
      'brandPositionAndPerception': 'interpersonalFit',
      'compensationAndBenefits': 'recognitionAndCompensation',
      'growthAndDevelopment': 'thrivingAtWork',
      'peopleAndCulture': 'experienceAndCompetency',
      'innovationAndProducts': 'purposeAndInvolvement'
    };
    
    // Function to safely get a category value from either old or new name
    const getCategoryValue = (newCategoryName: string, oldCategoryName: string): number => {
      // Try to get the value using the new category name first
      if (typeof company[newCategoryName as keyof CompanyData] === 'number') {
        const value = company[newCategoryName as keyof CompanyData] as number;
        console.log(`Using new category ${newCategoryName}: ${value}`);
        return value;
      }
      // Fall back to the old category name
      if (typeof company[oldCategoryName as keyof CompanyData] === 'number') {
        const value = company[oldCategoryName as keyof CompanyData] as number;
        console.log(`Using old category ${oldCategoryName}: ${value}`);
        return value;
      }
      
      // Special case for Google
      if (competitorName.toLowerCase() === 'google' && company === competitor) {
        const values = {
          'brandPositionAndPerception': 19,
          'compensationAndBenefits': 18,
          'growthAndDevelopment': 19,
          'peopleAndCulture': 20,
          'innovationAndProducts': 19
        };
        console.log(`Using hardcoded Google value for ${newCategoryName}: ${values[newCategoryName as keyof typeof values]}`);
        return values[newCategoryName as keyof typeof values] || 0;
      }
      
      // Default to 0 if neither exists
      console.log(`Missing value for both ${newCategoryName} and ${oldCategoryName}`);
      return 0;
    };
    
    // Ensure we always have valid numbers for the chart
    const values = [
      getCategoryValue('brandPositionAndPerception', 'interpersonalFit'),
      getCategoryValue('compensationAndBenefits', 'recognitionAndCompensation'),
      getCategoryValue('growthAndDevelopment', 'thrivingAtWork'),
      getCategoryValue('peopleAndCulture', 'experienceAndCompetency'),
      getCategoryValue('innovationAndProducts', 'purposeAndInvolvement')
    ];
    
    console.log(`Final category values:`, values);
    return values;
  };

  // Calculate total scores and grades
  const userScore = calculateTotalScore(userCompany, true, userCompanyName, competitorName);
  const competitorScore = calculateTotalScore(competitor, false, userCompanyName, competitorName);
  
  // Use the company's primary color or default to the original colors
  const userCompanyColor = userCompany.primaryColor || '#2F3295';
  const competitorColor = competitor.primaryColor || '#FE619E';
  
  // Debug check for competitor data issues
  useEffect(() => {
    // Only add this logging in development
    console.log('User company:', userCompany);
    console.log('Competitor:', competitor);
    console.log('User score:', userScore);
    console.log('Competitor score:', competitorScore);
    
    // If we have a competitor without any category data, we might need to manually load from competitorData
    if (competitorName.toLowerCase() === 'walmart' && 
        typeof competitor.brandPositionAndPerception !== 'number' && 
        !Object.keys(competitor).some(key => ['brandPositionAndPerception', 'compensationAndBenefits', 'growthAndDevelopment', 'peopleAndCulture', 'innovationAndProducts'].includes(key))) {
      console.warn('Walmart data missing categories - check data source');
    }
  }, [competitor, competitorName, userCompany, userScore, competitorScore]);
  
  // Create gradient for user company
  const userGradient = {
    id: 'userGradient',
    beforeDatasetDraw(chart: any, args: any) {
      const {ctx, data, chartArea: {top, bottom, left, right}} = chart;
      const gradientBg = ctx.createLinearGradient(0, 0, 0, bottom);
      gradientBg.addColorStop(0, `${userCompanyColor}CC`); // Add some transparency
      gradientBg.addColorStop(1, `${userCompanyColor}66`);
      
      // Apply this gradient to the first dataset
      if (data.datasets[0] && args.index === 0) {
        data.datasets[0].backgroundColor = gradientBg;
      }
    }
  };
  
  // Create gradient for competitor
  const competitorGradient = {
    id: 'competitorGradient',
    beforeDatasetDraw(chart: any, args: any) {
      const {ctx, data, chartArea: {top, bottom, left, right}} = chart;
      const gradientBg = ctx.createLinearGradient(0, 0, 0, bottom);
      gradientBg.addColorStop(0, `${competitorColor}CC`); // Add some transparency
      gradientBg.addColorStop(1, `${competitorColor}66`);
      
      // Apply this gradient to the second dataset
      if (data.datasets[1] && args.index === 1) {
        data.datasets[1].backgroundColor = gradientBg;
      }
    }
  };
  
  const options = {
    responsive: true,
    maintainAspectRatio: true,
    barPercentage: 0.6,
    categoryPercentage: 0.7,
    scales: {
      y: {
        beginAtZero: true,
        max: 20,
        ticks: {
          stepSize: 5,
          color: '#64748b', // Slate color for a more modern look
          font: {
            family: "'Montserrat', sans-serif",
            size: 11
          }
        },
        grid: {
          color: 'rgba(226, 232, 240, 0.6)',
          drawBorder: false
        }
      },
      x: {
        ticks: {
          color: '#64748b',
          font: {
            family: "'Montserrat', sans-serif",
            size: 11
          }
        },
        grid: {
          display: false,
          drawBorder: false
        }
      },
    },
    plugins: {
      legend: {
        position: 'top' as const,
        align: 'end' as const,
        labels: {
          color: '#334155',
          usePointStyle: true,
          pointStyleWidth: 10,
          boxWidth: 10,
          padding: 20,
          font: {
            family: "'Montserrat', sans-serif",
            size: 12,
            weight: 600
          }
        }
      },
      title: {
        display: true,
        text: 'Workbrand Score Comparison™',
        padding: {
          top: 10,
          bottom: 20
        },
        font: {
          family: "'Montserrat', sans-serif",
          size: 16,
          weight: 600
        },
        color: '#0f172a',
      },
      tooltip: {
        titleColor: '#FFFFFF',
        bodyColor: '#FFFFFF',
        backgroundColor: 'rgba(15, 23, 42, 0.8)',
        padding: 12,
        cornerRadius: 8,
        displayColors: true,
        usePointStyle: true,
        boxPadding: 6,
        callbacks: {
          label: function(context: any) {
            const label = context.dataset.label || '';
            const value = context.parsed.y;
            return `${label}: ${value}/20`;
          }
        }
      },
    },
  };

  // Set up data for Chart.js
  const data = {
    // Always use the new category labels for display
    labels: [
      'Brand Position & Perception',
      'Compensation & Benefits',
      'Growth & Development',
      'People & Culture',
      'Innovation & Products'
    ],
    datasets: [
      {
        label: capitalizedUserCompanyName,
        data: getDataForCategories(userCompany).map(value => !isNaN(value) ? value : 0),
        backgroundColor: userCompanyColor,
        borderColor: 'transparent',
        borderRadius: 6,
        borderWidth: 0,
        hoverBackgroundColor: `${userCompanyColor}DD`,
      },
      {
        label: capitalizedCompetitorName,
        data: getDataForCategories(competitor).map(value => !isNaN(value) ? value : 0),
        backgroundColor: competitorColor,
        borderColor: 'transparent',
        borderRadius: 6,
        borderWidth: 0,
        hoverBackgroundColor: `${competitorColor}DD`,
      },
    ],
  };

  return (
    <div className="glass rounded-xl shadow-lg p-6 backdrop-blur-md">
      {/* Score Cards Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* User Company Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden">
          <div className="h-1.5" style={{ backgroundColor: userCompanyColor }}></div>
          <div className="p-5">
            <div className="flex flex-wrap items-center justify-between mb-3">
              <h3 className="text-lg font-semibold flex items-center" style={{ color: userCompanyColor }}>
                {capitalizedUserCompanyName}
                {userCompany.stockTicker && (
                  <span className="ml-2 text-xs font-medium text-gray-500">
                    ({userCompany.stockTicker} ${userCompany.stockPrice?.toFixed(2) || ''})
                  </span>
                )}
              </h3>
              
              <div className="flex items-center">
                <div className="flex flex-col items-end mr-3">
                  <span className="text-2xl font-bold" style={{ color: userCompanyColor }}>{userScore.score}</span>
                  <span className="text-xs" style={{ color: userCompanyColor }}>SCORE</span>
                </div>
                
                <div className="px-3 py-1.5 rounded-lg flex items-center justify-center" 
                  style={{ 
                    backgroundColor: `${userScore.gradeColor}15`, 
                    borderLeft: `4px solid ${userScore.gradeColor}`
                  }}>
                  <span className="font-bold text-lg" style={{ color: userScore.gradeColor }}>
                    {userScore.grade}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Company Info in Two Columns */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              {/* Left Column */}
              <div className="space-y-2">
                <div className="flex items-center text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                    <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                  </svg>
                  <span className="text-sm">{userCompany.numEmployees.toLocaleString()} Employees</span>
                </div>
                
                <div className="flex items-center text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-amber-500 mr-1">
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{userCompany.glassdoorScore.toFixed(1)} Avg. Rating</span>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-2">
                <div className="flex items-center text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                    <path d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{formatHeadquarters(userCompany.headquarters)}</span>
                </div>
                
                <div className="flex items-center text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1 text-blue-600">
                    <path d="M12.225 12.225h-1.778V9.44c0-.664-.012-1.519-.925-1.519-.926 0-1.068.724-1.068 1.47v2.834H6.676V6.498h1.707v.783h.024c.348-.594.996-.95 1.684-.925 1.802 0 2.135 1.185 2.135 2.728l-.001 3.14zM4.67 5.715a1.037 1.037 0 01-1.032-1.031c0-.566.466-1.032 1.032-1.032.566 0 1.031.466 1.032 1.032 0 .566-.466 1.032-1.032 1.032zm.889 6.51h-1.78V6.498h1.78v5.727zM13.11 2H2.885A.88.88 0 002 2.866v10.268a.88.88 0 00.885.866h10.226a.882.882 0 00.889-.866V2.865a.88.88 0 00-.889-.864z" />
                  </svg>
                  <span className="text-sm">{userCompany.linkedinFollowers?.toLocaleString() || 'N/A'} Followers</span>
                </div>
              </div>
            </div>
            
            {/* Top 3 Words Section */}
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-black mb-2">Employer Brand Keywords</p>
              <div className="flex flex-wrap gap-2">
                {userCompany.top3Words && userCompany.top3Words.map((word, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 rounded-full text-white text-xs font-medium"
                    style={{ 
                      background: `linear-gradient(135deg, ${userCompanyColor}, ${userCompanyColor}99)`,
                      boxShadow: `0 2px 4px ${userCompanyColor}40`
                    }}
                  >
                    {capitalizeText(word)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Competitor Card */}
        <div className="bg-white/70 backdrop-blur-sm rounded-xl shadow-sm overflow-hidden">
          <div className="h-1.5" style={{ backgroundColor: competitorColor }}></div>
          <div className="p-5">
            <div className="flex flex-wrap items-center justify-between mb-3">
              <h3 className="text-lg font-semibold flex items-center" style={{ color: competitorColor }}>
                {capitalizedCompetitorName}
                {competitor.stockTicker && (
                  <span className="ml-2 text-xs font-medium text-gray-500">
                    ({competitor.stockTicker} ${competitor.stockPrice?.toFixed(2) || ''})
                  </span>
                )}
              </h3>
              
              <div className="flex items-center">
                <div className="flex flex-col items-end mr-3">
                  <span className="text-2xl font-bold" style={{ color: competitorColor }}>{competitorScore.score}</span>
                  <span className="text-xs" style={{ color: competitorColor }}>SCORE</span>
                </div>
                
                <div className="px-3 py-1.5 rounded-lg flex items-center justify-center" 
                  style={{ 
                    backgroundColor: `${competitorScore.gradeColor}15`, 
                    borderLeft: `4px solid ${competitorScore.gradeColor}`
                  }}>
                  <span className="font-bold text-lg" style={{ color: competitorScore.gradeColor }}>
                    {competitorScore.grade}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Company Info in Two Columns */}
            <div className="mt-3 grid grid-cols-2 gap-3">
              {/* Left Column */}
              <div className="space-y-2">
                <div className="flex items-center text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                    <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.122zM17.25 19.128l-.001.144a2.25 2.25 0 01-.233.96 10.088 10.088 0 005.06-1.01.75.75 0 00.42-.643 4.875 4.875 0 00-6.957-4.611 8.586 8.586 0 011.71 5.157v.003z" />
                  </svg>
                  <span className="text-sm">{competitor.numEmployees.toLocaleString()} Employees</span>
                </div>
                
                <div className="flex items-center text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-amber-500 mr-1">
                    <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{competitor.glassdoorScore.toFixed(1)} Avg. Rating</span>
                </div>
              </div>
              
              {/* Right Column */}
              <div className="space-y-2">
                <div className="flex items-center text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1">
                    <path d="M11.54 22.351l.07.04.028.016a.76.76 0 00.723 0l.028-.015.071-.041a16.975 16.975 0 001.144-.742 19.58 19.58 0 002.683-2.282c1.944-1.99 3.963-4.98 3.963-8.827a8.25 8.25 0 00-16.5 0c0 3.846 2.02 6.837 3.963 8.827a19.58 19.58 0 002.682 2.282 16.975 16.975 0 001.145.742zM12 13.5a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm">{formatHeadquarters(competitor.headquarters)}</span>
                </div>
                
                <div className="flex items-center text-black">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1 text-blue-600">
                    <path d="M12.225 12.225h-1.778V9.44c0-.664-.012-1.519-.925-1.519-.926 0-1.068.724-1.068 1.47v2.834H6.676V6.498h1.707v.783h.024c.348-.594.996-.95 1.684-.925 1.802 0 2.135 1.185 2.135 2.728l-.001 3.14zM4.67 5.715a1.037 1.037 0 01-1.032-1.031c0-.566.466-1.032 1.032-1.032.566 0 1.031.466 1.032 1.032 0 .566-.466 1.032-1.032 1.032zm.889 6.51h-1.78V6.498h1.78v5.727zM13.11 2H2.885A.88.88 0 002 2.866v10.268a.88.88 0 00.885.866h10.226a.882.882 0 00.889-.866V2.865a.88.88 0 00-.889-.864z" />
                  </svg>
                  <span className="text-sm">{competitor.linkedinFollowers?.toLocaleString() || 'N/A'} Followers</span>
                </div>
              </div>
            </div>
            
            {/* Top 3 Words Section */}
            <div className="mt-4">
              <p className="text-xs uppercase tracking-wide text-black mb-2">Employer Brand Keywords</p>
              <div className="flex flex-wrap gap-2">
                {competitor.top3Words && competitor.top3Words.map((word, index) => (
                  <span 
                    key={index} 
                    className="px-3 py-1 rounded-full text-white text-xs font-medium"
                    style={{ 
                      background: `linear-gradient(135deg, ${competitorColor}, ${competitorColor}99)`,
                      boxShadow: `0 2px 4px ${competitorColor}40`
                    }}
                  >
                    {capitalizeText(word)}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-5 mb-8">
        <Bar options={options} data={data} plugins={[userGradient, competitorGradient]} />
      </div>
      
      {/* Comparison Table */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-sm p-5">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr>
                <th className="py-3 px-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: userCompanyColor }}>{capitalizedUserCompanyName}</th>
                <th className="py-3 px-4 text-left text-xs font-medium uppercase tracking-wider" style={{ color: competitorColor }}>{capitalizedCompetitorName}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {/* Create a mapping between old and new categories for display */}
              {[
                { newCategory: 'brandPositionAndPerception', oldCategory: 'interpersonalFit', label: 'Brand Position & Perception' },
                { newCategory: 'compensationAndBenefits', oldCategory: 'recognitionAndCompensation', label: 'Compensation & Benefits' },
                { newCategory: 'growthAndDevelopment', oldCategory: 'thrivingAtWork', label: 'Growth & Development' },
                { newCategory: 'peopleAndCulture', oldCategory: 'experienceAndCompetency', label: 'People & Culture' },
                { newCategory: 'innovationAndProducts', oldCategory: 'purposeAndInvolvement', label: 'Innovation & Products' }
              ].map((item, index) => {
                // Function to safely get a category value from either old or new name
                const getCategoryValue = (newCategoryName: string, company: CompanyData | null | undefined, defaultValue: number = 0): number => {
                  if (!company) return defaultValue;
                  
                  const categoryMap = {
                    'brandPositionAndPerception': 'interpersonalFit',
                    'compensationAndBenefits': 'recognitionAndCompensation',
                    'growthAndDevelopment': 'thrivingAtWork',
                    'peopleAndCulture': 'experienceAndCompetency',
                    'innovationAndProducts': 'purposeAndInvolvement'
                  };
                  const oldCategoryName = categoryMap[newCategoryName as keyof typeof categoryMap];
                  
                  // Try to get the value using the new category name first
                  if (typeof company[newCategoryName as keyof CompanyData] === 'number') {
                    return company[newCategoryName as keyof CompanyData] as number;
                  }
                  // Fall back to the old category name
                  if (typeof company[oldCategoryName as keyof CompanyData] === 'number') {
                    return company[oldCategoryName as keyof CompanyData] as number;
                  }
                  // Default to provided default value if neither exists
                  return defaultValue;
                };
                
                // Get values using the helper function
                const userValue = getCategoryValue(item.newCategory, userCompany, 0);
                const competitorValue = getCategoryValue(item.newCategory, competitor, 0);
                
                return (
                  <tr key={item.newCategory} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                    <td className="py-3 px-4 text-sm font-medium text-black">{item.label}</td>
                    <td className="py-3 px-4 text-sm text-black">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200/70 rounded-full h-2.5 mr-3 overflow-hidden">
                          <div
                            className="h-2.5 rounded-full"
                            style={{ 
                              width: `${Math.max(((userValue / 20) * 100), 0.5)}%`,
                              minWidth: '2px',
                              background: `linear-gradient(90deg, ${userCompanyColor}99, ${userCompanyColor})`,
                              boxShadow: '0 0 4px rgba(0, 0, 0, 0.2)'
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium" style={{ color: userCompanyColor }}>{userValue || 0}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-sm text-black">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200/70 rounded-full h-2.5 mr-3 overflow-hidden">
                          <div
                            className="h-2.5 rounded-full"
                            style={{ 
                              width: `${Math.max(((competitorValue / 20) * 100), 0.5)}%`,
                              minWidth: '2px',
                              background: `linear-gradient(90deg, ${competitorColor}99, ${competitorColor})`,
                              boxShadow: '0 0 4px rgba(0, 0, 0, 0.2)'
                            }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium" style={{ color: competitorColor }}>{competitorValue || 0}</span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              
              <tr className="bg-white">
                <td className="py-3 px-4 text-sm text-black">Avg. Rating</td>
                <td className="py-3 px-4 text-sm text-black">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-amber-500 mr-1">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                    <span>{userCompany.glassdoorScore.toFixed(1)}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm text-black">
                  <div className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-amber-500 mr-1">
                      <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                    </svg>
                    <span>{competitor.glassdoorScore.toFixed(1)}</span>
                  </div>
                </td>
              </tr>
              
              <tr className="bg-gray-50/50">
                <td className="py-3 px-4 text-sm text-black">Number of Employees</td>
                <td className="py-3 px-4 text-sm text-black">{userCompany.numEmployees.toLocaleString()}</td>
                <td className="py-3 px-4 text-sm text-black">{competitor.numEmployees.toLocaleString()}</td>
              </tr>
              
              <tr className="bg-white">
                <td className="py-3 px-4 text-sm text-black">LinkedIn Followers</td>
                <td className="py-3 px-4 text-sm text-black">{userCompany.linkedinFollowers?.toLocaleString() || 'N/A'}</td>
                <td className="py-3 px-4 text-sm text-black">{competitor.linkedinFollowers?.toLocaleString() || 'N/A'}</td>
              </tr>
              
              <tr className="bg-gray-50/50">
                <td className="py-3 px-4 text-sm text-black">Headquarters</td>
                <td className="py-3 px-4 text-sm text-black">{formatHeadquarters(userCompany.headquarters)}</td>
                <td className="py-3 px-4 text-sm text-black">{formatHeadquarters(competitor.headquarters)}</td>
              </tr>
              
              <tr className="bg-white">
                <td className="py-3 px-4 text-sm text-black">Stock Information</td>
                <td className="py-3 px-4 text-sm text-black">
                  {userCompany.stockTicker ? `${userCompany.stockTicker} $${userCompany.stockPrice?.toFixed(2) || ''}` : 'N/A'}
                </td>
                <td className="py-3 px-4 text-sm text-black">
                  {competitor.stockTicker ? `${competitor.stockTicker} $${competitor.stockPrice?.toFixed(2) || ''}` : 'N/A'}
                </td>
              </tr>
              
              <tr className="bg-gray-50/80">
                <td className="py-3 px-4 text-sm font-medium text-black">Total Workbrand Score</td>
                <td className="py-3 px-4 text-sm font-medium">
                  <div className="flex items-center">
                    <span style={{ color: userCompanyColor }}>{userScore.score}/100</span>
                    <span className="ml-2 px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: `${userScore.gradeColor}20`, color: userScore.gradeColor }}>
                      Grade: {userScore.grade}
                    </span>
                  </div>
                </td>
                <td className="py-3 px-4 text-sm font-medium">
                  <div className="flex items-center">
                    <span style={{ color: competitorColor }}>{competitorScore.score}/100</span>
                    <span className="ml-2 px-2 py-0.5 rounded text-xs font-bold" style={{ backgroundColor: `${competitorScore.gradeColor}20`, color: competitorScore.gradeColor }}>
                      Grade: {competitorScore.grade}
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 