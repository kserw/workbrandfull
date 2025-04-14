/**
 * Formatting utilities for consistent text display throughout the application
 */

/**
 * Properly capitalizes text (first letter of each word)
 * Handles special cases like acronyms and company names with specific capitalizations
 * 
 * @param text The text to capitalize
 * @returns The capitalized text
 */
export function capitalizeText(text: string): string {
  if (!text) return '';
  
  // Handle special cases of known company names/acronyms
  const specialCases: Record<string, string> = {
    'hubspot': 'HubSpot',
    'linkedin': 'LinkedIn',
    'loreal': 'L\'Oreal',
    'l\'oreal': 'L\'Oreal',
    'l oreal': 'L\'Oreal',
    'nasdaq': 'Nasdaq',
    'google': 'Google',
    'walmart': 'Walmart',
    'mastercard': 'Mastercard',
    'evp': 'EVP',
    'ai': 'AI',
    'vr': 'VR',
    'ar': 'AR',
    'hr': 'HR',
    'ui': 'UI',
    'ux': 'UX',
    'ceo': 'CEO',
    'cfo': 'CFO',
    'cto': 'CTO',
    'saas': 'SaaS',
    'b2b': 'B2B',
    'b2c': 'B2C',
  };
  
  // Check if the entire text is a special case
  const lowerText = text.toLowerCase();
  if (specialCases[lowerText]) {
    return specialCases[lowerText];
  }
  
  // Otherwise, capitalize first letter of each word
  return text
    .split(' ')
    .map(word => {
      // Check if this word is a special case
      const lowerWord = word.toLowerCase();
      if (specialCases[lowerWord]) {
        return specialCases[lowerWord];
      }
      
      // Otherwise, capitalize first letter
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
} 