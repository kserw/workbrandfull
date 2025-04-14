import { NextRequest, NextResponse } from 'next/server';

// Google Sheet URL to store form data
const SHEET_URL = process.env.GOOGLE_SHEET_WEBHOOK_URL;

export async function POST(request: NextRequest) {
  try {
    const { companyName, email, competitorName } = await request.json();

    if (!companyName || !email) {
      return NextResponse.json(
        { error: 'Company name and email are required' },
        { status: 400 }
      );
    }

    if (!SHEET_URL) {
      console.error('Google Sheet webhook URL is not configured');
      // Return success even if the sheet submission fails to not block the user
      return NextResponse.json({ success: true });
    }

    // Get timestamp in human-readable format
    const timestamp = new Date().toISOString();

    console.log(`Submitting to Google Sheet: ${companyName}, ${email}, ${competitorName}`);

    // Send data to Google Sheet using a webhook URL
    // This URL should be configured in Google Sheets using the Apps Script
    try {
      const response = await fetch(SHEET_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp,
          companyName,
          email,
          competitorName: competitorName || 'None'
        }),
      });

      if (!response.ok) {
        console.error('Failed to submit to Google Sheet:', await response.text());
        console.error('Response status:', response.status);
      } else {
        const responseData = await response.json();
        console.log('Google Sheet response:', responseData);
      }
    } catch (fetchError) {
      console.error('Error submitting to Google Sheet:', fetchError);
    }

    // Return success even if the sheet submission fails to not block the user
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error submitting form to Google Sheet:', error);
    // Return success even if there was an error to not block the user
    return NextResponse.json({ success: true });
  }
} 