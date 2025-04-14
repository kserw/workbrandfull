import { NextRequest, NextResponse } from 'next/server';
import { analyzeCompany } from '@/utils/openai';
import { googleData, walmartData, hubspotData, nasdaqData, lorealData, mastercardData } from '@/utils/competitorData';
import { getCompany, saveCompany } from '@/utils/companyDatabase';
import { CompanyData } from '@/types';

// Helper function to add a delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Log environment check
console.log("API Key available:", process.env.OPENAI_API_KEY ? "Yes" : "No");

export async function POST(request: NextRequest) {
  try {
    const { companyName, competitorName, email } = await request.json();

    if (!companyName || !competitorName) {
      return NextResponse.json(
        { error: 'Company name and competitor name are required' },
        { status: 400 }
      );
    }

    // Log that we're processing a request
    console.log(`Processing request for company: ${companyName}, competitor: ${competitorName}`);

    // Helper function to verify competitor data has required fields
    const verifyCompanyData = (data: CompanyData | null, name: string): CompanyData | null => {
      if (!data) {
        console.error(`ERROR: ${name} data is null`);
        return null;
      }
      
      const requiredFields = [
        'brandPositionAndPerception', 'compensationAndBenefits', 
        'growthAndDevelopment', 'peopleAndCulture', 'innovationAndProducts',
        'evpStatement', 'glassdoorScore', 'top3Words', 'subcategories', 'analysis'
      ];
      
      const missingFields = requiredFields.filter(field => {
        if (field === 'subcategories' || field === 'analysis') {
          return !data[field as keyof CompanyData];
        }
        return typeof data[field as keyof CompanyData] === 'undefined';
      });
      
      if (missingFields.length > 0) {
        console.warn(`WARNING: ${name} data is missing the following fields:`, missingFields);
        
        // Log what we do have in the data object to help debugging
        console.log(`${name} data available fields:`, Object.keys(data));
        
        // For critical fields, return null
        if (missingFields.includes('subcategories') || missingFields.includes('analysis')) {
          console.error(`ERROR: ${name} data is missing critical fields required for rendering`);
          return null;
        }
      } else {
        console.log(`${name} data verified: All required fields present`);
      }
      
      return data;
    };

    // Normalize competitor name for case-insensitive matching
    const normalizedCompetitorName = competitorName.trim().toLowerCase();
    
    // Get the competitor data (either from predefined data or via API)
    let competitor: CompanyData | null;
    
    // Check if the competitor is one of our predefined competitors
    if (normalizedCompetitorName === 'google') {
      competitor = googleData;
    } else if (normalizedCompetitorName === 'walmart') {
      competitor = walmartData;
    } else if (normalizedCompetitorName === 'hubspot') {
      competitor = hubspotData;
    } else if (normalizedCompetitorName === 'nasdaq') {
      competitor = nasdaqData;
    } else if (normalizedCompetitorName === 'loreal' || normalizedCompetitorName === 'l\'oreal' || normalizedCompetitorName === 'l oreal') {
      competitor = lorealData;
    } else if (normalizedCompetitorName === 'mastercard') {
      competitor = mastercardData;
    } else {
      // Check if we already have this competitor in our database
      competitor = getCompany(competitorName);
      
      if (!competitor) {
        // If not in database, analyze using OpenAI
        console.log(`Analyzing new competitor: ${competitorName}`);
        competitor = await analyzeCompany(competitorName);
        
        // Check if we got a valid response from the OpenAI analysis
        if (!competitor) {
          console.error(`Failed to analyze competitor: ${competitorName}. OpenAI API may have returned an invalid response.`);
          return NextResponse.json(
            { error: `We couldn't analyze "${competitorName}" at this time. Please try again later or choose a different competitor.` },
            { status: 500 }
          );
        }
        
        // Save the new competitor data to our database for future use
        saveCompany(competitorName, competitor);
        console.log(`Saved competitor data for: ${competitorName}`);
      } else {
        console.log(`Found competitor data in database for: ${competitorName}`);
      }
    }

    // Verify the competitor data has the required fields
    competitor = verifyCompanyData(competitor, competitorName);
    
    if (!competitor) {
      console.error(`Failed to verify competitor data for: ${competitorName}`);
      return NextResponse.json(
        { error: `We couldn't process data for "${competitorName}". Please try a different competitor.` },
        { status: 500 }
      );
    }

    // Check if we already have this company in our database
    let userCompanyData = getCompany(companyName);
    let fromDatabase = false;
    
    if (userCompanyData) {
      // If found in database, mark it as from database
      fromDatabase = true;
      console.log(`Found company data in database for: ${companyName}`);
    } else {
      // If not in database, analyze using OpenAI
      console.log(`Analyzing new company: ${companyName}`);
      userCompanyData = await analyzeCompany(companyName);
      
      if (!userCompanyData) {
        console.error(`Failed to analyze company: ${companyName}`);
        return NextResponse.json(
          { error: `We couldn't analyze "${companyName}" at this time. Please try again later.` },
          { status: 500 }
        );
      }
      
      try {
        // Save the new company data to our in-memory database
        saveCompany(companyName, userCompanyData, email);
        console.log(`Saved company data for: ${companyName}`);
      } catch (error) {
        // Log the error but continue since we have the data in memory
        console.error(`Error saving company data: ${error}`);
      }
    }

    // Verify the user company data has required fields
    userCompanyData = verifyCompanyData(userCompanyData, companyName);
    
    if (!userCompanyData) {
      console.error(`Failed to verify company data for: ${companyName}`);
      return NextResponse.json(
        { error: `We couldn't process data for "${companyName}". Please try again.` },
        { status: 500 }
      );
    }

    // Add a delay of 2 seconds if the data was from the database
    // to show the loading screen for a better user experience
    if (fromDatabase) {
      await delay(2000);
    }

    console.log(`Successfully processed request for: ${companyName}`);
    return NextResponse.json({
      userCompany: userCompanyData,
      competitor,
      competitorName,
      fromDatabase: fromDatabase
    });
  } catch (error) {
    console.error('Error in analyze route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again later.' },
      { status: 500 }
    );
  }
} 