import { NextResponse } from 'next/server';
import { getAllCompanies } from '@/utils/companyDatabase';

export async function GET() {
  try {
    const companies = getAllCompanies();
    return NextResponse.json({
      companies: Object.keys(companies),
      count: Object.keys(companies).length
    });
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching companies.' },
      { status: 500 }
    );
  }
} 