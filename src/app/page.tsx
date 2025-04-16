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

export default function Home() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [hasCompared, setHasCompared] = useState(false);
  const [showCTAPopup, setShowCTAPopup] = useState(false);
  const [newCompetitor, setNewCompetitor] = useState('');
  const [isComparing, setIsComparing] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors, isSubmitting },
  } = useForm<FormSchema>({
    resolver: zodResolver(formSchemaOnSubmit),
    mode: 'onChange',
  });

  const companyName = watch('companyName');
  const email = watch('email');
  const isFormFillable = !!companyName && !!email;

  const onSubmit = async (data: FormSchema) => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An error occurred');
      }

      const result = await response.json();
      setComparisonResult(result);
      setHasCompared(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#2F3295] to-[#4B4DC7] relative overflow-x-hidden">
      {isLoading && <LoadingScreen />}
      
      {/* Background effects */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-[#FE619E]/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-[#2F3295]/30 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 py-12 relative z-10 min-h-[90vh]" id="resultsContainer">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 drop-shadow-md">
            Workbrand Comparison Tool <sup className="text-sm md:text-base font-medium">BETA</sup>
          </h1>
          <p className="text-gray-100 text-lg max-w-2xl mx-auto">
            {!comparisonResult 
              ? "Use our beta, AI-driven Workbrand Score™ to compare your employer brand against other organizations. Write in a competitor or choose one of the featured organizations."
              : "Here's how your Workbrand Score™ compares to the selected competition."}
          </p>
        </div>

        {!comparisonResult ? (
          <div className="max-w-4xl mx-auto glass rounded-xl shadow-xl overflow-hidden">
            <div className="p-6">
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label htmlFor="companyName" className="block text-sm font-medium text-white mb-2">
                    Your Company Name
                  </label>
                  <input
                    type="text"
                    id="companyName"
                    {...register('companyName')}
                    className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 focus:border-[#FE619E] text-white placeholder-white/50"
                    placeholder="Enter your company name"
                  />
                  {errors.companyName && (
                    <p className="mt-1 text-[#FE619E] text-sm">{errors.companyName.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-white mb-2">
                    Your Email
                  </label>
                  <input
                    type="email"
                    id="email"
                    {...register('email')}
                    className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 focus:border-[#FE619E] text-white placeholder-white/50"
                    placeholder="Enter your email"
                  />
                  {errors.email && (
                    <p className="mt-1 text-[#FE619E] text-sm">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="competitorName" className="block text-sm font-medium text-white mb-2">
                    Competitor Name
                  </label>
                  <input
                    type="text"
                    id="competitorName"
                    {...register('competitorName')}
                    className="w-full px-4 py-2 rounded-md bg-white/10 border border-white/20 focus:border-[#FE619E] text-white placeholder-white/50"
                    placeholder="Enter competitor name"
                  />
                  {errors.competitorName && (
                    <p className="mt-1 text-[#FE619E] text-sm">{errors.competitorName.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={!isFormFillable || isSubmitting}
                  className={`w-full py-3 px-4 rounded-md font-medium transition-all duration-300 ${
                    isFormFillable
                      ? 'bg-[#FE619E] hover:bg-[#FE619E]/90 text-white'
                      : 'bg-white/10 text-white/50 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <div className="flex items-center justify-center">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                      Processing...
                    </div>
                  ) : (
                    'Run Comparison'
                  )}
                </button>
              </form>
            </div>

            {/* Featured Companies Section */}
            <div className="p-6 bg-white/5 border-t border-white/10">
              <h3 className="text-lg font-semibold text-white mb-4">Featured Organizations</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => {
                    setValue('competitorName', 'Google');
                    trigger('competitorName');
                    // Run comparison if form is ready
                    if (companyName && email) {
                      handleSubmit(onSubmit)();
                    }
                  }}
                  className="glass p-4 rounded-lg flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#FE619E]/10 hover:-translate-y-1"
                >
                  <div className="w-32 h-24 relative">
                    <Image
                      src="/images/google-logo.png"
                      alt="Google logo"
                      fill
                      style={{ objectFit: 'contain' }}
                      priority
                    />
                  </div>
                </button>

                <button
                  onClick={() => {
                    setValue('competitorName', 'Walmart');
                    trigger('competitorName');
                    // Run comparison if form is ready
                    if (companyName && email) {
                      handleSubmit(onSubmit)();
                    }
                  }}
                  className="glass p-4 rounded-lg flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#FE619E]/10 hover:-translate-y-1"
                >
                  <div className="w-32 h-24 relative">
                    <Image
                      src="/images/walmart-logo.png"
                      alt="Walmart logo"
                      fill
                      style={{ objectFit: 'contain' }}
                      priority
                    />
                  </div>
                </button>

                <button
                  onClick={() => {
                    setValue('competitorName', 'HubSpot');
                    trigger('competitorName');
                    // Run comparison if form is ready
                    if (companyName && email) {
                      handleSubmit(onSubmit)();
                    }
                  }}
                  className="glass p-4 rounded-lg flex flex-col items-center transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-[#FE619E]/10 hover:-translate-y-1"
                >
                  <div className="w-32 h-24 relative">
                    <Image
                      src="/images/hubspot-logo.png"
                      alt="HubSpot logo"
                      fill
                      style={{ objectFit: 'contain' }}
                      priority
                    />
                  </div>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto space-y-8">
            {/* ... rest of your comparison result JSX ... */}
          </div>
        )}
      </div>
    </main>
  );
}

