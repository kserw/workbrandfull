import fs from 'fs';
import path from 'path';
import { CompanyData, StoredCompanyData } from '@/types';

// Path to our "database" file
const DB_PATH = path.join(process.cwd(), 'company-data.json');

// Initialize the database file if it doesn't exist
const initDatabase = (): void => {
  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(DB_PATH, JSON.stringify({}, null, 2), 'utf8');
  }
};

// Get all companies from the database
export const getAllCompanies = (): Record<string, StoredCompanyData> => {
  try {
    initDatabase();
    const data = fs.readFileSync(DB_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading company database:', error);
    return {};
  }
};

// Get a specific company from the database
export const getCompany = (companyName: string): CompanyData | null => {
  try {
    const companies = getAllCompanies();
    const normalizedName = companyName.trim().toLowerCase();
    return companies[normalizedName] || null;
  } catch (error) {
    console.error(`Error getting company ${companyName}:`, error);
    return null;
  }
};

// Save a company to the database
export const saveCompany = (companyName: string, data: CompanyData, email?: string): void => {
  try {
    const companies = getAllCompanies();
    const normalizedName = companyName.trim().toLowerCase();
    
    // Store the company data with the email and timestamp
    companies[normalizedName] = {
      ...data,
      email: email || companies[normalizedName]?.email,
      timestamp: new Date().toISOString()
    };
    
    fs.writeFileSync(DB_PATH, JSON.stringify(companies, null, 2), 'utf8');
  } catch (error) {
    console.error(`Error saving company ${companyName}:`, error);
  }
}; 