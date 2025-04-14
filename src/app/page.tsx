'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Image from 'next/image';
import { formSchemaOnChange, formSchemaOnSubmit, FormSchema } from '@/utils/validation';
import CompetitorCard from '@/components/CompetitorCard';
import LoadingScreen from '@/components/LoadingScreen';
import CTAPopup from '@/components/CTAPopup';
import ComparisonChart from '@/components/ComparisonChart';
import ResultTabs from '@/components/ResultTabs';
import { ComparisonResult } from '@/types';
import { capitalizeText } from '@/utils/formatting';

// Function to transform EVP statement from first-person to third-person
const transformEvpStatement = (evpStatement: string | undefined | null, companyName: string): string => {
  // If evpStatement is null or undefined, return a default message
  if (!evpStatement) {
    return `${capitalizeText(companyName)} is committed to fostering a positive work environment for its employees.`;
  }
  
  // Capitalize company name for consistency in the EVP statement
  const capitalizedCompanyName = capitalizeText(companyName);
  
  // Replace "At [Company], we" with "[Company]"
  let transformed = evpStatement.replace(new RegExp(`At ${companyName},\\s*we`, 'i'), `${capitalizedCompanyName}`);
  
  // Replace "We" or "Our" at the beginning of sentences with "[Company]"
  transformed = transformed.replace(/(\.\s+)(We|Our)/g, `$1${capitalizedCompanyName}`);
  
  // Replace "we" with "they" or more specific terms
  transformed = transformed.replace(/\bwe\b/gi, 'they');
  
  // Replace "our" with "their" or more specific terms
  transformed = transformed.replace(/\bour\b/gi, 'their');
  
  // Replace "We're" with "[Company] is"
  transformed = transformed.replace(/\bWe're\b/g, `${capitalizedCompanyName} is`);
  
  // Replace "We are" with "[Company] is"
  transformed = transformed.replace(/\bWe are\b/g, `${capitalizedCompanyName} is`);
  
  return transformed;
};

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [hasCompared, setHasCompared] = useState(false);
  const [showCTAPopup, setShowCTAPopup] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState('');
  const [isComparing, setIsComparing] = useState(false);
  
  // Reset scroll position when component mounts
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, []);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    trigger,
    formState: { errors, isValid, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchemaOnSubmit),
    mode: 'onChange',
    defaultValues: {
      companyName: '',
      email: '',
      competitorName: '',
    },
  });

  const companyName = watch('companyName');
  const competitorName = watch('competitorName');
  const email = watch('email');
  
  // Check if basic requirements are met to enable the button
  const isFormFillable = !!companyName && !!competitorName && !!email;

  const onSubmit = async (data: FormSchema) => {
    try {
      setIsLoading(true);
      setError(null);

      // First submit the form data to the server (for lead capture)
      await fetch('/api/submit-form', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: data.companyName,
          email: data.email,
          competitorName: data.competitorName
        }),
      });

      // Then make the API call to analyze the companies
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: data.companyName,
          competitorName: data.competitorName,
          email: data.email,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An error occurred');
      }

      const result = await response.json();
      setComparisonResult(result);
      setIsLoading(false);
    } catch (err) {
      setIsLoading(false);
      setError(err instanceof Error ? err.message : 'An error occurred');
    }
  };

  // Function to handle trying a different competitor
  const handleTryDifferentCompetitor = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCompetitor || !comparisonResult) return;
    
    try {
      setIsComparing(true);
      setError(null);
      
      // Make the API call to analyze with the new competitor
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          companyName: comparisonResult.userCompany.companyName || getValues('companyName'),
          competitorName: newCompetitor,
          email: getValues('email'),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An error occurred');
      }

      const result = await response.json();
      setComparisonResult(result);
      setNewCompetitor('');
      
      // Scroll to top to show the new results
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsComparing(false);
    }
  };

  return (
    <main className="min-h-screen relative" id="mainContent">
      {/* Tech pattern background */}
      <div className="tech-pattern"></div>
      
      {/* Background gradient elements */}
      <div className="absolute top-20 right-[10%] w-44 h-44 bg-white opacity-[0.03] rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-[5%] w-72 h-72 bg-[#FE619E] opacity-[0.08] rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-[15%] w-64 h-64 bg-white opacity-[0.05] rounded-full blur-3xl"></div>
      <div className="absolute -bottom-20 left-1/4 w-96 h-96 bg-gradient-to-r from-[#FE619E] to-[#FE619E]/60 opacity-[0.07] rounded-full blur-3xl"></div>
      
      {/* Add footer gradient for smooth transition */}
      <div className="footer-gradient"></div>
      
      {isLoading && <LoadingScreen />}
      <CTAPopup isOpen={showCTAPopup} onClose={() => setShowCTAPopup(false)} />

      <div className="container mx-auto px-4 py-12 relative z-10 min-h-[90vh]" id="resultsContainer">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">
            Workbrand Comparison Tool <sup className="text-sm md:text-base font-medium">BETA</sup>
          </h1>
          <p className="text-gray-100 text-lg max-w-2xl mx-auto">
            {!comparisonResult 
              ? "Use our beta, AI-driven Workbrand Score™ to compare your employer brand against other organizations."
              : "Here's how your Workbrand Score™ compares to the selected competition."}
          </p>
        </div>

        {!comparisonResult ? (
          <div className="max-w-4xl mx-auto glass rounded-xl shadow-xl overflow-hidden">
            <div className="p-10">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="companyName" className="block text-sm font-medium text-gray-200 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1.5 text-[#FE619E]">
                        <path fillRule="evenodd" d="M4.5 2.25a.75.75 0 000 1.5v16.5h-.75a.75.75 0 000 1.5h16.5a.75.75 0 000-1.5h-.75V3.75a.75.75 0 000-1.5h-15zm10.5 4.5a.75.75 0 00-1.5 0v8.25a.75.75 0 001.5 0V6.75z" clipRule="evenodd" />
                        <path d="M14.25 5.25a5.23 5.23 0 00-1.279-3.434 9.768 9.768 0 016.963 6.963A5.23 5.23 0 0016.5 7.5h-1.875a.375.375 0 01-.375-.375V5.25z" />
                      </svg>
                      Organization Name
                    </label>
                    <input
                      id="companyName"
                      type="text"
                      className={`modern-input ${
                        errors.companyName ? 'border-red-500 ring-1 ring-red-500' : ''
                      }`}
                      placeholder="Enter your organization name"
                      {...register('companyName')}
                    />
                    {errors.companyName && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 mr-1">
                          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                        </svg>
                        {errors.companyName.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-200 mb-2 flex items-center">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1.5 text-[#FE619E]">
                        <path d="M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67z" />
                        <path d="M22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z" />
                      </svg>
                      Email Address
                    </label>
                    <input
                      id="email"
                      type="email"
                      className={`modern-input ${
                        errors.email ? 'border-red-500 ring-1 ring-red-500' : ''
                      }`}
                      placeholder="Enter your email address"
                      {...register('email')}
                    />
                    {errors.email && (
                      <p className="mt-1 text-sm text-red-500 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-3.5 h-3.5 mr-1">
                          <path fillRule="evenodd" d="M2.25 12c0-5.385 4.365-9.75 9.75-9.75s9.75 4.365 9.75 9.75-4.365 9.75-9.75 9.75S2.25 17.385 2.25 12zM12 8.25a.75.75 0 01.75.75v3.75a.75.75 0 01-1.5 0V9a.75.75 0 01.75-.75zm0 8.25a.75.75 0 100-1.5.75.75 0 000 1.5z" clipRule="evenodd" />
                        </svg>
                        {errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="mb-6">
                  <label 
                    htmlFor="competitorName"
                    className="flex items-center text-white font-semibold mb-2"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 mr-1.5 text-[#FE619E]">
                      <path fillRule="evenodd" d="M12.516 2.17a.75.75 0 00-1.032 0 11.209 11.209 0 01-7.877 3.08.75.75 0 00-.722.515A12.74 12.74 0 002.25 9.75c0 5.942 4.064 10.933 9.563 12.348a.75.75 0 00.374 0c5.499-1.415 9.563-6.406 9.563-12.348 0-1.39-.223-2.73-.635-3.985a.75.75 0 00-.722-.516l.11.168A11.209 11.209 0 0112.516 2.17z" clipRule="evenodd" />
                      <path d="M10.5 8.1v1.07a3 3 0 01.61 1.83v3a3 3 0 01-3 3h-.1a3 3 0 01-3-3v-3a3 3 0 01.59-1.8v-1.07A4.5 4.5 0 0110.5 8.1z" />
                    </svg>
                    Competitor Name
                  </label>
                  <input
                    id="competitorName"
                    type="text"
                    placeholder="Enter competitor name to compare against"
                    className="modern-input"
                    {...register('competitorName')}
                  />
                  {errors.competitorName && (
                    <p className="text-red-500 mt-2">{errors.competitorName.message}</p>
                  )}
                </div>

                {error && (
                  <div className="bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-5 py-4 rounded-xl flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500 mr-2 flex-shrink-0">
                      <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                    </svg>
                    <p className="text-sm font-medium">{error}</p>
                  </div>
                )}

                <div className="flex justify-center">
                  <button
                    type="submit"
                    className="btn-primary py-3 px-6 rounded-lg flex items-center"
                    disabled={!isFormFillable || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Processing...
                      </>
                    ) : (
                      <>
                        Compare Employer Brands
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-2">
                          <path fillRule="evenodd" d="M12.97 3.97a.75.75 0 011.06 0l7.5 7.5a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 11-1.06-1.06l6.22-6.22H3a.75.75 0 010-1.5h16.19l-6.22-6.22a.75.75 0 010-1.06z" clipRule="evenodd" />
                        </svg>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-8">
            <div className="glass rounded-xl shadow-xl p-6 backdrop-blur-lg">
              <div className="mb-6">
                <div className="relative py-6 px-8 bg-white/70 backdrop-blur-sm rounded-xl shadow-sm">
                  <div className="absolute top-0 left-0 w-1.5 h-full bg-gradient-to-b from-[#FF629F] via-[#FF629F] to-[#FF629F] rounded-l-xl"></div>
                  <div className="flex items-start">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-8 h-8 text-[#2F3295]/30 mr-4 flex-shrink-0">
                      <path fillRule="evenodd" d="M8.25 6.75a3.75 3.75 0 117.5 0 3.75 3.75 0 01-7.5 0zM15.75 9.75a3 3 0 116 0 3 3 0 01-6 0zM2.25 9.75a3 3 0 116 0 3 3 0 01-6 0zM6.31 15.117A6.745 6.745 0 0112 12a6.745 6.745 0 016.709 7.498.75.75 0 01-.372.568A12.696 12.696 0 0112 21.75c-2.305 0-4.47-.612-6.337-1.684a.75.75 0 01-.372-.568 6.787 6.787 0 011.019-4.38z" clipRule="evenodd" />
                      <path d="M5.082 14.254a8.287 8.287 0 00-1.308 5.135 9.687 9.687 0 01-1.764-.44l-.115-.04a.563.563 0 01-.373-.487l-.01-.121a3.75 3.75 0 013.57-4.047zM20.226 19.389a8.287 8.287 0 00-1.308-5.135 3.75 3.75 0 013.57 4.047l-.01.121a.563.563 0 01-.373.486l-.115.04c-.567.2-1.156.349-1.764.441z" />
                    </svg>
                    <p className="text-xl leading-relaxed text-gray-800 font-medium italic">
                      {comparisonResult.userCompany && transformEvpStatement(comparisonResult.userCompany.evpStatement, getValues('companyName'))}
                    </p>
                  </div>
                  <div className="mt-4 flex justify-between items-center">
                    <h3 className="text-sm font-semibold uppercase tracking-wider text-[#2F3295]">
                      Employer Value Proposition
                    </h3>
                  </div>
                </div>
              </div>

              <ComparisonChart
                userCompany={comparisonResult.userCompany}
                competitor={comparisonResult.competitor}
                userCompanyName={getValues('companyName')}
                competitorName={comparisonResult.competitorName}
              />
            </div>

            <ResultTabs
              userCompany={comparisonResult.userCompany}
              competitor={comparisonResult.competitor}
              userCompanyName={getValues('companyName')}
              competitorName={comparisonResult.competitorName}
              isLoading={isComparing}
            />

            {/* New Try Different Competitor Box */}
            <div className="mt-12 glass p-6 rounded-lg shadow-lg backdrop-blur-sm">
              <h3 className="text-xl font-bold text-white mb-4 flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 mr-2 text-[#FE619E]">
                  <path fillRule="evenodd" d="M12 5.25a.75.75 0 01.75.75v5.25H18a.75.75 0 010 1.5h-5.25V18a.75.75 0 01-1.5 0v-5.25H6a.75.75 0 010-1.5h5.25V6a.75.75 0 01.75-.75z" clipRule="evenodd" />
                </svg>
                Try a Different Competitor
              </h3>
              <p className="text-white/80 mb-6">
                Want to compare {getValues('companyName')} with another organization? Enter a new competitor name below.
              </p>
              
              <form onSubmit={handleTryDifferentCompetitor} className="flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  className="modern-input flex-grow"
                  placeholder="Enter a new competitor name"
                  value={newCompetitor}
                  onChange={(e) => setNewCompetitor(e.target.value)}
                />
                <button
                  type="submit"
                  className="btn-primary py-3 px-6 rounded-lg flex items-center justify-center whitespace-nowrap"
                  disabled={!newCompetitor || isComparing}
                >
                  {isComparing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Comparing...
                    </>
                  ) : (
                    <>
                      Run Comparison
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 ml-2">
                        <path fillRule="evenodd" d="M16.72 7.72a.75.75 0 011.06 0l3.75 3.75a.75.75 0 010 1.06l-3.75 3.75a.75.75 0 11-1.06-1.06l2.47-2.47H3a.75.75 0 010-1.5h16.19l-2.47-2.47a.75.75 0 010-1.06z" clipRule="evenodd" />
                      </svg>
                    </>
                  )}
                </button>
              </form>
              
              {error && (
                <div className="mt-4 bg-red-50/80 backdrop-blur-sm border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500 mr-2 flex-shrink-0">
                    <path fillRule="evenodd" d="M12 2.25c-5.385 0-9.75 4.365-9.75 9.75s4.365 9.75 9.75 9.75 9.75-4.365 9.75-9.75S17.385 2.25 12 2.25zm-1.72 6.97a.75.75 0 10-1.06 1.06L10.94 12l-1.72 1.72a.75.75 0 101.06 1.06L12 13.06l1.72 1.72a.75.75 0 101.06-1.06L13.06 12l1.72-1.72a.75.75 0 10-1.06-1.06L12 10.94l-1.72-1.72z" clipRule="evenodd" />
                  </svg>
                  <p className="text-sm font-medium">{error}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
