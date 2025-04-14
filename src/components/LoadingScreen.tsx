'use client';

import { useState, useEffect } from 'react';

export default function LoadingScreen() {
  // Array of loading messages to cycle through
  const loadingMessages = [
    "Analyzing your Workbrand...",
    "Compiling competitor data...",
    "Calculating category scores...",
    "Preparing detailed analysis...",
    "Generating comparison report...",
    "Almost ready..."
  ];

  // State to track the current message index
  const [messageIndex, setMessageIndex] = useState(0);

  // Effect to cycle through messages every 2.5 seconds
  useEffect(() => {
    const intervalId = setInterval(() => {
      setMessageIndex((prevIndex) => (prevIndex + 1) % loadingMessages.length);
    }, 2500);

    // Cleanup on unmount
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-[#2F3295]/95 to-[#4B4DC7]/95 backdrop-blur-md flex items-center justify-center z-50">
      <div className="text-center max-w-md p-10 relative">
        {/* Background effects */}
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-[#FE619E]/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-[#2F3295]/30 rounded-full blur-3xl animate-pulse" style={{animationDelay: '1s'}}></div>
        
        <div className="relative glass bg-white/5 p-8 rounded-2xl border border-white/10 shadow-2xl">
          <div className="inline-block relative">
            <div className="w-16 h-16 border-4 border-[#FE619E]/30 border-t-[#FE619E] rounded-full animate-spin mb-6"></div>
          </div>
          
          <div className="h-16 flex items-center justify-center">
            <h2 className="text-2xl font-bold text-white mb-1 drop-shadow-lg">
              {loadingMessages[messageIndex]}
            </h2>
          </div>
          
          <p className="text-white/90 text-lg mt-2">Please wait while we prepare your results.</p>
          
          {/* Progress bar */}
          <div className="mt-6 w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[#FE619E] to-[#FE619E]/70 rounded-full animate-progress"></div>
          </div>
        </div>
      </div>
      
      {/* Add some keyframes for the animations */}
      <style jsx>{`
        @keyframes progress {
          0% { width: 5%; }
          50% { width: 70%; }
          100% { width: 90%; }
        }
      `}</style>
    </div>
  );
} 