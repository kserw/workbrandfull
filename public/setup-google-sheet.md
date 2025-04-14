# Google Sheets Integration Setup Guide

This guide will help you set up the Google Sheets integration for storing form submissions from the WorkBrand Comparison Tool.

## Step 1: Create a Google Sheet

1. Go to [Google Sheets](https://sheets.google.com) and create a new spreadsheet
2. Rename the spreadsheet to "WorkBrand Form Submissions" (or any name you prefer)
3. Set up the header row with the following columns:
   - Timestamp
   - Company Name
   - Email
   - Industry
   - EVP Statement
   - Raw Data (optional)

## Step 2: Set Up Google Apps Script

1. Open your Google Sheet
2. Click on **Extensions** > **Apps Script**
3. Replace the default code with the following script:

```javascript
// Function to handle POST requests
function doPost(e) {
  try {
    // Parse the incoming data
    const data = JSON.parse(e.postData.contents);
    
    // Log the received data for debugging
    console.log("Received data:", JSON.stringify(data));
    
    // Get the active sheet
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    
    // Format the data for insertion
    const timestamp = new Date().toISOString();
    const companyName = data.companyName || "Unknown";
    const email = data.email || "";
    const industry = data.industry || "";
    const evpStatement = data.evpStatement || "";
    
    // Optional: Convert the full data object to a string for storage
    const rawData = JSON.stringify(data);
    
    // Append the data to the sheet
    sheet.appendRow([
      timestamp,
      companyName,
      email,
      industry,
      evpStatement,
      rawData
    ]);
    
    // Return success response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        result: "success", 
        message: "Data successfully recorded" 
      }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch (error) {
    // Log the error
    console.error("Error processing request:", error);
    
    // Return error response
    return ContentService
      .createTextOutput(JSON.stringify({ 
        result: "error", 
        message: error.toString() 
      }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Test function to verify the script works
function testDoPost() {
  const mockData = {
    postData: {
      contents: JSON.stringify({
        companyName: "Test Company",
        email: "test@example.com",
        industry: "Technology",
        evpStatement: "This is a test EVP statement."
      })
    }
  };
  
  const result = doPost(mockData);
  Logger.log(result.getContent());
}
```

4. Click **Save** and name your project (e.g., "WorkBrand Form Handler")

## Step 3: Deploy as Web App

1. Click on **Deploy** > **New deployment**
2. Select **Web app** as the deployment type
3. Configure the deployment:
   - Description: "WorkBrand Form Handler"
   - Execute as: "Me" (your Google account)
   - Who has access: "Anyone" 
4. Click **Deploy**
5. Copy the Web app URL provided (it will look like `https://script.google.com/macros/s/...`)

## Step 4: Update Environment Variables

1. Open your application's deployment environment (e.g., Vercel)
2. Add the following environment variable:
   - Key: `GOOGLE_SHEET_WEBHOOK_URL`
   - Value: The Web app URL you copied in the previous step
3. Save the changes and redeploy your application

## Step 5: Test the Integration

1. Go to your application and fill out the form
2. Submit the form
3. Check your Google Sheet to verify that the data was recorded
4. If there are any issues, check the Google Apps Script logs:
   - In the Apps Script editor, go to **Execution Log** to view any errors

## Troubleshooting

If submissions are not appearing in your Google Sheet:

1. Verify that the Web app URL is correctly set in your environment variables
2. Check if there are any errors in the Apps Script execution logs
3. Ensure that your Google Sheet has the correct column headers
4. Try running the `testDoPost` function in the Apps Script editor to verify the script works
5. Check the browser console for any errors when submitting the form

## Notes

- The script is configured to handle the basic form fields. If you add more fields to your form, you'll need to update the script accordingly.
- The "Raw Data" column stores all submitted data as a JSON string, which can be useful for debugging or accessing additional fields.
- If you need to make changes to the script, remember to create a new deployment version after saving your changes. 