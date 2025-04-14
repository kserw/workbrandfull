const fs = require('fs');
const path = require('path');
const DB_PATH = path.join(process.cwd(), 'company-data.json');

// List of built-in companies to preserve (case insensitive)
const preserveCompanies = ['google', 'walmart', 'hubspot', 'nasdaq', 'loreal', 'mastercard'];

try {
  // Check if database file exists
  if (fs.existsSync(DB_PATH)) {
    // Read the current database
    const data = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
    console.log('Current database has', Object.keys(data).length, 'companies');
    
    // Filter out any companies not in our preserve list
    const preservedData = {};
    Object.keys(data).forEach(company => {
      const companyLower = company.toLowerCase();
      if (preserveCompanies.includes(companyLower)) {
        preservedData[company] = data[company];
      }
    });
    
    // Write back only the preserved companies
    fs.writeFileSync(DB_PATH, JSON.stringify(preservedData, null, 2), 'utf8');
    console.log('Database cleaned. Now has', Object.keys(preservedData).length, 'companies');
    console.log('Preserved companies:', Object.keys(preservedData));
    
    // Companies that were removed
    const removedCompanies = Object.keys(data).filter(company => 
      !preserveCompanies.includes(company.toLowerCase())
    );
    console.log('Removed companies:', removedCompanies);
  } else {
    console.log('Database file does not exist. Nothing to clean.');
  }
} catch (e) {
  console.error('Error cleaning database:', e);
  process.exit(1);
} 