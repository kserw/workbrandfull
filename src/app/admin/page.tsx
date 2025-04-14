'use client';

import Link from 'next/link';

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2F3295] to-[#4B4DC7] text-white p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <Link 
            href="/"
            className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white font-medium"
          >
            Return to Home
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-2xl text-gray-800 font-semibold mb-4">Form Submissions</h2>
            <p className="text-gray-600 mb-4">
              View all form submissions recorded in the database, including company names, 
              email addresses, and timestamps.
            </p>
            <Link 
              href="/admin/submissions"
              className="inline-block bg-[#FF629F] hover:bg-pink-600 px-4 py-2 rounded-md text-white font-medium"
            >
              View Submissions
            </Link>
          </div>
          
          <div className="bg-white shadow-md rounded-lg p-6 hover:shadow-lg transition-shadow">
            <h2 className="text-2xl text-gray-800 font-semibold mb-4">Google Sheets Integration</h2>
            <p className="text-gray-600 mb-4">
              Follow the setup guide to configure the Google Sheets integration for storing form submissions.
            </p>
            <div className="flex gap-3">
              <a 
                href="/setup-google-sheet.md"
                target="_blank"
                className="inline-block bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-white font-medium"
              >
                View Setup Guide
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 