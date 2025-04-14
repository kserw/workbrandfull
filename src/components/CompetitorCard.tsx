import Image from 'next/image';
import { useState } from 'react';

interface CompetitorCardProps {
  name: string;
  logo: string;
  value: 'google' | 'walmart' | 'hubspot' | 'nasdaq' | 'loreal' | 'mastercard';
  selected: boolean;
  onSelect: (value: 'google' | 'walmart' | 'hubspot' | 'nasdaq' | 'loreal' | 'mastercard') => void;
}

export default function CompetitorCard({
  name,
  logo,
  value,
  selected,
  onSelect,
}: CompetitorCardProps) {
  return (
    <div
      className={`competitor-card glass relative flex flex-col items-center p-6 cursor-pointer transition-all duration-300 rounded-xl shadow-sm backdrop-blur-sm ${
        selected
          ? 'bg-white/12 border-2 border-[#FE619E] ring-4 ring-[#FE619E]/20'
          : 'border border-white/10 hover:bg-white/12 hover:border-white/30 hover:shadow-lg hover:scale-105 hover:translate-y-[-4px]'
      }`}
      onClick={() => onSelect(value)}
    >
      <div className="w-24 h-24 relative mb-4 transition-all duration-300">
        <Image
          src={logo}
          alt={`${name} logo`}
          fill
          style={{ objectFit: 'contain' }}
        />
      </div>
      <h3 className={`text-lg font-medium transition-colors duration-300 ${selected ? 'text-[#FE619E]' : 'text-white'}`}>{name}</h3>
      
      {selected && (
        <>
          <div className="absolute -top-2 -right-2 w-7 h-7 bg-gradient-to-br from-[#FE619E] to-[#FE619E]/80 rounded-full flex items-center justify-center shadow-lg">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              className="h-4 w-4 text-white"
            >
              <path
                fillRule="evenodd"
                d="M19.916 4.626a.75.75 0 01.208 1.04l-9 13.5a.75.75 0 01-1.154.114l-6-6a.75.75 0 011.06-1.06l5.353 5.353 8.493-12.739a.75.75 0 011.04-.208z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          
          <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-[#FE619E]/80 to-[#FE619E] rounded-b-xl"></div>
        </>
      )}
    </div>
  );
} 