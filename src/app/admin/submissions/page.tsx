'use client';

import { useState, useEffect } from 'react';

interface Submission {
  companyName: string;
  email: string;
  timestamp: string;
}

export default function SubmissionsPage() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/submissions');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch submissions');
        }
        
        setSubmissions(data.submissions);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, []);

  // Function to format date in a readable way
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleString();
    } catch (e) {
      return 'Invalid date';
    }
  };

  // Function to download submissions as CSV
  const downloadCSV = () => {
    // CSV header
    let csv = 'Timestamp,Company Name,Email\n';
    
    // Add each submission as a row
    submissions.forEach(submission => {
      const timestamp = submission.timestamp ? `"${formatDate(submission.timestamp)}"` : '""';
      const companyName = `"${submission.companyName.replace(/"/g, '""')}"`;
      const email = `"${submission.email.replace(/"/g, '""')}"`;
      
      csv += `${timestamp},${companyName},${email}\n`;
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `workbrand-submissions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#2F3295] to-[#4B4DC7] text-white p-8">
      <div className="container mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Form Submissions</h1>
          <div className="flex gap-4">
            <button
              onClick={downloadCSV}
              disabled={submissions.length === 0}
              className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md text-white font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Download CSV
            </button>
            <a
              href="/admin"
              className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md text-white font-medium"
            >
              Back to Admin
            </a>
          </div>
        </div>
        
        <div className="bg-white shadow-md rounded-lg p-6">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-[#2F3295] border-t-transparent rounded-full mx-auto mb-4"></div>
              <p className="text-gray-600">Loading submissions...</p>
            </div>
          ) : error ? (
            <div className="bg-red-100 text-red-700 p-4 rounded-md">
              {error}
            </div>
          ) : submissions.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No submissions have been recorded yet.</p>
          ) : (
            <>
              <p className="text-gray-600 mb-4">Total submissions: {submissions.length}</p>
              <div className="overflow-x-auto">
                <table className="w-full text-gray-700 border-collapse">
                  <thead>
                    <tr className="bg-gray-200">
                      <th className="p-3 text-left border border-gray-300">Timestamp</th>
                      <th className="p-3 text-left border border-gray-300">Company Name</th>
                      <th className="p-3 text-left border border-gray-300">Email</th>
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.map((submission, index) => (
                      <tr key={index} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="p-3 border border-gray-300">{formatDate(submission.timestamp)}</td>
                        <td className="p-3 border border-gray-300">{submission.companyName}</td>
                        <td className="p-3 border border-gray-300">{submission.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
} 