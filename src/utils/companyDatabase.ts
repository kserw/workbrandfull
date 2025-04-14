import { CompanyData, StoredCompanyData } from '@/types';

// In-memory database
let inMemoryDb: Record<string, StoredCompanyData> = {};

// Initialize with any existing data if in development
if (process.env.NODE_ENV === 'development') {
  try {
    const fs = require('fs');
    const path = require('path');
    const DB_PATH = path.join(process.cwd(), 'company-data.json');
    
    if (fs.existsSync(DB_PATH)) {
      const data = fs.readFileSync(DB_PATH, 'utf8');
      inMemoryDb = JSON.parse(data);
    }
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}

// Get all companies from the database
export const getAllCompanies = (): Record<string, StoredCompanyData> => {
  return inMemoryDb;
};

// Get a specific company from the database
export const getCompany = (companyName: string): CompanyData | null => {
  try {
    const normalizedName = companyName.trim().toLowerCase();
    return inMemoryDb[normalizedName] || null;
  } catch (error) {
    console.error(`Error getting company ${companyName}:`, error);
    return null;
  }
};

// Save a company to the database
export const saveCompany = (companyName: string, data: CompanyData, email?: string): void => {
  try {
    const normalizedName = companyName.trim().toLowerCase();
    
    // Store the company data with the email and timestamp
    inMemoryDb[normalizedName] = {
      ...data,
      email: email || inMemoryDb[normalizedName]?.email,
      timestamp: new Date().toISOString()
    };

    // Only write to file in development
    if (process.env.NODE_ENV === 'development') {
      const fs = require('fs');
      const path = require('path');
      const DB_PATH = path.join(process.cwd(), 'company-data.json');
      fs.writeFileSync(DB_PATH, JSON.stringify(inMemoryDb, null, 2), 'utf8');
    }
  } catch (error) {
    console.error(`Error saving company ${companyName}:`, error);
    // Don't throw the error in production
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
  }
}; 