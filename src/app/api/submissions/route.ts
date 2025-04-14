import { NextResponse } from 'next/server';
import { getAllCompanies } from '@/utils/companyDatabase';

export async function GET() {
  try {
    const companies = getAllCompanies();
    
    // Transform the data to include company name and email
    const submissions = Object.entries(companies).map(([name, data]) => ({
      companyName: name,
      email: data.email || 'No email provided',
      timestamp: data.timestamp || new Date().toISOString(),
    })).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()); // Sort by timestamp descending
    
    return NextResponse.json({
      submissions,
      count: submissions.length
    });
  } catch (error) {
    console.error('Error fetching submissions:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching submissions.' },
      { status: 500 }
    );
  }
} 